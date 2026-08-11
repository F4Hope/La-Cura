import MedicationClinicalTable, {
  type MedicationRecord,
} from "@/components/MedicationClinicalTable";

import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";


export default async function MedicationsPage() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("medications")
    .select("*")
    .order(
      "resident_name",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Unable to load medications:",
      error.message
    );
  }

  return (
    <MedicationClinicalTable
      medications={
        (data ??
          []) as MedicationRecord[]
      }
      loadError={
        Boolean(error)
      }
    />
  );
}
