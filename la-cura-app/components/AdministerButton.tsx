"use client";

import { useState } from "react";

import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import MedicationActionModal from "@/components/MedicationActionModal";
import AppIcon from "@/components/ui/AppIcon";

import { getCurrentStaff } from "@/lib/currentStaff";
import { administerMedication } from "@/lib/medicationAdministration";

type Props = {
  medicationId: number;
  residentId: number;
  resident: string;
  medication: string;
};

export default function AdministerButton({
  medicationId,
  residentId,
  resident,
  medication,
}: Props) {
  const [open, setOpen] = useState(false);

  async function handleConfirm(
    _reason: string,
    notes: string
  ) {
    const staff = await getCurrentStaff();

    if (!staff) {
      throw new Error(
        "Unable to identify the logged-in staff member."
      );
    }

    const error = await administerMedication({
      medication_id: medicationId,
      resident_id: residentId,
      administered_by: staff.full_name,
      notes,
    });

    if (error) {
      throw new Error(error.message);
    }

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
      >
        <AppIcon
          icon={faCircleCheck}
          className="text-lg"
        />

        Administer
      </button>

      <MedicationActionModal
        open={open}
        title="Administer Medication"
        resident={resident}
        medication={medication}
        confirmText="Confirm Administration"
        confirmColor="bg-green-700 hover:bg-green-800"
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}