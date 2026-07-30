import { supabase } from "@/lib/supabase/client";

export async function getCurrentStaff() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}