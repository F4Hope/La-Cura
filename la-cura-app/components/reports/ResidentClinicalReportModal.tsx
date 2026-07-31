"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  faDownload,
  faFileLines,
  faMagnifyingGlass,
  faSpinner,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";
import { getResidents } from "@/lib/getResidents";
import { getResidentTimeline } from "@/lib/residentTimeline";
import {
  generateResidentClinicalPdf,
  type ResidentPdfData,
  type ResidentTimelinePdfItem,
} from "@/lib/generateResidentClinicalPdf";
import { supabase } from "@/lib/supabase/client";

type ResidentListItem = {
  id: number | string;
  full_name: string;
  room?: string | number | null;
  age?: string | number | null;
};

type ReportingPeriod = "30" | "90" | "365" | "all";

export type ResidentReportGeneratedData = {
  residentName: string;
  reportingPeriod: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated?: (report: ResidentReportGeneratedData) => void;
};

const reportingPeriodLabels: Record<ReportingPeriod, string> = {
  "30": "Last 30 days",
  "90": "Last 90 days",
  "365": "Last 12 months",
  all: "Complete clinical history",
};

function filterTimeline(
  timeline: ResidentTimelinePdfItem[],
  reportingPeriod: ReportingPeriod
): ResidentTimelinePdfItem[] {
  const sortedTimeline = [...timeline].sort((first, second) => {
    const firstDate = new Date(String(first.date ?? 0)).getTime();
    const secondDate = new Date(String(second.date ?? 0)).getTime();

    return secondDate - firstDate;
  });

  if (reportingPeriod === "all") {
    return sortedTimeline;
  }

  const numberOfDays = Number(reportingPeriod);
  const cutoffDate = new Date();

  cutoffDate.setHours(0, 0, 0, 0);
  cutoffDate.setDate(cutoffDate.getDate() - numberOfDays);

  return sortedTimeline.filter((item) => {
    if (!item.date) {
      return false;
    }

    const itemDate = new Date(item.date);

    if (Number.isNaN(itemDate.getTime())) {
      return false;
    }

    return itemDate >= cutoffDate;
  });
}

