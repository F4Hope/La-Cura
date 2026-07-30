"use client";

import { useState } from "react";

import { faCirclePause } from "@fortawesome/free-solid-svg-icons";

import MedicationActionModal from "@/components/MedicationActionModal";
import AppIcon from "@/components/ui/AppIcon";

import { getCurrentStaff } from "@/lib/currentStaff";
import { markMedicationHeld } from "@/lib/medicationAdministration";

type Props = {
  medicationId: number;
  residentId: number;
  resident: string;
  medication: string;
};

export default function HoldButton({
  medicationId,
  residentId,
  resident,
  medication,
}: Props) {
  const [open, setOpen] = useState(false);

  async function handleConfirm(
    reason: string,
    notes: string
  ) {
    if (!reason) {
      throw new Error(
        "Select a reason before holding the medication."
      );
    }

    const staff = await getCurrentStaff();

    if (!staff) {
      throw new Error(
        "Unable to identify the logged-in staff member."
      );
    }

    const error = await markMedicationHeld({
      medication_id: medicationId,
      resident_id: residentId,
      administered_by: staff.full_name,
      reason,
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-200"
      >
        <AppIcon
          icon={faCirclePause}
          className="text-lg"
        />

        Hold
      </button>

      <MedicationActionModal
        open={open}
        title="Hold Medication"
        resident={resident}
        medication={medication}
        confirmText="Hold Medication"
        confirmColor="bg-amber-500 hover:bg-amber-600"
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}