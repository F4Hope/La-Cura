import {
  createClient,
} from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase =
    await createClient();

  const [
    residents,
    staff,
    medications,
    vitals,
    medicationAdministration,
  ] = await Promise.all([
    supabase
      .from("residents")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("staff")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("medications")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("vital_signs")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from(
        "medication_administration"
      )
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  return {
    residents:
      residents.count ?? 0,

    staff:
      staff.count ?? 0,

    medications:
      medications.count ?? 0,

    vitals:
      vitals.count ?? 0,

    medicationAdministration:
      medicationAdministration.count ??
      0,
  };
}