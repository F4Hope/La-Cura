import {
  createClient,
} from "@/lib/supabase/server";

export async function getMedicationHistory(
  residentId: number
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "medication_administration"
    )
    .select(`
      *,
      medications (
        medication_name,
        dosage
      )
    `)
    .eq(
      "resident_id",
      residentId
    )
    .order(
      "administered_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Failed to load medication history:",
      error.message
    );

    return [];
  }

  return data ?? [];
}