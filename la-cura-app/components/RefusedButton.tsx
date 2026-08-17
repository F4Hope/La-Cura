"use client";

import useAppUi from "@/components/i18n/useAppUi";

import { useState } from "react";

import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

import MedicationActionModal from "@/components/MedicationActionModal";
import AppIcon from "@/components/ui/AppIcon";

import { getCurrentStaff } from "@/lib/currentStaff";
import { markMedicationRefused } from "@/lib/medicationAdministration";

type Props = {
  medicationId: number;
  residentId: number;
  resident: string;
  medication: string;
};

export default function RefusedButton({
  medicationId,
  residentId,
  resident,
  medication,
}: Props) {
  const { ui } =
    useAppUi();

  const [open, setOpen] = useState(false);

  async function handleConfirm(
    reason: string,
    notes: string
  ) {
    if (!reason) {
      throw new Error(
        ui("Select a reason before recording the refusal.")
      );
    }

    const staff = await getCurrentStaff();

    if (!staff) {
      throw new Error(
        ui("Unable to identify the logged-in staff member.")
      );
    }

    const error = await markMedicationRefused({
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
      >
        <AppIcon
          icon={faCircleXmark}
          className="text-lg"
        />

        {ui("Refused")}</button>

      <MedicationActionModal
        open={open}
        title={ui("Refuse Medication")}
        resident={resident}
        medication={medication}
        confirmText={ui("Confirm Refusal")}
        confirmColor="bg-red-600 hover:bg-red-700"
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}