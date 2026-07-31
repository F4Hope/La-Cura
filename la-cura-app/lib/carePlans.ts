import { supabase } from "./supabase/client";

export async function getCarePlans() {
  const { data, error } = await supabase
    .from("care_plans")
    .select("*")
    .order("review_date", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Unable to load care plans."
    );

    return [];
  }

  return data ?? [];
}