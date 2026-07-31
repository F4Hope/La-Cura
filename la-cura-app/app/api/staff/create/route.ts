import { randomInt } from "node:crypto";

import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireAdministrator } from "@/lib/server/requireAdministrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StaffRole =
  | "Administrator"
  | "Nurse"
  | "Physician";

type StaffShift =
  | "Day"
  | "Night";

type CreateStaffRequestBody = {
  full_name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  department?: unknown;
  license_number?: unknown;
  shift?: unknown;
  employment_date?: unknown;
};

type CreatedStaffRecord = {
  id: number;
  full_name: string;
  role: StaffRole;
  staff_code: string;
  phone: string | null;
  department: string | null;
  active: boolean;
};

const ROLE_PREFIX: Record<
  StaffRole,
  string
> = {
  Administrator: "ADM",
  Nurse: "NUR",
  Physician: "PHY",
};

function createJsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function readRequiredText(
  value: unknown,
  maximumLength: number
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maximumLength);
}

function readOptionalText(
  value: unknown,
  maximumLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .slice(0, maximumLength);

  return normalized || null;
}

function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidEmploymentDate(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const parsedDate = new Date(
    `${value}T00:00:00Z`
  );

  return !Number.isNaN(
    parsedDate.getTime()
  );
}

function generateTemporaryPassword(): string {
  const uppercase =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const lowercase =
    "abcdefghijkmnopqrstuvwxyz";

  const numbers =
    "23456789";

  const symbols =
    "!@#$%&*";

  const allCharacters =
    uppercase +
    lowercase +
    numbers +
    symbols;

  const passwordCharacters = [
    uppercase[
      randomInt(
        0,
        uppercase.length
      )
    ],

    lowercase[
      randomInt(
        0,
        lowercase.length
      )
    ],

    numbers[
      randomInt(
        0,
        numbers.length
      )
    ],

    symbols[
      randomInt(
        0,
        symbols.length
      )
    ],
  ];

  while (
    passwordCharacters.length < 16
  ) {
    passwordCharacters.push(
      allCharacters[
        randomInt(
          0,
          allCharacters.length
        )
      ]
    );
  }

  for (
    let index =
      passwordCharacters.length - 1;
    index > 0;
    index -= 1
  ) {
    const replacementIndex =
      randomInt(0, index + 1);

    [
      passwordCharacters[index],
      passwordCharacters[
        replacementIndex
      ],
    ] = [
      passwordCharacters[
        replacementIndex
      ],
      passwordCharacters[index],
    ];
  }

  return passwordCharacters.join("");
}

async function generateUniqueStaffCode(
  role: StaffRole
): Promise<string> {
  const prefix = ROLE_PREFIX[role];

  for (
    let attempt = 0;
    attempt < 20;
    attempt += 1
  ) {
    const number = randomInt(
      0,
      1_000_000
    )
      .toString()
      .padStart(6, "0");

    const candidate =
      `LC-${prefix}-${number}`;

    const {
      data,
      error,
    } = await adminSupabase
      .from("staff")
      .select("id")
      .eq(
        "staff_code",
        candidate
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Staff-code availability check failed:",
        error
      );

      throw new Error(
        "Unable to generate a staff code."
      );
    }

    if (!data) {
      return candidate;
    }
  }

  throw new Error(
    "Unable to generate a unique staff code."
  );
}

function createInternalAuthEmail(
  staffCode: string
): string {
  return (
    `${staffCode.toLowerCase()}` +
    "@staff.lacurahealth.com"
  );
}

