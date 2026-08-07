"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  ClipboardPenLine,
  FileText,
  LoaderCircle,
  Save,
  Search,
  Stethoscope,
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

export default function AddNursingNotePage() {
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
    subjective,
    setSubjective,
  ] = useState("");

  const [
    objective,
    setObjective,
  ] = useState("");

  const [
    assessment,
    setAssessment,
  ] = useState("");

  const [
    plan,
    setPlan,
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
        4500
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

  function clearNoteFields() {
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
  }

  async function saveNote() {
    if (!resident) {
      setNotification({
        type: "error",
        message:
          "Select a resident before saving the nursing note.",
      });

      return;
    }

    if (saving) {
      return;
    }

    const hasContent =
      subjective.trim() !== "" ||
      objective.trim() !== "" ||
      assessment.trim() !== "" ||
      plan.trim() !== "";

    if (!hasContent) {
      setNotification({
        type: "error",
        message:
          "Enter clinical documentation before saving the nursing note.",
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

    const note = [
      "SUBJECTIVE",
      subjective.trim() ||
        "Not documented",
      "",
      "OBJECTIVE",
      objective.trim() ||
        "Not documented",
      "",
      "ASSESSMENT",
      assessment.trim() ||
        "Not documented",
      "",
      "PLAN",
      plan.trim() ||
        "Not documented",
    ].join("\n");

    setSaving(true);
    setNotification(null);

    try {
      const {
        error,
      } = await supabase
        .from("nursing_notes")
        .insert({
          resident_id:
            resident.id,

          note,

          recorded_by:
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
          `Nursing note saved successfully for ${resident.full_name}.`,
      });

      clearNoteFields();

      /*
       * If opened from the resident
       * profile, retain that resident.
       *
       * If opened normally, clear the
       * resident for the next entry.
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
            : "The nursing note could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
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
                <ClipboardPenLine
                  size={15}
                />

                Clinical Documentation
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Nursing Note
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
                Document resident
                assessment and care using
                the SOAP format.
              </p>
            </div>

            {resident && (
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
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
        <div className="mx-auto max-w-6xl space-y-6">
          {notification && (
            <div
              className={`flex items-start gap-3 rounded-xl border px-4 py-4 text-sm ${
                notification.type ===
                "success"
                  ? "border-green-200 bg-green-50 text-green-800"
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
                <FileText
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

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
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
                    before entering
                    clinical documentation.
                  </p>
                </div>
              </div>
            </header>

            <div className="p-5">
              {loadingResident ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-green-700"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    Loading resident...
                  </p>
                </div>
              ) : resident &&
                !changingResident ? (
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white">
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
                          <span className="rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-semibold text-white">
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
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-4 text-sm font-semibold text-green-700 transition hover:bg-green-100"
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
                        className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
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

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Stethoscope
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    SOAP Documentation
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Record subjective,
                    objective, assessment,
                    and plan information.
                  </p>
                </div>
              </div>
            </header>

            <div className="space-y-5 p-5">
              <SoapField
                letter="S"
                title="Subjective"
                description="What the resident reports, including symptoms, concerns, and statements."
                placeholder="Document what the resident reports..."
                value={
                  subjective
                }
                onChange={
                  setSubjective
                }
                tone="green"
              />

              <SoapField
                letter="O"
                title="Objective"
                description="Observable findings, measurements, vital signs, and clinical observations."
                placeholder="Document objective findings and observations..."
                value={
                  objective
                }
                onChange={
                  setObjective
                }
                tone="blue"
              />

              <SoapField
                letter="A"
                title="Assessment"
                description="Clinical assessment based on the subjective and objective information."
                placeholder="Document nursing assessment..."
                value={
                  assessment
                }
                onChange={
                  setAssessment
                }
                tone="amber"
              />

              <SoapField
                letter="P"
                title="Plan / Intervention"
                description="Interventions completed, monitoring plan, notifications, and follow-up."
                placeholder="Document interventions and plan..."
                value={plan}
                onChange={setPlan}
                tone="purple"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {resident
                  ? `Ready to save a nursing note for ${resident.full_name}.`
                  : "Select a resident before saving."}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Recorded by{" "}
                <span className="font-medium text-slate-600">
                  {staff?.full_name?.trim() ||
                    staff?.name?.trim() ||
                    "Current Staff"}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={saveNote}
              disabled={
                saving ||
                loadingResident ||
                !resident
              }
              className="inline-flex h-12 min-w-52 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
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

                  Save Nursing Note
                </>
              )}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

type SoapFieldProps = {
  letter: string;
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  tone:
    | "green"
    | "blue"
    | "amber"
    | "purple";
};

function SoapField({
  letter,
  title,
  description,
  placeholder,
  value,
  onChange,
  tone,
}: SoapFieldProps) {
  const toneClasses = {
    green:
      "bg-green-50 text-green-700 border-green-200",

    blue:
      "bg-blue-50 text-blue-700 border-blue-200",

    amber:
      "bg-amber-50 text-amber-700 border-amber-200",

    purple:
      "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <label className="block">
      <div className="mb-2 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${toneClasses[tone]}`}
        >
          {letter}
        </div>

        <div>
          <span className="block text-sm font-semibold text-slate-800">
            {title}
          </span>

          <span className="mt-0.5 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        </div>
      </div>

      <textarea
        rows={5}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}