"use client";

import useAppUi from "@/components/i18n/useAppUi";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Save,
  Search,
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

  room:
    | string
    | null;

  age:
    | number
    | null;
};


type NotificationState =
  | {
      type:
        | "success"
        | "error";

      message: string;
    }
  | null;


export default function AddNursingNotePage() {
  const { ui } =
    useAppUi();

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
        Number(
          residentIdValue
        );

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
            ui("La-Cura could not load the resident from the profile. Select the resident manually."),
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
          setNotification(
            null
          );
        },
        4500
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    notification,
  ]);


  function handleResidentSelected(
    selectedResident:
      Resident
  ) {
    setResident(
      selectedResident
    );

    setChangingResident(
      false
    );

    setNotification(
      null
    );
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
      subjective.trim() !==
        "" ||
      objective.trim() !==
        "" ||
      assessment.trim() !==
        "" ||
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
      staff?.full_name
        ?.trim() ||
      staff?.name
        ?.trim();

    if (!staffName) {
      setNotification({
        type: "error",
        message:
          ui("La-Cura could not identify the logged-in staff member."),
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
        .from(
          "nursing_notes"
        )
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
          `${ui("Nursing note saved successfully for")} ${resident.full_name}.`,
      });

      clearNoteFields();

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
            : ui("The nursing note could not be saved."),
      });
    } finally {
      setSaving(false);
    }
  }


  const recordedBy =
    staff?.full_name
      ?.trim() ||
    staff?.name
      ?.trim() ||
    "Current Staff";


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE HEADER */}

      <section className="border-b border-[#C9D3CE] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="hover:text-[#073B2F]"
              >
                {ui("Home")}</Link>

              <span>/</span>

              {cameFromResidentProfile &&
              resident ? (
                <>
                  <Link
                    href={`/residents/${resident.id}`}
                    className="font-semibold text-[#073B2F] hover:underline"
                  >
                    {resident.full_name}
                  </Link>

                  <span>/</span>
                </>
              ) : null}

              <span className="font-semibold text-[#40524B]">
                {ui("Prog Notes")}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                {ui("Nursing Progress Note")}</h1>

              <p className="text-xs text-[#718078]">
                {ui("SOAP clinical documentation")}</p>
            </div>
          </div>


          {cameFromResidentProfile &&
            resident && (
              <Link
                href={`/residents/${resident.id}?tab=prog-notes`}
                className="
                  inline-flex h-8
                  items-center gap-1.5
                  border border-[#B3C1BA]
                  bg-white px-3
                  text-[10px]
                  font-bold
                  text-[#3F534A]
                  hover:border-[#073B2F]
                  hover:text-[#073B2F]
                "
              >
                <ArrowLeft
                  size={12}
                />

                {ui("Resident Progress Notes")}</Link>
            )}
        </div>
      </section>


      <main className="mx-auto max-w-[1500px] p-3 sm:p-4 lg:px-6">
        <div className="space-y-3">
          {notification && (
            <div
              className={`
                flex items-center
                gap-2 border
                px-3 py-2.5
                text-[11px]
                font-medium

                ${
                  notification.type ===
                  "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }
              `}
            >
              {notification.type ===
              "success" ? (
                <CheckCircle2
                  size={14}
                  className="shrink-0"
                />
              ) : (
                <FileText
                  size={14}
                  className="shrink-0"
                />
              )}

              {notification.message}
            </div>
          )}


          {/* RESIDENT CONTEXT */}

          <section className="border border-[#C8D2CD] bg-white">
            <div className="flex items-center justify-between border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
                {ui("Resident Context")}</h2>

              {cameFromResidentProfile && (
                <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8B6E27]">
                  {ui("Profile Context")}</span>
              )}
            </div>


            <div className="p-3">
              {loadingResident ? (
                <div className="flex items-center gap-2 border border-[#D4DDD8] bg-[#FBFAF7] px-3 py-3">
                  <LoaderCircle
                    size={15}
                    className="animate-spin text-[#073B2F]"
                  />

                  <span className="text-[11px] text-[#5A6D64]">
                    {ui("Loading resident...")}</span>
                </div>
              ) : resident &&
                !changingResident ? (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_120px]">
                    <ResidentField
                      label={ui("Resident")}
                      value={
                        resident.full_name
                      }
                      strong
                    />

                    <ResidentField
                      label={ui("Room / Bed")}
                      value={
                        resident.room ||
                        "Unassigned"
                      }
                    />

                    <ResidentField
                      label={ui("Age")}
                      value={
                        resident.age !==
                          null &&
                        resident.age !==
                          undefined
                          ? `${resident.age} ${ui("years")}`
                          : "Not recorded"
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setChangingResident(
                        true
                      )
                    }
                    className="
                      inline-flex h-8
                      items-center
                      justify-center gap-1.5
                      border
                      border-[#AABAB2]
                      bg-white px-3
                      text-[10px]
                      font-bold
                      text-[#30483E]
                      hover:border-[#073B2F]
                      hover:bg-[#F2F5F3]
                    "
                  >
                    <Search
                      size={12}
                    />

                    {ui("Change Resident")}</button>
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
                        className="mt-2 text-[10px] font-bold text-[#073B2F] hover:underline"
                      >
                        {ui("Keep")}{" "}
                        {
                          resident.full_name
                        }
                      </button>
                    )}
                </div>
              )}
            </div>
          </section>


          {/* SOAP ENTRY */}

          <section className="border border-[#C8D2CD] bg-white">
            <div className="flex flex-col gap-1 border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
                {ui("SOAP Documentation")}</h2>

              <span className="text-[9px] text-[#73817A]">
                {ui("Recorded by")}{" "}
                <strong className="font-semibold text-[#40544B]">
                  {recordedBy}
                </strong>
              </span>
            </div>


            <div className="divide-y divide-[#DCE3DF]">
              <SoapRow
                letter="S"
                title={ui("Subjective")}
                description={ui("Resident-reported symptoms, concerns, statements, or changes.")}
                placeholder={ui("Document what the resident reports...")}
                value={
                  subjective
                }
                onChange={
                  setSubjective
                }
              />

              <SoapRow
                letter="O"
                title={ui("Objective")}
                description={ui("Observed findings, measurements, vital signs, and clinical observations.")}
                placeholder={ui("Document objective findings and observations...")}
                value={
                  objective
                }
                onChange={
                  setObjective
                }
              />

              <SoapRow
                letter="A"
                title={ui("Assessment")}
                description={ui("Clinical assessment based on the documented subjective and objective findings.")}
                placeholder={ui("Document nursing assessment...")}
                value={
                  assessment
                }
                onChange={
                  setAssessment
                }
              />

              <SoapRow
                letter="P"
                title={ui("Plan / Intervention")}
                description={ui("Interventions, monitoring, notifications, follow-up, and planned care.")}
                placeholder={ui("Document interventions and plan...")}
                value={plan}
                onChange={
                  setPlan
                }
              />
            </div>
          </section>


          {/* SAVE BAR */}

          <section className="flex flex-col gap-3 border border-[#C8D2CD] bg-[#FBFAF7] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#344940]">
                {resident
                  ? `${ui("Ready to save a progress note for")} ${resident.full_name}.`
                  : "Select a resident before saving."}
              </p>

              <p className="mt-0.5 text-[9px] text-[#73817A]">
                {ui("This entry will become part of the resident&apos;s clinical record.")}</p>
            </div>

            <button
              type="button"
              onClick={
                saveNote
              }
              disabled={
                saving ||
                loadingResident ||
                !resident
              }
              className="
                inline-flex h-9
                min-w-[175px]
                items-center
                justify-center
                gap-2 border
                border-[#063428]
                bg-[#073B2F]
                px-4 text-[11px]
                font-bold text-white
                hover:bg-[#0D4A3A]
                disabled:cursor-not-allowed
                disabled:opacity-45
              "
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={14}
                    className="animate-spin"
                  />

                  {ui("Saving...")}</>
              ) : (
                <>
                  <Save
                    size={14}
                  />

                  {ui("Save Progress Note")}</>
              )}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}


function ResidentField({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 border-l-2 border-[#D5A437] pl-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#7B8982]">
        {label}
      </p>

      <p
        className={`
          mt-0.5 truncate
          text-[11px]

          ${
            strong
              ? "font-bold text-[#073B2F]"
              : "font-semibold text-[#40544B]"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}


type SoapRowProps = {
  letter: string;
  title: string;
  description: string;
  placeholder: string;
  value: string;

  onChange: (
    value: string
  ) => void;
};


function SoapRow({
  letter,
  title,
  description,
  placeholder,
  value,
  onChange,
}: SoapRowProps) {
  return (
    <div className="grid bg-white lg:grid-cols-[190px_minmax(0,1fr)]">
      <div className="border-b border-[#E2E7E4] bg-[#F8F7F2] px-3 py-3 lg:border-b-0 lg:border-r">
        <div className="flex items-start gap-2">
          <span
            className="
              flex h-7 w-7
              shrink-0 items-center
              justify-center
              border
              border-[#C6D1CB]
              bg-white
              text-[11px]
              font-black
              text-[#073B2F]
              shadow-[inset_0_-2px_0_#D5A437]
            "
          >
            {letter}
          </span>

          <div>
            <p className="text-[11px] font-bold text-[#30443B]">
              {title}
            </p>

            <p className="mt-1 text-[9px] leading-4 text-[#75847D]">
              {description}
            </p>
          </div>
        </div>
      </div>


      <div className="p-3">
        <textarea
          rows={4}
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target
                .value
            )
          }
          placeholder={
            placeholder
          }
          className="
            w-full resize-y
            border border-[#BFCAC4]
            bg-white
            px-3 py-2.5
            text-[12px]
            leading-5
            text-[#24382F]
            outline-none
            placeholder:text-[#8A9791]
            focus:border-[#667E72]
            focus:ring-1
            focus:ring-[#667E72]/20
          "
        />
      </div>
    </div>
  );
}
