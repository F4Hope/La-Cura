import { supabase } from "@/lib/supabase/client";

type MedicationAction = {
  medication_id: number;
  resident_id: number;
  administered_by: string;
  reason?: string;
  notes: string;
};

export async function administerMedication(
  data: MedicationAction
) {
  const { error } = await supabase
    .from("medication_administration")
    .insert([
      {
        medication_id: data.medication_id,
        resident_id: data.resident_id,
        status: "Administered",
        administered_by: data.administered_by,
        reason: data.reason ?? null,
        notes: data.notes,
        administered_at: new Date().toISOString(),
      },
    ]);

  return error;
}

export async function markMedicationHeld(
  data: MedicationAction
) {
  const { error } = await supabase
    .from("medication_administration")
    .insert([
      {
        medication_id: data.medication_id,
        resident_id: data.resident_id,
        status: "Held",
        administered_by: data.administered_by,
        reason: data.reason ?? null,
        notes: data.notes,
        administered_at: new Date().toISOString(),
      },
    ]);

  return error;
}

export async function markMedicationRefused(
  data: MedicationAction
) {
  const { error } = await supabase
    .from("medication_administration")
    .insert([
      {
        medication_id: data.medication_id,
        resident_id: data.resident_id,
        status: "Refused",
        administered_by: data.administered_by,
        reason: data.reason ?? null,
        notes: data.notes,
        administered_at: new Date().toISOString(),
      },
    ]);

  return error;
}