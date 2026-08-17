"use client";

import useAppUi from "@/components/i18n/useAppUi";

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
  const { ui } =
    useAppUi();

  const [open, setOpen] = useState(false);

  async function handleConfirm(
    _reason: string,
    notes: string
  ) {
    const staff = await getCurrentStaff();

    if (!staff) {
      throw new Error(
        ui("Unable to identify the logged-in staff member.")
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
        className="flex w-full items-center justify-center gap-1.5 rounded-[3px] bg-[#073B2F] px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#0D4A3A] focus:outline-none focus:ring-4 focus:ring-[#073B2F]/15"
      >
        <AppIcon
          icon={faCircleCheck}
          className="text-lg"
        />

        {ui("Administer")}</button>

      <MedicationActionModal
        open={open}
        title={ui("Administer Medication")}
        resident={resident}
        medication={medication}
        confirmText={ui("Confirm Administration")}
        confirmColor="bg-[#073B2F] hover:bg-[#0D4A3A]"
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}