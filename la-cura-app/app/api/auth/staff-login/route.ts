import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginRequestBody = {
  staffCode?: unknown;
  password?: unknown;
};

type LoginAttempt = {
  count: number;
  resetAt: number;
};

type StaffLoginRecord = {
  id: number;
  auth_user_id: string;
  full_name: string;
  role: string;
  staff_code: string;
  auth_email: string;
  active: boolean | null;
  must_change_password: boolean;
};

const LOGIN_WINDOW_MS =
  15 * 60 * 1000;

const MAX_LOGIN_ATTEMPTS = 8;

const loginAttempts = new Map<
  string,
  LoginAttempt
>();

function normalizeStaffCode(
  value: string
): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function getClientIp(
  request: Request
): string {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwardedFor) {
    const firstAddress =
      forwardedFor
        .split(",")[0]
        ?.trim();

    if (firstAddress) {
      return firstAddress;
    }
  }

  return (
    request.headers.get(
      "x-real-ip"
    ) || "unknown"
  );
}

function isRateLimited(
  clientIp: string
): boolean {
  const now = Date.now();

  const existingAttempt =
    loginAttempts.get(clientIp);

  if (
    !existingAttempt ||
    existingAttempt.resetAt <= now
  ) {
    loginAttempts.set(clientIp, {
      count: 1,
      resetAt:
        now + LOGIN_WINDOW_MS,
    });

    return false;
  }

  const updatedAttempt: LoginAttempt = {
    count:
      existingAttempt.count + 1,

    resetAt:
      existingAttempt.resetAt,
  };

  loginAttempts.set(
    clientIp,
    updatedAttempt
  );

  return (
    updatedAttempt.count >
    MAX_LOGIN_ATTEMPTS
  );
}

function invalidCredentialsResponse() {
  return NextResponse.json(
    {
      error:
        "Invalid staff code or password.",
    },
    {
      status: 401,

      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(
  request: Request
) {
  const clientIp =
    getClientIp(request);

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        error:
          "Too many login attempts. Wait 15 minutes and try again.",
      },
      {
        status: 429,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  let body: LoginRequestBody;

  try {
    body =
      (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      {
        error:
          "The login request was not valid.",
      },
      {
        status: 400,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const staffCode =
    typeof body.staffCode ===
    "string"
      ? normalizeStaffCode(
          body.staffCode
        )
      : "";

  const password =
    typeof body.password ===
    "string"
      ? body.password
      : "";

  if (
    !staffCode ||
    !password ||
    password.length > 200
  ) {
    return invalidCredentialsResponse();
  }

  const validStaffCode =
    /^LC-(ADM|NUR|PHY|STF)-[0-9]{6,}$/.test(
      staffCode
    );

  if (!validStaffCode) {
    return invalidCredentialsResponse();
  }

  try {
    const {
      data: staffData,
      error: staffError,
    } = await adminSupabase
      .from("staff")
      .select(
        "id, auth_user_id, full_name, role, staff_code, auth_email, active, must_change_password"
      )
      .eq(
        "staff_code",
        staffCode
      )
      .maybeSingle();

    if (staffError) {
      console.error(
        "Staff-code lookup failed:",
        staffError
      );

      return invalidCredentialsResponse();
    }

    const staff =
      staffData as
        | StaffLoginRecord
        | null;

    if (
      !staff ||
      staff.active !== true ||
      !staff.auth_email ||
      !staff.auth_user_id
    ) {
      return invalidCredentialsResponse();
    }

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      console.error(
        "Supabase login environment variables are missing."
      );

      return NextResponse.json(
        {
          error:
            "Staff login is not configured.",
        },
        {
          status: 503,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    const authSupabase =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,

            detectSessionInUrl:
              false,
          },
        }
      );

    const {
      data: authData,
      error: authError,
    } =
      await authSupabase.auth.signInWithPassword(
        {
          email:
            staff.auth_email,

          password,
        }
      );

    if (
      authError ||
      !authData.session ||
      !authData.user
    ) {
      return invalidCredentialsResponse();
    }

    if (
      authData.user.id !==
      staff.auth_user_id
    ) {
      console.error(
        "Authenticated user does not match the staff record.",
        {
          staffId: staff.id,
        }
      );

      await authSupabase.auth.signOut();

      return invalidCredentialsResponse();
    }

    loginAttempts.delete(
      clientIp
    );

    return NextResponse.json(
      {
        accessToken:
          authData.session
            .access_token,

        refreshToken:
          authData.session
            .refresh_token,

        mustChangePassword:
          staff.must_change_password ===
          true,

        staff: {
          id: staff.id,

          fullName:
            staff.full_name,

          role:
            staff.role,

          staffCode:
            staff.staff_code,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Staff-code login failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to complete staff login.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}