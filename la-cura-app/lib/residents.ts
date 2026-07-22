import { supabase } from "./supabase/client";

export async function getResidents() {
  const { data, error } = await supabase
    .from("residents")
    .select("*");

  console.log("RESIDENT DATA:", data);
  console.log("RESIDENT ERROR:", error);

  return data || [];
}