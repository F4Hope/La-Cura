import { NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";

type AdministratorRecord = {
  id: number;
  auth_user_id: string;
  full_name: string;
  role: string;
  staff_code: string;
  active: boolean | null;
};

export type AuthorizedAdministrator = {
  id: number;
  authUserId: string;
  fullName: string;
  role: "Administrator";
  staffCode: string;
};

type AuthorizationSuccess = {
  authorized: true;
  administrator: AuthorizedAdministrator;
  accessToken: string;
};

type AuthorizationFailure = {
  authorized: false;
  response: NextResponse;
};

export type AdministratorAuthorizationResult =
  | AuthorizationSuccess
  | AuthorizationFailure;

function createErrorResponse(
  message: string,
  status: number
): NextResponse {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
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

export async function requireAdministrator(
  request: Request
): Promise<AdministratorAuthorizationResult> {
  const accessToken =
    extractBearerToken(request);

  if (!accessToken) {
    return {
      authorized: false,
      response: createErrorResponse(
        "Authentication is required.",
        401
      ),
    };
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
        "Administrator token verification failed:",
        userError.message
      );
    }

    return {
      authorized: false,
      response: createErrorResponse(
        "Your session is invalid or has expired.",
        401
      ),
    };
  }

  const {
    data: staffData,
    error: staffError,
  } = await adminSupabase
    .from("staff")
    .select(
      "id, auth_user_id, full_name, role, staff_code, active"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (staffError) {
    console.error(
      "Administrator staff lookup failed:",
      staffError
    );

    return {
      authorized: false,
      response: createErrorResponse(
        "Unable to verify administrator access.",
        500
      ),
    };
  }

  const staff =
    staffData as AdministratorRecord | null;

  if (!staff || staff.active !== true) {
    return {
      authorized: false,
      response: createErrorResponse(
        "This staff account is inactive or unavailable.",
        403
      ),
    };
  }

  if (staff.role !== "Administrator") {
    return {
      authorized: false,
      response: createErrorResponse(
        "Administrator access is required.",
        403
      ),
    };
  }

  if (!staff.staff_code) {
    return {
      authorized: false,
      response: createErrorResponse(
        "The administrator account is missing a staff code.",
        403
      ),
    };
  }

  return {
    authorized: true,
    accessToken,

    administrator: {
      id: staff.id,
      authUserId: staff.auth_user_id,
      fullName: staff.full_name,
      role: "Administrator",
      staffCode: staff.staff_code,
    },
  };
}