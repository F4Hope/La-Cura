import MedicationAdministrationClinicalTable, {
  type MedicationAdministrationRecord,
} from "@/components/MedicationAdministrationClinicalTable";

import {
  getMedications,
} from "@/lib/medications";

export const dynamic =
  "force-dynamic";


export default async function MedicationAdministrationPage() {
  const medicationData =
    await getMedications();

  return (
    <MedicationAdministrationClinicalTable
      medications={
        (medicationData ??
          []) as MedicationAdministrationRecord[]
      }
    />
  );
}