export default function ResidentClinicalReportModal({
  open,
  onClose,
  onGenerated,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [reportingPeriod, setReportingPeriod] =
    useState<ReportingPeriod>("30");
  const [search, setSearch] = useState("");
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [generating, setGenerating] = useState(false);
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

    setSelectedResidentId("");
    setReportingPeriod("30");
    setSearch("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !generating) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, generating, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    async function loadResidents() {
      setLoadingResidents(true);
      setError("");

      try {
        const residentData = await getResidents();

        if (!isActive) {
          return;
        }

        setResidents((residentData ?? []) as ResidentListItem[]);
      } catch (caughtError) {
        console.error("Unable to load residents:", caughtError);

        if (isActive) {
          setError("Residents could not be loaded. Please try again.");
        }
      } finally {
        if (isActive) {
          setLoadingResidents(false);
        }
      }
    }

    void loadResidents();

    return () => {
      isActive = false;
    };
  }, [open]);

  const filteredResidents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return residents;
    }

    return residents.filter((resident) => {
      const searchableText = [
        resident.full_name,
        resident.room,
        resident.age,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [residents, search]);

  const selectedResident = residents.find(
    (resident) => String(resident.id) === selectedResidentId
  );

  function handleClose() {
    if (!generating) {
      onClose();
    }
  }

  async function handleDownload() {
    if (!selectedResidentId || !selectedResident || generating) {
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const residentId = Number(selectedResidentId);

      if (Number.isNaN(residentId)) {
        throw new Error("The selected resident ID is invalid.");
      }

      const { data: resident, error: residentError } = await supabase
        .from("residents")
        .select("*")
        .eq("id", residentId)
        .single();

      if (residentError) {
        throw residentError;
      }

      if (!resident) {
        throw new Error("The resident record was not found.");
      }

      const timelineData = await getResidentTimeline(residentId);

      const timeline = filterTimeline(
        (timelineData ?? []) as ResidentTimelinePdfItem[],
        reportingPeriod
      );

      const reportingPeriodLabel =
        reportingPeriodLabels[reportingPeriod];

      await generateResidentClinicalPdf({
        resident: resident as ResidentPdfData,
        timeline,
        reportingPeriod: reportingPeriodLabel,
        generatedBy: "La-Cura Staff",
      });

      onGenerated?.({
        residentName: selectedResident.full_name,
        reportingPeriod: reportingPeriodLabel,
      });

      onClose();
    } catch (caughtError) {
      console.error("Resident report generation failed:", caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The resident PDF could not be generated."
      );
    } finally {
      setGenerating(false);
    }
  }

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resident-report-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                <AppIcon icon={faFileLines} className="text-2xl" />
              </div>

              <div>
                <p className="text-sm font-semibold text-green-100">
                  Branded PDF Report
                </p>

                <h2
                  id="resident-report-modal-title"
                  className="mt-1 text-2xl font-black"
                >
                  Resident Clinical Summary
                </h2>

                <p className="mt-1 text-sm text-green-100">
                  Select a resident and download their La-Cura clinical report.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={generating}
              aria-label="Close resident report"
              className="shrink-0 rounded-xl bg-white/15 p-2 transition hover:bg-white/25 disabled:opacity-50"
            >
              <AppIcon icon={faXmark} />
            </button>
          </div>
        </header>

        <main className="max-h-[calc(100vh-13rem)] space-y-6 overflow-y-auto p-6 sm:p-8">
          <section>
            <label
              htmlFor="resident-report-search"
              className="mb-2 block font-bold text-slate-800"
            >
              Search Resident
            </label>

            <div className="relative">
              <AppIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="resident-report-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={loadingResidents || generating}
                placeholder="Search by resident name, room, or age..."
                className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:bg-slate-100"
              />
            </div>
          </section>

          <section>
            <label
              htmlFor="resident-report-resident"
              className="mb-2 block font-bold text-slate-800"
            >
              Select Resident
            </label>

            <select
              id="resident-report-resident"
              value={selectedResidentId}
              onChange={(event) => setSelectedResidentId(event.target.value)}
              disabled={loadingResidents || generating}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingResidents ? "Loading residents..." : "Choose a resident"}
              </option>

              {filteredResidents.map((resident) => (
                <option key={resident.id} value={String(resident.id)}>
                  {resident.full_name}
                  {resident.room ? ` — Room ${resident.room}` : ""}
                </option>
              ))}
            </select>

            {!loadingResidents && filteredResidents.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                No residents matched your search.
              </p>
            )}
          </section>

          {selectedResident && (
            <section className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100">
                <AppIcon icon={faUser} className="text-xl text-green-700" />
              </div>

              <div>
                <p className="font-black text-slate-900">
                  {selectedResident.full_name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Room {selectedResident.room ?? "Not documented"}
                  {" • "}
                  Age {selectedResident.age ?? "not documented"}
                </p>
              </div>
            </section>
          )}

          <section>
            <label
              htmlFor="resident-report-period"
              className="mb-2 block font-bold text-slate-800"
            >
              Reporting Period
            </label>

            <select
              id="resident-report-period"
              value={reportingPeriod}
              onChange={(event) =>
                setReportingPeriod(event.target.value as ReportingPeriod)
              }
              disabled={generating}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:bg-slate-100"
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
              <option value="all">Complete clinical history</option>
            </select>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-bold text-slate-800">Report contents</p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              The PDF includes the La-Cura logo, resident demographics,
              available diagnoses, allergies, clinical timeline, generation
              date, confidentiality notice, and page numbers.
            </p>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}
        </main>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={generating}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!selectedResidentId || loadingResidents || generating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <AppIcon icon={faSpinner} spin />
                Creating PDF...
              </>
            ) : (
              <>
                <AppIcon icon={faDownload} />
                Download Patient PDF
              </>
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}