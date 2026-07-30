"use server";

import { adminSupabase } from "@/lib/supabase/admin";

export async function toggleStaffStatus(
  id: number,
  active: boolean
) {
  const { error } = await adminSupabase
    .from("staff")
    .update({
      active: !active,
    })
    .eq("id", id);

  return error;
}