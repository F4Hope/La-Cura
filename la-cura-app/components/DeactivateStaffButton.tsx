"use client";

import useAppUi from "@/components/i18n/useAppUi";

import { useState } from "react";

import {
  faPowerOff,
  faSpinner,
  faToggleOff,
  faToggleOn,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";
import { supabase } from "@/lib/supabase/client";

type Props = {
  id: number;
  active: boolean;
};

type ToggleStatusResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  staff?: {
    id?: number;
    fullName?: string;
    role?: string;
    staffCode?: string;
    active?: boolean;
  };
};

export default function DeactivateStaffButton({
  id,
  active,
}: Props) {
  const { ui } =
    useAppUi();

  const [loading, setLoading] =
    useState(false);

  async function toggleStatus() {
    if (loading) {
      return;
    }

    const nextActiveStatus = !active;

    const confirmed =
      window.confirm(
        nextActiveStatus
          ? `${ui("Activate this staff account?")}\n\n${ui("The staff member will be able to sign in again.")}`
          : `${ui("Deactivate this staff account?")}\n\n${ui("The staff member will no longer be permitted to access La-Cura.")}`
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      const accessToken =
        sessionData.session
          ?.access_token;

      if (
        sessionError ||
        !accessToken
      ) {
        throw new Error(
          ui("Your administrator session has expired. Sign in again.")
        );
      }

      const response = await fetch(
        "/api/staff/toggle-status",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            staffId: id,
            active:
              nextActiveStatus,
          }),
        }
      );

      const result =
        (await response
          .json()
          .catch(
            () =>
              ({}) as ToggleStatusResponse
          )) as ToggleStatusResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            (nextActiveStatus
              ? ui("Unable to activate the staff account.")
              : ui("Unable to deactivate the staff account."))
        );
      }

      window.location.reload();
    } catch (caughtError) {
      console.error(
        "Unable to update staff status:",
        caughtError
      );

      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : ui("Unable to update the staff account.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleStatus}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-[3px] px-4 py-3 font-semibold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
          : "bg-[#073B2F] hover:bg-[#0D4A3A] focus:ring-[#073B2F]/15"
      }`}
    >
      <AppIcon
        icon={
          loading
            ? faSpinner
            : active
              ? faToggleOff
              : faToggleOn
        }
        spin={loading}
      />

      {loading
        ? active
          ? ui("Deactivating...")
          : ui("Activating...")
        : active
          ? ui("Deactivate Account")
          : ui("Activate Account")}

      {!loading && (
        <AppIcon
          icon={faPowerOff}
          className="text-xs opacity-75"
        />
      )}
    </button>
  );
}