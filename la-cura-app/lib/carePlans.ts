import { supabase } from "./supabase/client";

export async function getCarePlans() {
  const { data, error } = await supabase
    .from("care_plans")
    .select("*")
    .order("review_date", { ascending: true });

  console.log("CARE PLANS:", data);
  console.log("CARE PLAN ERROR:", error);

  return data ?? [];
}