"use client";

import type {
  FormEvent,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  LoaderCircle,
  Save,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import ResidentSearch from "@/components/ResidentSearch";

import {
  useStaffSession,
} from "@/components/StaffSessionProvider";

import {
  supabase,
} from "@/lib/supabase/client";

type Resident = {
  id: number;
  full_name: string;
  room: string | null;
  age: number | null;
};

type NotificationState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

const INCIDENT_TYPES = [
  "Fall",
  "Medication Error",
  "Skin Tear",
  "Aggressive Behaviour",
  "Wandering",
  "Other",
];

export default function AddIncidentReportPage() {
  const {
    staff,
  } = useStaffSession();

  const [
    resident,
    setResident,
  ] = useState<Resident | null>(
    null
  );

  const [
    incidentType,
    setIncidentType,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    actionTaken,
    setActionTaken,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    loadingResident,
    setLoadingResident,
  ] = useState(true);

  const [
    cameFromResidentProfile,
    setCameFromResidentProfile,
  ] = useState(false);

  const [
    changingResident,
    setChangingResident,
  ] = useState(false);

  const [
    notification,
    setNotification,
  ] =
    useState<NotificationState>(
      null
    );

  useEffect(() => {
    let active = true;

    async function loadResidentFromUrl() {
      const searchParams =
        new URLSearchParams(
          window.location.search
        );

      const residentIdValue =
        searchParams.get(
          "residentId"
        );

      if (!residentIdValue) {
        if (active) {
          setLoadingResident(
            false
          );
        }

        return;
      }

      const residentId =
        Number(residentIdValue);

      if (
        !Number.isInteger(
          residentId
        ) ||
        residentId <= 0
      ) {
        if (active) {
          setNotification({
            type: "error",
            message:
              "The resident link is invalid. Select a resident manually.",
          });

          setLoadingResident(
            false
          );
        }

        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("residents")
        .select(
          "id, full_name, room, age"
        )
        .eq(
          "id",
          residentId
        )
        .maybeSingle();

      if (!active) {
        return;
      }

      if (
        error ||
        !data
      ) {
        setNotification({
          type: "error",
          message:
            "La-Cura could not load the resident from the profile. Select the resident manually.",
        });

        setLoadingResident(
          false
        );

        return;
      }

      setResident(
        data as Resident
      );

      setCameFromResidentProfile(
        true
      );

      setChangingResident(
        false
      );

      setLoadingResident(
        false
      );
    }

    void loadResidentFromUrl();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setNotification(null);
        },
        5000
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [notification]);

  function handleResidentSelected(
    selectedResident: Resident
  ) {
    setResident(
      selectedResident
    );

    setChangingResident(
      false
    );

    setNotification(null);
  }

  function resetIncidentFields() {
    setIncidentType("");
    setDescription("");
    setActionTaken("");
  }

  async function saveIncident(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!resident) {
      setNotification({
        type: "error",
        message:
          "Select a resident before saving the incident report.",
      });

      return;
    }

    if (!incidentType) {
      setNotification({
        type: "error",
        message:
          "Select the incident type.",
      });

      return;
    }

    if (
      description.trim() === ""
    ) {
      setNotification({
        type: "error",
        message:
          "Enter a description of the incident.",
      });

      return;
    }

    const staffName =
      staff?.full_name?.trim() ||
      staff?.name?.trim();

    if (!staffName) {
      setNotification({
        type: "error",
        message:
          "La-Cura could not identify the logged-in staff member.",
      });

      return;
    }

    setSaving(true);
    setNotification(null);

    try {
      const {
        error,
      } = await supabase
        .from("incident_reports")
        .insert({
          resident_id:
            resident.id,

          incident_type:
            incidentType,

          description:
            description.trim(),

          action_taken:
            actionTaken.trim() ||
            null,

          reported_by:
            staffName,
        });

      if (error) {
        throw new Error(
          error.message
        );
      }

      setNotification({
        type: "success",
        message:
          `Incident report saved successfully for ${resident.full_name}.`,
      });

      resetIncidentFields();

      /*
       * When launched directly from a
       * resident profile, retain that
       * resident after saving.
       *
       * When launched as a general
       * workflow, clear the resident.
       */
      if (
        !cameFromResidentProfile
      ) {
        setResident(null);
      }

      setChangingResident(
        false
      );
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "The incident report could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-slate-900">
      <header className="relative overflow-hidden bg-[#073B2F] text-white">
        <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full border border-white/10" />

        <div className="absolute -bottom-36 left-1/2 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative px-5 py-7 lg:px-8">
          {cameFromResidentProfile &&
            resident && (
              <Link
                href={`/residents/${resident.id}`}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-green-100 transition hover:text-white"
              >
                <ArrowLeft
                  size={16}
                />

                Back to{" "}
                {
                  resident.full_name
                }
              </Link>
            )}

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-100">
                <ShieldAlert
                  size={15}
                />

                Safety Documentation
              </div>

              <h1 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">
                Incident Report
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
                Document resident
                incidents, immediate
                actions, and safety
                concerns.
              </p>
            </div>

            {resident && (
              <div className="rounded-[3px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-green-100">
                  Current resident
                </p>

                <p className="mt-1 font-semibold text-white">
                  {
                    resident.full_name
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <form
          onSubmit={saveIncident}
          className="mx-auto max-w-6xl space-y-6"
        >
          {notification && (
            <div
              className={`flex items-start gap-3 rounded-[3px] border px-4 py-4 text-sm ${
                notification.type ===
                "success"
                  ? "border-green-200 bg-green-50 text-[#0D4A3A]"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {notification.type ===
              "success" ? (
                <CheckCircle2
                  className="mt-0.5 shrink-0"
                  size={18}
                />
              ) : (
                <AlertTriangle
                  className="mt-0.5 shrink-0"
                  size={18}
                />
              )}

              <p>
                {
                  notification.message
                }
              </p>
            </div>
          )}

          <section className="overflow-hidden rounded-[4px] border border-slate-200 bg-white">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-green-50 text-[#073B2F]">
                  <UserRound
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Resident
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Confirm the resident
                    associated with this
                    incident.
                  </p>
                </div>
              </div>
            </header>

            <div className="p-5">
              {loadingResident ? (
                <div className="flex items-center gap-3 rounded-[3px] border border-slate-200 bg-slate-50 p-4">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-[#073B2F]"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    Loading resident...
                  </p>
                </div>
              ) : resident &&
                !changingResident ? (
                <div className="flex flex-col justify-between gap-4 rounded-[3px] border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] bg-[#073B2F] text-white">
                      <UserRound
                        size={22}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {
                            resident.full_name
                          }
                        </p>

                        {cameFromResidentProfile && (
                          <span className="rounded-full bg-[#073B2F] px-2.5 py-1 text-[11px] font-semibold text-white">
                            From resident
                            profile
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble
                            size={15}
                          />

                          Room{" "}
                          {resident.room ||
                            "Unassigned"}
                        </span>

                        {resident.age !==
                          null &&
                          resident.age !==
                            undefined && (
                            <span>
                              {
                                resident.age
                              }{" "}
                              years
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setChangingResident(
                        true
                      )
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-4 text-sm font-semibold text-[#073B2F] transition hover:bg-green-100"
                  >
                    <Search
                      size={16}
                    />

                    Change Resident
                  </button>
                </div>
              ) : (
                <div>
                  <ResidentSearch
                    onResidentSelected={
                      handleResidentSelected
                    }
                  />

                  {resident &&
                    changingResident && (
                      <button
                        type="button"
                        onClick={() =>
                          setChangingResident(
                            false
                          )
                        }
                        className="mt-3 text-sm font-semibold text-[#073B2F] hover:text-[#0D4A3A]"
                      >
                        Keep{" "}
                        {
                          resident.full_name
                        }
                      </button>
                    )}
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[4px] border border-slate-200 bg-white">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-red-50 text-red-600">
                  <FileWarning
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Incident Details
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Record what occurred
                    and the immediate
                    response.
                  </p>
                </div>
              </div>
            </header>

            <div className="space-y-5 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Incident Type

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </span>

                <select
                  value={
                    incidentType
                  }
                  onChange={(event) =>
                    setIncidentType(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-[3px] border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#667E72] focus:ring-4 focus:ring-[#073B2F]/10"
                >
                  <option value="">
                    Select incident type
                  </option>

                  {INCIDENT_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Incident Description

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </span>

                <span className="mb-2 block text-xs leading-5 text-slate-500">
                  Document factual
                  observations including
                  what happened, where it
                  occurred, and relevant
                  circumstances.
                </span>

                <textarea
                  rows={7}
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe what happened..."
                  className="w-full resize-y rounded-[3px] border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#667E72] focus:ring-4 focus:ring-[#073B2F]/10"
                />
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-[4px] border border-slate-200 bg-white">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-blue-50 text-blue-600">
                  <ClipboardCheck
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Action Taken
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Record interventions,
                    notifications, and
                    immediate follow-up.
                  </p>
                </div>
              </div>
            </header>

            <div className="p-5">
              <textarea
                rows={6}
                value={
                  actionTaken
                }
                onChange={(event) =>
                  setActionTaken(
                    event.target.value
                  )
                }
                placeholder="Document actions taken, staff or provider notifications, monitoring initiated, treatment provided, or other follow-up..."
                className="w-full resize-y rounded-[3px] border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#667E72] focus:ring-4 focus:ring-[#073B2F]/10"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[4px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {resident
                  ? `Ready to submit an incident report for ${resident.full_name}.`
                  : "Select a resident before saving."}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Reported by{" "}
                <span className="font-medium text-slate-600">
                  {staff?.full_name?.trim() ||
                    staff?.name?.trim() ||
                    "Current Staff"}
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                loadingResident ||
                !resident
              }
              className="inline-flex h-12 min-w-52 items-center justify-center gap-2 rounded-[3px] bg-red-700 px-6 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Incident Report
                </>
              )}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}