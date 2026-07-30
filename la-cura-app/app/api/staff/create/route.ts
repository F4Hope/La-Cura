import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      role,
      department,
      license_number,
      shift,
      employment_date,
    } = body;

    // Create the authentication user and send an invitation email
    const { data, error } =
      await adminSupabase.auth.admin.inviteUserByEmail(email);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Save the staff record
    const { error: staffError } =
      await adminSupabase
        .from("staff")
        .insert({
          auth_user_id: data.user?.id,
          full_name,
          email,
          phone,
          role,
          department,
          license_number,
          shift,
          employment_date,
          active: true,
        });

    if (staffError) {
      return NextResponse.json(
        { error: staffError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    return NextResponse.json(
      {
        error: "Unexpected server error.",
      },
      {
        status: 500,
      }
    );

  }
}