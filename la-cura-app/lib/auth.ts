import { supabase } from "./supabase/client";

type StaffLoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  mustChangePassword?: boolean;

  staff?: {
    id: number;
    fullName: string;
    role: string;
    staffCode: string;
  };

  error?: string;
};

export type StaffLoginResult = {
  error: Error | null;
  mustChangePassword: boolean;

  staff:
    | {
        id: number;
        fullName: string;
        role: string;
        staffCode: string;
      }
    | null;
};

export async function signIn(
  staffCode: string,
  password: string
): Promise<StaffLoginResult> {
  try {
    const response = await fetch(
      "/api/auth/staff-login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          staffCode,
          password,
        }),
      }
    );

    const result =
      (await response.json()) as StaffLoginResponse;

    if (!response.ok) {
      return {
        error: new Error(
          result.error ||
            "Unable to sign in."
        ),

        mustChangePassword: false,
        staff: null,
      };
    }

    if (
      !result.accessToken ||
      !result.refreshToken
    ) {
      return {
        error: new Error(
          "The login session was incomplete."
        ),

        mustChangePassword: false,
        staff: null,
      };
    }

    const {
      error: sessionError,
    } = await supabase.auth.setSession({
      access_token:
        result.accessToken,

      refresh_token:
        result.refreshToken,
    });

    if (sessionError) {
      return {
        error: sessionError,
        mustChangePassword: false,
        staff: null,
      };
    }

    return {
      error: null,

      mustChangePassword:
        result.mustChangePassword === true,

      staff: result.staff ?? null,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error
          : new Error(
              "Unable to connect to the login service."
            ),

      mustChangePassword: false,
      staff: null,
    };
  }
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  return supabase.auth.getUser();
}

export async function getCurrentStaff() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(
      "Unable to retrieve authenticated user:",
      userError
    );

    return null;
  }

  if (!user) {
    return null;
  }

  const { data, error } =
    await supabase
      .from("staff")
      .select("*")
      .eq(
        "auth_user_id",
        user.id
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Unable to load current staff:",
      error
    );

    return null;
  }

  if (!data || data.active === false) {
    return null;
  }

  return data;
}