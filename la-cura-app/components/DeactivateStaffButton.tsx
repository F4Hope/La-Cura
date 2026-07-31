"use client";

import { useState } from "react";

import {
  faSpinner,
  faUserCheck,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import { toggleStaffStatus } from "@/lib/staffActions";

type Props = {
  id: number;
  active: boolean;
};

export default function DeactivateStaffButton({
  id,
  active,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function handleClick() {
    if (loading) {
      return;
    }

    const confirmed = window.confirm(
      active
        ? "Deactivate this staff member?"
        : "Activate this staff member?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      await toggleStaffStatus(id, active);
      window.location.reload();
    } catch (error) {
      console.error(
        "Unable to change staff status:",
        error
      );

      alert(
        active
          ? "Unable to deactivate staff member."
          : "Unable to activate staff member."
      );

      setLoading(false);
    }
  }

  const icon = loading
    ? faSpinner
    : active
      ? faUserSlash
      : faUserCheck;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
          : "bg-green-700 hover:bg-green-800 focus:ring-green-200"
      }`}
    >
      <AppIcon
        icon={icon}
        spin={loading}
      />

      {loading
        ? "Updating..."
        : active
          ? "Deactivate"
          : "Activate"}
    </button>
  );
}