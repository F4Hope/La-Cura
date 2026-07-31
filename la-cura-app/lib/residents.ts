import { supabase } from "./supabase/client";

export async function getResidents() {
  const { data, error } = await supabase
    .from("residents")
    .select("*");

  if (error) {
    console.error(
      "Unable to load residents."
    );

    return [];
  }

  return data ?? [];
}