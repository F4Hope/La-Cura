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

type UpdateStaffRequestBody = {
  id?: unknown;
  full_name?: unknown;
  phone?: unknown;
  department?: unknown;
  role?: unknown;
  license_number?: unknown;
  shift?: unknown;
  employment_date?: unknown;
};

type ExistingStaffRecord = {
  id: number;
  auth_user_id: string | null;
  full_name: string;
  phone: string | null;
  department: string | null;
  role: StaffRole;
  license_number: string | null;
  shift: StaffShift | null;
  employment_date: string | null;
  active: boolean | null;
  staff_code: string;
};

type UpdatedStaffRecord = {
  id: number;
  full_name: string;
  phone: string | null;
  department: string | null;
  role: StaffRole;
  license_number: string | null;
  shift: StaffShift | null;
  employment_date: string | null;
  active: boolean | null;
  staff_code: string;
};

const VALID_ROLES: StaffRole[] = [
  "Administrator",
  "Nurse",
  "Physician",
];

const VALID_SHIFTS: StaffShift[] = [
  "Day",
  "Night",
];

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
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .slice(0, maximumLength);

  return normalized || null;
}

function isValidEmploymentDate(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00Z`
  );

  return !Number.isNaN(
    date.getTime()
  );
}

async function isLastActiveAdministrator(
  staffId: number
): Promise<boolean> {
  const {
    count,
    error,
  } = await adminSupabase
    .from("staff")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "role",
      "Administrator"
    )
    .eq("active", true)
    .neq("id", staffId);

  if (error) {
    console.error(
      "Unable to count remaining administrators:",
      error
    );

    throw new Error(
      "Unable to verify administrator coverage."
    );
  }

  return (count ?? 0) === 0;
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

  let body: UpdateStaffRequestBody;

  try {
    body =
      (await request.json()) as UpdateStaffRequestBody;
  } catch {
    return createJsonResponse(
      {
        error:
          "The staff update request was not valid JSON.",
      },
      400
    );
  }

  const staffId =
    typeof body.id === "number"
      ? body.id
      : Number(body.id);

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

  const fullName =
    readRequiredText(
      body.full_name,
      120
    );

  if (fullName.length < 2) {
    return createJsonResponse(
      {
        error:
          "Enter the staff member's full name.",
      },
      400
    );
  }

  const roleText =
    readRequiredText(
      body.role,
      30
    );

  if (
    !VALID_ROLES.includes(
      roleText as StaffRole
    )
  ) {
    return createJsonResponse(
      {
        error:
          "Select a valid staff role.",
      },
      400
    );
  }

  const role =
    roleText as StaffRole;

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

  let shift:
    | StaffShift
    | null = null;

  if (shiftText) {
    if (
      !VALID_SHIFTS.includes(
        shiftText as StaffShift
      )
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

  const employmentDate =
    readOptionalText(
      body.employment_date,
      10
    );

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

  const {
    data: existingStaffData,
    error: existingStaffError,
  } = await adminSupabase
    .from("staff")
    .select(
      "id, auth_user_id, full_name, phone, department, role, license_number, shift, employment_date, active, staff_code"
    )
    .eq("id", staffId)
    .maybeSingle();

  if (existingStaffError) {
    console.error(
      "Unable to load staff before update:",
      existingStaffError
    );

    return createJsonResponse(
      {
        error:
          "Unable to load the staff account.",
      },
      500
    );
  }

  const existingStaff =
    existingStaffData as
      | ExistingStaffRecord
      | null;

  if (!existingStaff) {
    return createJsonResponse(
      {
        error:
          "The staff member was not found.",
      },
      404
    );
  }

  if (
    authorization.administrator.id ===
      staffId &&
    role !== "Administrator"
  ) {
    return createJsonResponse(
      {
        error:
          "You cannot remove your own administrator role.",
      },
      400
    );
  }

  if (
    existingStaff.role ===
      "Administrator" &&
    role !== "Administrator"
  ) {
    try {
      const lastAdministrator =
        await isLastActiveAdministrator(
          staffId
        );

      if (lastAdministrator) {
        return createJsonResponse(
          {
            error:
              "La-Cura must retain at least one active administrator.",
          },
          400
        );
      }
    } catch (error) {
      console.error(
        "Administrator-role validation failed:",
        error
      );

      return createJsonResponse(
        {
          error:
            "Unable to verify administrator coverage.",
        },
        500
      );
    }
  }

  const updateValues = {
    full_name: fullName,
    phone,
    department,
    role,
    license_number:
      licenseNumber,
    shift,
    employment_date:
      employmentDate,
  };

  const {
    data: updatedStaffData,
    error: updateError,
  } = await adminSupabase
    .from("staff")
    .update(updateValues)
    .eq("id", staffId)
    .select(
      "id, full_name, phone, department, role, license_number, shift, employment_date, active, staff_code"
    )
    .single();

  if (
    updateError ||
    !updatedStaffData
  ) {
    console.error(
      "Staff database update failed:",
      updateError
    );

    return createJsonResponse(
      {
        error:
          updateError?.code ===
          "23505"
            ? "A conflicting staff record already exists."
            : "Unable to update the staff member.",
      },
      updateError?.code ===
        "23505"
        ? 409
        : 400
    );
  }

  if (existingStaff.auth_user_id) {
    const {
      error: authUpdateError,
    } =
      await adminSupabase.auth.admin.updateUserById(
        existingStaff.auth_user_id,
        {
          user_metadata: {
            full_name:
              fullName,

            role,

            staff_code:
              existingStaff.staff_code,
          },
        }
      );

    if (authUpdateError) {
      console.error(
        "Unable to update authentication metadata:",
        authUpdateError
      );

      const {
        error: rollbackError,
      } = await adminSupabase
        .from("staff")
        .update({
          full_name:
            existingStaff.full_name,

          phone:
            existingStaff.phone,

          department:
            existingStaff.department,

          role:
            existingStaff.role,

          license_number:
            existingStaff.license_number,

          shift:
            existingStaff.shift,

          employment_date:
            existingStaff.employment_date,
        })
        .eq("id", staffId);

      if (rollbackError) {
        console.error(
          "Unable to roll back staff update:",
          rollbackError
        );
      }

      return createJsonResponse(
        {
          error:
            "The staff account could not be synchronized with authentication. No changes were saved.",
        },
        500
      );
    }
  }

  const updatedStaff =
    updatedStaffData as UpdatedStaffRecord;

  return createJsonResponse(
    {
      success: true,

      message:
        "Staff information updated successfully.",

      staff: {
        id:
          updatedStaff.id,

        fullName:
          updatedStaff.full_name,

        phone:
          updatedStaff.phone,

        department:
          updatedStaff.department,

        role:
          updatedStaff.role,

        licenseNumber:
          updatedStaff.license_number,

        shift:
          updatedStaff.shift,

        employmentDate:
          updatedStaff.employment_date,

        active:
          updatedStaff.active,

        staffCode:
          updatedStaff.staff_code,
      },
    },
    200
  );
}