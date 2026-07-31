import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireAdministrator } from "@/lib/server/requireAdministrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ToggleStatusRequestBody = {
  staffId?: unknown;
  active?: unknown;
};

type StaffRecord = {
  id: number;
  auth_user_id: string | null;
  full_name: string;
  role: string;
  staff_code: string;
  active: boolean | null;
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

async function countOtherActiveAdministrators(
  staffId: number
): Promise<number> {
  const { count, error } =
    await adminSupabase
      .from("staff")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "Administrator")
      .eq("active", true)
      .neq("id", staffId);

  if (error) {
    console.error(
      "Unable to count active administrators:",
      error
    );

    throw new Error(
      "Unable to verify administrator coverage."
    );
  }

  return count ?? 0;
}

export async function POST(
  request: Request
) {
  const authorization =
    await requireAdministrator(request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  let body: ToggleStatusRequestBody;

  try {
    body =
      (await request.json()) as ToggleStatusRequestBody;
  } catch {
    return createJsonResponse(
      {
        error:
          "The staff-status request was not valid JSON.",
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

  if (typeof body.active !== "boolean") {
    return createJsonResponse(
      {
        error:
          "A valid account status is required.",
      },
      400
    );
  }

  const requestedActiveStatus =
    body.active;

  const {
    data: staffData,
    error: staffError,
  } = await adminSupabase
    .from("staff")
    .select(
      "id, auth_user_id, full_name, role, staff_code, active"
    )
    .eq("id", staffId)
    .maybeSingle();

  if (staffError) {
    console.error(
      "Unable to load staff account:",
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

  if (!staff) {
    return createJsonResponse(
      {
        error:
          "The staff member was not found.",
      },
      404
    );
  }

  if (
    staff.active ===
    requestedActiveStatus
  ) {
    return createJsonResponse(
      {
        success: true,

        message: requestedActiveStatus
          ? "The staff account is already active."
          : "The staff account is already inactive.",

        staff: {
          id: staff.id,
          fullName: staff.full_name,
          role: staff.role,
          staffCode: staff.staff_code,
          active:
            requestedActiveStatus,
        },
      },
      200
    );
  }

  if (
    authorization.administrator.id ===
      staff.id &&
    requestedActiveStatus === false
  ) {
    return createJsonResponse(
      {
        error:
          "You cannot deactivate your own administrator account.",
      },
      400
    );
  }

  if (
    staff.role === "Administrator" &&
    requestedActiveStatus === false
  ) {
    try {
      const remainingAdministrators =
        await countOtherActiveAdministrators(
          staff.id
        );

      if (
        remainingAdministrators === 0
      ) {
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
        "Administrator coverage check failed:",
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

  const {
    data: updatedStaffData,
    error: updateError,
  } = await adminSupabase
    .from("staff")
    .update({
      active: requestedActiveStatus,
    })
    .eq("id", staff.id)
    .select(
      "id, full_name, role, staff_code, active"
    )
    .single();

  if (
    updateError ||
    !updatedStaffData
  ) {
    console.error(
      "Staff status update failed:",
      updateError
    );

    return createJsonResponse(
      {
        error:
          requestedActiveStatus
            ? "Unable to activate the staff account."
            : "Unable to deactivate the staff account.",
      },
      500
    );
  }

  return createJsonResponse(
    {
      success: true,

      message: requestedActiveStatus
        ? "The staff account was activated successfully."
        : "The staff account was deactivated successfully.",

      staff: {
        id: updatedStaffData.id,
        fullName:
          updatedStaffData.full_name,
        role:
          updatedStaffData.role,
        staffCode:
          updatedStaffData.staff_code,
        active:
          updatedStaffData.active,
      },
    },
    200
  );
}