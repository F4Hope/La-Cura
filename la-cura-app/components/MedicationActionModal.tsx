"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import {
  faClipboardCheck,
  faSpinner,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type MedicationActionModalProps = {
  open: boolean;
  title: string;
  resident: string;
  medication: string;
  confirmText: string;
  confirmColor?: string;
  onClose: () => void;
  onConfirm: (
    reason: string,
    notes: string
  ) => Promise<void>;
};

export default function MedicationActionModal({
  open,
  title,
  resident,
  medication,
  confirmText,
  confirmColor = "bg-green-700 hover:bg-green-800",
  onClose,
  onConfirm,
}: MedicationActionModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, loading, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("");
    setNotes("");
    setError("");
  }, [open, resident, medication, title]);

  function handleClose() {
    if (!loading) {
      onClose();
    }
  }

  async function handleConfirm() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onConfirm(reason, notes);

      setReason("");
      setNotes("");

      onClose();
    } catch (caughtError) {
      console.error(
        "Medication action failed:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The medication action could not be saved. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={handleClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-2xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="shrink-0 rounded-2xl bg-white/20 p-3">
                <AppIcon
                  icon={faClipboardCheck}
                  className="text-2xl"
                />
              </div>

              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="break-words text-2xl font-black sm:text-3xl"
                >
                  {title}
                </h2>

                <p
                  id={descriptionId}
                  className="mt-1 text-green-100"
                >
                  Review the medication details before
                  confirming.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close medication action"
              className="shrink-0 rounded-xl bg-white/20 p-2 transition hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AppIcon
                icon={faXmark}
                className="text-xl"
              />
            </button>
          </div>
        </header>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <main className="space-y-8 p-6 sm:p-8">
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Resident
                </p>

                <h3 className="mt-2 break-words text-xl font-bold text-slate-900">
                  {resident}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Medication
                </p>

                <h3 className="mt-2 break-words text-xl font-bold text-slate-900">
                  {medication}
                </h3>
              </div>
            </section>

            <section>
              <label
                htmlFor="medication-action-reason"
                className="mb-2 block font-semibold text-slate-900"
              >
                Reason
              </label>

              <select
                id="medication-action-reason"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                disabled={loading}
                className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70"
              >
                <option value="">Select reason</option>

                <option value="Blood Pressure Low">
                  Blood Pressure Low
                </option>

                <option value="Blood Sugar Low">
                  Blood Sugar Low
                </option>

                <option value="Resident Sleeping">
                  Resident Sleeping
                </option>

                <option value="Resident Refused">
                  Resident Refused
                </option>

                <option value="Doctor Ordered Hold">
                  Doctor Ordered Hold
                </option>

                <option value="Nausea">
                  Nausea
                </option>

                <option value="Vomiting">
                  Vomiting
                </option>

                <option value="Family Declined">
                  Family Declined
                </option>

                <option value="Medication Unavailable">
                  Medication Unavailable
                </option>

                <option value="Clinical Parameter Not Met">
                  Clinical Parameter Not Met
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </section>

            <section>
              <label
                htmlFor="medication-clinical-notes"
                className="mb-2 block font-semibold text-slate-900"
              >
                Clinical Notes
              </label>

              <textarea
                id="medication-clinical-notes"
                rows={6}
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                disabled={loading}
                placeholder="Document clinical observations, relevant vital signs, resident response, provider instructions, or other details."
                className="w-full resize-none rounded-2xl border border-gray-300 px-5 py-4 text-slate-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70"
              />
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
              >
                <AppIcon
                  icon={faTriangleExclamation}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}
          </main>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-6 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-2xl border border-gray-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`${confirmColor} inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3 font-bold text-white transition focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading && (
              <AppIcon
                icon={faSpinner}
                className="text-base"
                spin
              />
            )}

            {loading ? "Saving..." : confirmText}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}