export async function POST(
  request: Request
) {
  const authorization =
    await requireAdministrator(
      request
    );

  if (!authorization.authorized) {
    return authorization.response;
  }

  let body: CreateStaffRequestBody;

  try {
    body =
      (await request.json()) as CreateStaffRequestBody;
  } catch {
    return createJsonResponse(
      {
        error:
          "The staff request was not valid JSON.",
      },
      400
    );
  }

  const fullName =
    readRequiredText(
      body.full_name,
      120
    );

  const role =
    readRequiredText(
      body.role,
      30
    ) as StaffRole;

  const personalEmail =
    readOptionalText(
      body.email,
      254
    )?.toLowerCase() ?? null;

  const phone =
    readOptionalText(
      body.phone,
      40
    );

  const department =
    readOptionalText(
      body.department,
      100
    );

  const licenseNumber =
    readOptionalText(
      body.license_number,
      100
    );

  const shiftText =
    readOptionalText(
      body.shift,
      20
    );

  const employmentDate =
    readOptionalText(
      body.employment_date,
      10
    );

  if (
    fullName.length < 2
  ) {
    return createJsonResponse(
      {
        error:
          "Enter the staff member's full name.",
      },
      400
    );
  }

  const validRoles:
    StaffRole[] = [
      "Administrator",
      "Nurse",
      "Physician",
    ];

  if (!validRoles.includes(role)) {
    return createJsonResponse(
      {
        error:
          "Select a valid staff role.",
      },
      400
    );
  }

  if (
    personalEmail &&
    !isValidEmail(personalEmail)
  ) {
    return createJsonResponse(
      {
        error:
          "Enter a valid personal email address or leave it blank.",
      },
      400
    );
  }

  let shift: StaffShift | null =
    null;

  if (shiftText) {
    if (
      shiftText !== "Day" &&
      shiftText !== "Night"
    ) {
      return createJsonResponse(
        {
          error:
            "Select a valid staff shift.",
        },
        400
      );
    }

    shift =
      shiftText as StaffShift;
  }

  if (
    employmentDate &&
    !isValidEmploymentDate(
      employmentDate
    )
  ) {
    return createJsonResponse(
      {
        error:
          "Enter a valid employment date.",
      },
      400
    );
  }

  let staffCode: string;

  try {
    staffCode =
      await generateUniqueStaffCode(
        role
      );
  } catch (error) {
    console.error(
      "Unable to create staff code:",
      error
    );

    return createJsonResponse(
      {
        error:
          "La-Cura could not generate a staff code. Try again.",
      },
      500
    );
  }

  const temporaryPassword =
    generateTemporaryPassword();

  const authEmail =
    createInternalAuthEmail(
      staffCode
    );

  let authUserId: string | null =
    null;

  try {
    const {
      data: authData,
      error: authError,
    } =
      await adminSupabase.auth.admin.createUser(
        {
          email: authEmail,

          password:
            temporaryPassword,

          email_confirm: true,

          user_metadata: {
            full_name:
              fullName,

            role,

            staff_code:
              staffCode,
          },
        }
      );

    if (
      authError ||
      !authData.user
    ) {
      console.error(
        "Supabase staff account creation failed:",
        authError
      );

      const duplicateAccount =
        authError?.message
          ?.toLowerCase()
          .includes(
            "already"
          );

      return createJsonResponse(
        {
          error: duplicateAccount
            ? "A matching authentication account already exists. Try creating the staff member again."
            : "Unable to create the staff authentication account.",
        },
        duplicateAccount
          ? 409
          : 400
      );
    }

    authUserId =
      authData.user.id;

    const {
      data: staffData,
      error: staffError,
    } = await adminSupabase
      .from("staff")
      .insert({
        auth_user_id:
          authUserId,

        full_name:
          fullName,

        email:
          personalEmail,

        phone,

        role,

        department,

        license_number:
          licenseNumber,

        shift,

        employment_date:
          employmentDate,

        active: true,

        staff_code:
          staffCode,

        auth_email:
          authEmail,

        must_change_password:
          true,

        credentials_created_at:
          new Date().toISOString(),
      })
      .select(
        "id, full_name, role, staff_code, phone, department, active"
      )
      .single();

    if (
      staffError ||
      !staffData
    ) {
      console.error(
        "Staff database record creation failed:",
        staffError
      );

      const {
        error: cleanupError,
      } =
        await adminSupabase.auth.admin.deleteUser(
          authUserId
        );

      if (cleanupError) {
        console.error(
          "Unable to remove orphaned authentication account:",
          cleanupError
        );
      }

      const duplicateRecord =
        staffError?.code ===
        "23505";

      return createJsonResponse(
        {
          error: duplicateRecord
            ? "A staff member with matching credentials already exists."
            : "Unable to save the staff record.",
        },
        duplicateRecord
          ? 409
          : 400
      );
    }

    const staff =
      staffData as CreatedStaffRecord;

    return createJsonResponse(
      {
        success: true,

        message:
          "Staff account created. Copy the credentials now because the temporary password will not be displayed again.",

        credentials: {
          staffCode:
            staff.staff_code,

          temporaryPassword,
        },

        staff: {
          id: staff.id,

          fullName:
            staff.full_name,

          role:
            staff.role,

          phone:
            staff.phone,

          department:
            staff.department,

          active:
            staff.active,
        },
      },
      201
    );
  } catch (error) {
    console.error(
      "Unexpected staff creation failure:",
      error
    );

    if (authUserId) {
      const {
        error: cleanupError,
      } =
        await adminSupabase.auth.admin.deleteUser(
          authUserId
        );

      if (cleanupError) {
        console.error(
          "Unable to clean up authentication account after failure:",
          cleanupError
        );
      }
    }

    return createJsonResponse(
      {
        error:
          "An unexpected error occurred while creating the staff account.",
      },
      500
    );
  }
}