import { randomInt } from "node:crypto";

import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireAdministrator } from "@/lib/server/requireAdministrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResetPasswordRequestBody = {
  staffId?: unknown;
};

type StaffRecord = {
  id: number;
  auth_user_id: string;
  full_name: string;
  role: string;
  staff_code: string;
  active: boolean | null;
  must_change_password: boolean;
  credentials_created_at: string | null;
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

  const characters = [
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

  while (characters.length < 16) {
    characters.push(
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
      characters.length - 1;
    index > 0;
    index -= 1
  ) {
    const replacementIndex =
      randomInt(0, index + 1);

    [
      characters[index],
      characters[
        replacementIndex
      ],
    ] = [
      characters[
        replacementIndex
      ],
      characters[index],
    ];
  }

  return characters.join("");
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

  let body: ResetPasswordRequestBody;

  try {
    body =
      (await request.json()) as ResetPasswordRequestBody;
  } catch {
    return createJsonResponse(
      {
        error:
          "The password-reset request was not valid JSON.",
      },
      400
    );
  }

  const staffId =
    typeof body.staffId === "number"
      ? body.staffId
      : Number(body.staffId);

  if (
    !Number.isInteger(staffId) ||
    staffId <= 0
  ) {
    return createJsonResponse(
      {
        error:
          "A valid staff member is required.",
      },
      400
    );
  }

  const {
    data: staffData,
    error: staffError,
  } = await adminSupabase
    .from("staff")
    .select(
      "id, auth_user_id, full_name, role, staff_code, active, must_change_password, credentials_created_at"
    )
    .eq("id", staffId)
    .maybeSingle();

  if (staffError) {
    console.error(
      "Staff password-reset lookup failed:",
      staffError
    );

    return createJsonResponse(
      {
        error:
          "Unable to load the staff account.",
      },
      500
    );
  }

  const staff =
    staffData as StaffRecord | null;

  if (
    !staff ||
    !staff.auth_user_id ||
    !staff.staff_code
  ) {
    return createJsonResponse(
      {
        error:
          "The staff authentication account was not found.",
      },
      404
    );
  }

  if (staff.active !== true) {
    return createJsonResponse(
      {
        error:
          "Activate this staff account before resetting its password.",
      },
      400
    );
  }

  const temporaryPassword =
    generateTemporaryPassword();

  const credentialsCreatedAt =
    new Date().toISOString();

  const {
    error: staffUpdateError,
  } = await adminSupabase
    .from("staff")
    .update({
      must_change_password: true,
      credentials_created_at:
        credentialsCreatedAt,
    })
    .eq("id", staff.id);

  if (staffUpdateError) {
    console.error(
      "Unable to prepare staff password reset:",
      staffUpdateError
    );

    return createJsonResponse(
      {
        error:
          "Unable to prepare the password reset.",
      },
      500
    );
  }

  const {
    error: authUpdateError,
  } =
    await adminSupabase.auth.admin.updateUserById(
      staff.auth_user_id,
      {
        password:
          temporaryPassword,

        user_metadata: {
          full_name:
            staff.full_name,

          role:
            staff.role,

          staff_code:
            staff.staff_code,
        },
      }
    );

  if (authUpdateError) {
    console.error(
      "Supabase password reset failed:",
      authUpdateError
    );

    const {
      error: rollbackError,
    } = await adminSupabase
      .from("staff")
      .update({
        must_change_password:
          staff.must_change_password,

        credentials_created_at:
          staff.credentials_created_at,
      })
      .eq("id", staff.id);

    if (rollbackError) {
      console.error(
        "Unable to roll back staff reset status:",
        rollbackError
      );
    }

    return createJsonResponse(
      {
        error:
          "Unable to reset the staff password.",
      },
      400
    );
  }

  return createJsonResponse(
    {
      success: true,

      message:
        "A new temporary password was created. Copy it now because it will not be displayed again.",

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
      },
    },
    200
  );
}