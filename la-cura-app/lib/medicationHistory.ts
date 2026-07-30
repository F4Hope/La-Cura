import { supabase } from "@/lib/supabase/client";

export async function getMedicationHistory(residentId: number) {
  const { data, error } = await supabase
    .from("medication_administration")
    .select(`
      *,
      medications (
        medication_name,
        dosage
      )
    `)
    .eq("resident_id", residentId)
    .order("administered_at", { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}