import { supabase } from "@/lib/supabase/client";

export async function getRecentMedicationActivity() {
  const { data, error } = await supabase
    .from("medication_administration")
    .select(`
      id,
      status,
      administered_at,
      administered_by,
      residents(full_name),
      medications(medication_name)
    `)
    .order("administered_at", { ascending: false })
    .limit(5);

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}

export async function getRecentVitalActivity() {
  const { data, error } = await supabase
    .from("vital_signs")
    .select(`
      id,
      recorded_at,
      recorded_by,
      residents(full_name)
    `)
    .order("recorded_at", { ascending: false })
    .limit(5);

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}