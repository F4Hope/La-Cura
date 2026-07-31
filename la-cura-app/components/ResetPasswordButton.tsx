"use client";

import { useState } from "react";

import {
  faKey,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type Props = {
  email: string;
};

export default function ResetPasswordButton({
  email,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function sendResetEmail() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/staff/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const result = (await response
        .json()
        .catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to send reset email."
        );
      }

      alert("Reset email sent.");
    } catch (error) {
      console.error(
        "Unable to send reset email:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={sendResetEmail}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <AppIcon
        icon={
          loading ? faSpinner : faKey
        }
        spin={loading}
      />

      {loading
        ? "Sending..."
        : "Reset Password"}
    </button>
  );
}