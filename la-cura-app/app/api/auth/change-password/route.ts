import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChangePasswordRequestBody = {
  newPassword?: unknown;
};

type StaffRecord = {
  id: number;
  auth_user_id: string;
  full_name: string;
  staff_code: string;
  active: boolean | null;
  must_change_password: boolean;
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

function extractBearerToken(
  request: Request
): string | null {
  const authorizationHeader =
    request.headers.get("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] =
    authorizationHeader.split(" ");

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token?.trim()
  ) {
    return null;
  }

  return token.trim();
}

function validatePassword(
  password: string
): string | null {
  if (password.length < 12) {
    return "Your new password must contain at least 12 characters.";
  }

  if (password.length > 128) {
    return "Your new password cannot exceed 128 characters.";
  }

  if (/\s/.test(password)) {
    return "Your new password cannot contain spaces.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Your new password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Your new password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Your new password must contain at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Your new password must contain at least one special character.";
  }

  return null;
}

export async function POST(
  request: Request
) {
  const accessToken =
    extractBearerToken(request);

  if (!accessToken) {
    return createJsonResponse(
      {
        error:
          "Authentication is required.",
      },
      401
    );
  }

  let body: ChangePasswordRequestBody;

  try {
    body =
      (await request.json()) as ChangePasswordRequestBody;
  } catch {
    return createJsonResponse(
      {
        error:
          "The password request was not valid JSON.",
      },
      400
    );
  }

  const newPassword =
    typeof body.newPassword === "string"
      ? body.newPassword
      : "";

  const passwordError =
    validatePassword(newPassword);

  if (passwordError) {
    return createJsonResponse(
      {
        error: passwordError,
      },
      400
    );
  }

  const {
    data: { user },
    error: userError,
  } = await adminSupabase.auth.getUser(
    accessToken
  );

  if (userError || !user) {
    if (userError) {
      console.error(
        "Password-change token verification failed:",
        userError.message
      );
    }

    return createJsonResponse(
      {
        error:
          "Your session is invalid or has expired. Sign in again.",
      },
      401
    );
  }

  const {
    data: staffData,
    error: staffError,
  } = await adminSupabase
    .from("staff")
    .select(
      "id, auth_user_id, full_name, staff_code, active, must_change_password"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (staffError) {
    console.error(
      "Password-change staff lookup failed:",
      staffError
    );

    return createJsonResponse(
      {
        error:
          "Unable to verify the staff account.",
      },
      500
    );
  }

  const staff =
    staffData as StaffRecord | null;

  if (
    !staff ||
    staff.auth_user_id !== user.id
  ) {
    return createJsonResponse(
      {
        error:
          "The staff account could not be found.",
      },
      404
    );
  }

  if (staff.active !== true) {
    return createJsonResponse(
      {
        error:
          "This staff account is inactive.",
      },
      403
    );
  }

  const previousPasswordFlag =
    staff.must_change_password;

  const {
    error: staffUpdateError,
  } = await adminSupabase
    .from("staff")
    .update({
      must_change_password: false,
    })
    .eq("id", staff.id)
    .eq(
      "auth_user_id",
      staff.auth_user_id
    );

  if (staffUpdateError) {
    console.error(
      "Unable to update password-change status:",
      staffUpdateError
    );

    return createJsonResponse(
      {
        error:
          "Unable to prepare the password change.",
      },
      500
    );
  }

  const {
    error: passwordUpdateError,
  } =
    await adminSupabase.auth.admin.updateUserById(
      staff.auth_user_id,
      {
        password: newPassword,
      }
    );

  if (passwordUpdateError) {
    console.error(
      "Supabase password change failed:",
      passwordUpdateError
    );

    const {
      error: rollbackError,
    } = await adminSupabase
      .from("staff")
      .update({
        must_change_password:
          previousPasswordFlag,
      })
      .eq("id", staff.id);

    if (rollbackError) {
      console.error(
        "Unable to restore password-change status:",
        rollbackError
      );
    }

    return createJsonResponse(
      {
        error:
          "Unable to change the password. Try again.",
      },
      400
    );
  }

  return createJsonResponse(
    {
      success: true,

      message:
        "Your password was changed successfully. Sign in again using your new password.",

      staff: {
        id: staff.id,
        fullName: staff.full_name,
        staffCode: staff.staff_code,
      },
    },
    200
  );
}