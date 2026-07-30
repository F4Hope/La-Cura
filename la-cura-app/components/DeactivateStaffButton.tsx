"use client";

import { toggleStaffStatus } from "@/lib/staffActions";

type Props = {
  id: number;
  active: boolean;
};

export default function DeactivateStaffButton({
  id,
  active,
}: Props) {

  async function handleClick() {

    const ok = confirm(
      active
        ? "Deactivate this staff member?"
        : "Activate this staff member?"
    );

    if (!ok) return;

    await toggleStaffStatus(id, active);

    window.location.reload();

  }

  return (

    <button
      onClick={handleClick}
      className={`px-3 py-2 rounded-lg text-white ${
        active
          ? "bg-red-600 hover:bg-red-700"
          : "bg-green-700 hover:bg-green-800"
      }`}
    >
      {active ? "Deactivate" : "Activate"}
    </button>

  );

}