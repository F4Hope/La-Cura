import { supabase } from "./supabase/client";

export async function getStaff() {

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("full_name");

  console.log("================================");
  console.log("STAFF DATA");
  console.log(JSON.stringify(data, null, 2));
  console.log("STAFF ERROR");
  console.log(error);
  console.log("================================");

  if (error) {
    return [];
  }

  return data ?? [];
}