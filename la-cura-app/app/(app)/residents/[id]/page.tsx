import type {
  ReactNode,
} from "react";

import type {
  IconDefinition,
} from "@fortawesome/fontawesome-svg-core";

import {
  faArrowLeft,
  faArrowRight,
  faBed,
  faCalendarDays,
  faChartLine,
  faCircleCheck,
  faCircleExclamation,
  faCirclePause,
  faCircleXmark,
  faClipboardList,
  faClockRotateLeft,
  faFileMedical,
  faHeartPulse,
  faIdCard,
  faNotesMedical,
  faPhone,
  faPills,
  faShieldHeart,
  faStethoscope,
  faTemperatureHalf,
  faUser,
  faUserDoctor,
  faVenusMars,
  faWind,
} from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";

import { notFound } from "next/navigation";

import AppIcon from "@/components/ui/AppIcon";

import { getMedicationHistory } from "@/lib/medicationHistory";
import { getResidentTimelineServer } from "@/lib/residentTimelineServer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type ResidentRecord = {
  id: number;
  full_name?: string | null;
  age?: number | null;
  room?: string | null;
  status?: string | null;
  emergency_contact?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  date_admitted?: string | null;
  diagnosis?: string | null;
  allergies?: string | null;
  blood_group?: string | null;
  primary_doctor?: string | null;
  next_of_kin?: string | null;
  next_of_kin_phone?: string | null;
  notes?: string | null;
  photo_url?: string | null;
};

type TimelineItem = {
  type?: string | null;
  icon?: string | null;
  date?: string | null;
  title?: string | null;
  subtitle?: string | null;
};

type MedicationRelation = {
  medication_name?: string | null;
  dosage?: string | null;
};

type MedicationHistoryRow = {
  id: number;
  status?: string | null;
  administered_at?: string | null;
  administered_by?: string | null;
  reason?: string | null;
  notes?: string | null;

  medications?:
    | MedicationRelation
    | MedicationRelation[]
    | null;
};

type LatestVital = {
  temperature?: number | string | null;
  pulse?: number | string | null;
  systolic?: number | string | null;
  diastolic?: number | string | null;
  oxygen_saturation?:
    | number
    | string
    | null;
  pain_score?: number | string | null;
  recorded_at?: string | null;
  recorded_by?: string | null;
};

function cleanText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  value: string | null | undefined
): string {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function formatAge(
  age: number | null | undefined
): string {
  if (
    typeof age !== "number" ||
    !Number.isFinite(age) ||
    age < 0
  ) {
    return "Not recorded";
  }

  return `${age} years`;
}

function getResidentName(
  resident: ResidentRecord
): string {
  return (
    cleanText(resident.full_name) ||
    "Unnamed Resident"
  );
}

function getInitials(
  resident: ResidentRecord
): string {
  return getResidentName(resident)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function getMedicationDetails(
  row: MedicationHistoryRow
) {
  const relation =
    row.medications;

  const medication =
    Array.isArray(relation)
      ? relation[0]
      : relation;

  return {
    name:
      cleanText(
        medication?.medication_name
      ) || "Medication",

    dosage:
      cleanText(
        medication?.dosage
      ) || "Not recorded",
  };
}

function getMedicationStatusStyle(
  status: string | null | undefined
): string {
  const normalized =
    cleanText(status).toLowerCase();

  if (
    normalized === "administered" ||
    normalized === "given"
  ) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (normalized === "held") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized === "refused" ||
    normalized === "missed"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getMedicationStatusIcon(
  status: string | null | undefined
): IconDefinition {
  const normalized =
    cleanText(status).toLowerCase();

  if (
    normalized === "administered" ||
    normalized === "given"
  ) {
    return faCircleCheck;
  }

  if (normalized === "held") {
    return faCirclePause;
  }

  if (
    normalized === "refused" ||
    normalized === "missed"
  ) {
    return faCircleXmark;
  }

  return faCircleExclamation;
}

function getTimelineIcon(
  type: string | null | undefined
): IconDefinition {
  const normalized =
    cleanText(type).toLowerCase();

  if (
    normalized.includes("medication")
  ) {
    return faPills;
  }

  if (
    normalized.includes("vital")
  ) {
    return faHeartPulse;
  }

  if (
    normalized.includes("nursing")
  ) {
    return faNotesMedical;
  }

  if (
    normalized.includes("incident")
  ) {
    return faCircleExclamation;
  }

  return faFileMedical;
}

function getTimelineStyle(
  type: string | null | undefined
): string {
  const normalized =
    cleanText(type).toLowerCase();

  if (
    normalized.includes("medication")
  ) {
    return "bg-orange-50 text-orange-600";
  }

  if (
    normalized.includes("vital")
  ) {
    return "bg-red-50 text-red-600";
  }

  if (
    normalized.includes("nursing")
  ) {
    return "bg-blue-50 text-blue-600";
  }

  if (
    normalized.includes("incident")
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-green-50 text-green-700";
}

function isNoKnownAllergy(
  value: string
): boolean {
  const normalized =
    value.toLowerCase();

  return [
    "",
    "none",
    "nka",
    "no known allergies",
    "no known allergy",
  ].includes(normalized);
}

function displayVital(
  value:
    | number
    | string
    | null
    | undefined,
  suffix: string
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return `${value}${suffix}`;
}

export default async function ResidentPage({
  params,
}: Props) {
  const { id } = await params;

  const residentId = Number(id);

  if (
    !Number.isInteger(residentId) ||
    residentId <= 0
  ) {
    notFound();
  }

  const supabase =
    await createClient();

  const [
    residentResult,
    timelineResult,
    medicationHistoryResult,
    latestVitalResult,
  ] = await Promise.all([
    supabase
      .from("residents")
      .select("*")
      .eq("id", residentId)
      .maybeSingle(),

    getResidentTimelineServer(
      residentId
    ),

    getMedicationHistory(
      residentId
    ),

    supabase
      .from("vital_signs")
      .select(
        "temperature, pulse, systolic, diastolic, oxygen_saturation, pain_score, recorded_at, recorded_by"
      )
      .eq(
        "resident_id",
        residentId
      )
      .order("recorded_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),
  ]);

  if (
    residentResult.error ||
    !residentResult.data
  ) {
    notFound();
  }

  const resident =
    residentResult.data as ResidentRecord;

  const timeline =
    (timelineResult ??
      []) as TimelineItem[];

  const medicationHistory =
    (medicationHistoryResult ??
      []) as MedicationHistoryRow[];

  const latestVital =
    latestVitalResult.data as
      | LatestVital
      | null;

  const residentName =
    getResidentName(resident);

  const status =
    cleanText(resident.status) ||
    "Status not recorded";

  const allergies =
    cleanText(resident.allergies);

  const hasRecordedAllergy =
    !isNoKnownAllergy(allergies);

  const recentMedications =
    medicationHistory.slice(0, 8);

  const recentTimeline =
    timeline.slice(0, 8);

  const medicationCount =
    medicationHistory.length;

  const vitalCount =
    timeline.filter((item) =>
      cleanText(item.type)
        .toLowerCase()
        .includes("vital")
    ).length;

  const nursingNoteCount =
    timeline.filter((item) =>
      cleanText(item.type)
        .toLowerCase()
        .includes("nursing")
    ).length;

  const incidentCount =
    timeline.filter((item) =>
      cleanText(item.type)
        .toLowerCase()
        .includes("incident")
    ).length;

  const residentQuery =
    `?residentId=${resident.id}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
        <div className="absolute -right-32 -top-36 h-[420px] w-[420px] rounded-full border border-white/10" />

        <div className="absolute -bottom-36 left-1/2 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative px-5 pb-6 pt-5 lg:px-8">
          <Link
            href="/residents"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-100 transition hover:text-white"
          >
            <AppIcon
              icon={faArrowLeft}
            />

            Back to Residents
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-6 2xl:flex-row 2xl:items-end">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center">
              {resident.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resident.photo_url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white/20 object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-semibold shadow-xl backdrop-blur-sm">
                  {getInitials(
                    resident
                  )}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-3xl font-semibold tracking-tight md:text-4xl">
                    {residentName}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-200" />

                    {status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-green-100">
                  Resident #{resident.id}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-green-50">
                  <HeaderDetail
                    icon={faCalendarDays}
                    value={`${formatDate(
                      resident.date_of_birth
                    )} • ${formatAge(
                      resident.age
                    )}`}
                  />

                  <HeaderDetail
                    icon={faVenusMars}
                    value={
                      cleanText(
                        resident.gender
                      ) ||
                      "Gender not recorded"
                    }
                  />

                  <HeaderDetail
                    icon={faBed}
                    value={
                      cleanText(
                        resident.room
                      )
                        ? `Room ${cleanText(
                            resident.room
                          )}`
                        : "Room unassigned"
                    }
                  />

                  <HeaderDetail
                    icon={faUserDoctor}
                    value={
                      cleanText(
                        resident.primary_doctor
                      ) ||
                      "Physician not assigned"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-5 2xl:min-w-[640px]">
              <HeaderVital
                label="Blood Pressure"
                value={
                  latestVital?.systolic !==
                    null &&
                  latestVital?.systolic !==
                    undefined &&
                  latestVital?.diastolic !==
                    null &&
                  latestVital?.diastolic !==
                    undefined
                    ? `${latestVital.systolic}/${latestVital.diastolic}`
                    : "—"
                }
                icon={faHeartPulse}
              />

              <HeaderVital
                label="Temperature"
                value={displayVital(
                  latestVital?.temperature,
                  "°C"
                )}
                icon={faTemperatureHalf}
              />

              <HeaderVital
                label="Pulse"
                value={displayVital(
                  latestVital?.pulse,
                  " bpm"
                )}
                icon={faChartLine}
              />

              <HeaderVital
                label="Oxygen"
                value={displayVital(
                  latestVital?.oxygen_saturation,
                  "%"
                )}
                icon={faWind}
              />

              <HeaderVital
                label="Pain"
                value={displayVital(
                  latestVital?.pain_score,
                  "/10"
                )}
                icon={faCircleExclamation}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className={`border-b px-5 py-3 lg:px-8 ${
          hasRecordedAllergy
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-green-200 bg-green-50 text-green-800"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <AppIcon
            icon={
              hasRecordedAllergy
                ? faCircleExclamation
                : faShieldHeart
            }
          />

          <span className="font-semibold">
            Allergies:
          </span>

          <span>
            {hasRecordedAllergy
              ? allergies
              : "No known allergies recorded"}
          </span>

          <span className="hidden text-slate-300 sm:inline">
            •
          </span>

          <span className="text-slate-600">
            Blood group:{" "}
            <strong>
              {cleanText(
                resident.blood_group
              ) || "Not recorded"}
            </strong>
          </span>
        </div>
      </section>

      <nav className="sticky top-0 z-20 overflow-x-auto border-b border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-max items-center px-5 lg:px-8">
          <ClinicalTab
            href="#overview"
            label="Overview"
            active
          />

          <ClinicalTab
            href="#profile"
            label="Profile"
          />

          <ClinicalTab
            href="#medications"
            label="Medications"
          />

          <ClinicalTab
            href="#vitals"
            label="Vitals"
          />

          <ClinicalTab
            href="#timeline"
            label="Clinical Timeline"
          />

          <ClinicalTab
            href="/care-plans"
            label="Care Plan"
          />

          <ClinicalTab
            href={`/residents/${resident.id}/medication-history`}
            label="Medication History"
          />
        </div>
      </nav>

      <main
        id="overview"
        className="px-5 py-6 lg:px-8"
      >
        <section className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Clinical Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record or review clinical
              information for{" "}
              <span className="font-semibold text-slate-700">
                {residentName}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionLink
              href={`/add-vitals${residentQuery}`}
              icon={faHeartPulse}
              label="Record Vitals"
              primary
            />

            <ActionLink
              href={`/add-medication${residentQuery}`}
              icon={faPills}
              label="Add Medication"
            />

            <ActionLink
              href={`/add-nursing-note${residentQuery}`}
              icon={faNotesMedical}
              label="Nursing Note"
            />

            <ActionLink
              href={`/add-incident-report${residentQuery}`}
              icon={faCircleExclamation}
              label="Incident Report"
            />

            <ActionLink
              href="/care-plans"
              icon={faClipboardList}
              label="Care Plan"
            />
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <section
              id="medications"
              className="scroll-mt-24 overflow-hidden border border-slate-200 bg-white shadow-sm"
            >
              <SectionHeader
                icon={faPills}
                title="Medication Administration"
                subtitle={`${medicationCount} administration record${
                  medicationCount === 1
                    ? ""
                    : "s"
                }`}
                action={
                  <Link
                    href={`/residents/${resident.id}/medication-history`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    View complete history

                    <AppIcon
                      icon={faArrowRight}
                      className="text-xs"
                    />
                  </Link>
                }
              />

              {recentMedications.length ===
              0 ? (
                <EmptySection
                  icon={faPills}
                  title="No medication history"
                  description="Medication administration records will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="border-b border-green-200 bg-green-50">
                        <TableHeading>
                          Medication
                        </TableHeading>

                        <TableHeading>
                          Dosage
                        </TableHeading>

                        <TableHeading>
                          Status
                        </TableHeading>

                        <TableHeading>
                          Administered
                        </TableHeading>

                        <TableHeading>
                          Staff
                        </TableHeading>

                        <TableHeading>
                          Notes
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {recentMedications.map(
                        (item) => {
                          const medication =
                            getMedicationDetails(
                              item
                            );

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                    <AppIcon
                                      icon={
                                        faPills
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {
                                        medication.name
                                      }
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Record #
                                      {item.id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3.5 text-sm text-slate-700">
                                {
                                  medication.dosage
                                }
                              </td>

                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getMedicationStatusStyle(
                                    item.status
                                  )}`}
                                >
                                  <AppIcon
                                    icon={getMedicationStatusIcon(
                                      item.status
                                    )}
                                  />

                                  {cleanText(
                                    item.status
                                  ) ||
                                    "Not recorded"}
                                </span>
                              </td>

                              <td className="px-4 py-3.5 text-sm text-slate-600">
                                {formatDateTime(
                                  item.administered_at
                                )}
                              </td>

                              <td className="px-4 py-3.5 text-sm text-slate-700">
                                {cleanText(
                                  item.administered_by
                                ) ||
                                  "Not recorded"}
                              </td>

                              <td className="max-w-[260px] px-4 py-3.5">
                                <p className="truncate text-sm text-slate-600">
                                  {cleanText(
                                    item.notes
                                  ) ||
                                    cleanText(
                                      item.reason
                                    ) ||
                                    "—"}
                                </p>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section
              id="timeline"
              className="scroll-mt-24 overflow-hidden border border-slate-200 bg-white shadow-sm"
            >
              <SectionHeader
                icon={faClockRotateLeft}
                title="Clinical Timeline"
                subtitle={`${timeline.length} clinical record${
                  timeline.length === 1
                    ? ""
                    : "s"
                }`}
              />

              {recentTimeline.length ===
              0 ? (
                <EmptySection
                  icon={faClockRotateLeft}
                  title="No clinical records"
                  description="Vitals, nursing notes, medication events, and incidents will appear here."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTimeline.map(
                    (item, index) => (
                      <article
                        key={`${item.type}-${item.date}-${index}`}
                        className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[48px_minmax(0,1fr)_170px]"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTimelineStyle(
                            item.type
                          )}`}
                        >
                          <AppIcon
                            icon={getTimelineIcon(
                              item.type
                            )}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {cleanText(
                                item.type
                              ) ||
                                "Clinical Record"}
                            </h3>

                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              Resident #
                              {resident.id}
                            </span>
                          </div>

                          <p className="mt-1 break-words text-sm font-medium text-slate-700">
                            {cleanText(
                              item.title
                            ) ||
                              "No details recorded"}
                          </p>

                          <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                            {cleanText(
                              item.subtitle
                            ) || "—"}
                          </p>
                        </div>

                        <time className="text-sm text-slate-500 sm:text-right">
                          {formatDateTime(
                            item.date
                          )}
                        </time>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section
              id="profile"
              className="scroll-mt-24 border border-slate-200 bg-white shadow-sm"
            >
              <SectionHeader
                icon={faIdCard}
                title="Resident Profile"
                compact
              />

              <div className="divide-y divide-slate-100 px-5">
                <ProfileRow
                  icon={faBed}
                  label="Room"
                  value={
                    cleanText(
                      resident.room
                    ) || "Unassigned"
                  }
                />

                <ProfileRow
                  icon={faCalendarDays}
                  label="Date of Birth"
                  value={formatDate(
                    resident.date_of_birth
                  )}
                />

                <ProfileRow
                  icon={faVenusMars}
                  label="Gender"
                  value={
                    cleanText(
                      resident.gender
                    ) || "Not recorded"
                  }
                />

                <ProfileRow
                  icon={faCalendarDays}
                  label="Admission Date"
                  value={formatDate(
                    resident.date_admitted
                  )}
                />

                <ProfileRow
                  icon={faStethoscope}
                  label="Primary Doctor"
                  value={
                    cleanText(
                      resident.primary_doctor
                    ) ||
                    "Not assigned"
                  }
                />

                <ProfileRow
                  icon={faUser}
                  label="Next of Kin"
                  value={
                    cleanText(
                      resident.next_of_kin
                    ) ||
                    "Not recorded"
                  }
                />

                <ProfileRow
                  icon={faPhone}
                  label="Contact"
                  value={
                    cleanText(
                      resident.next_of_kin_phone
                    ) ||
                    cleanText(
                      resident.emergency_contact
                    ) ||
                    "Not recorded"
                  }
                />
              </div>
            </section>

            <section
              id="vitals"
              className="scroll-mt-24 border border-slate-200 bg-white shadow-sm"
            >
              <SectionHeader
                icon={faHeartPulse}
                title="Latest Vitals"
                subtitle={
                  latestVital
                    ? formatDateTime(
                        latestVital.recorded_at
                      )
                    : "No vital signs recorded"
                }
                compact
              />

              <div className="grid grid-cols-2 gap-px bg-slate-200">
                <VitalCell
                  icon={faHeartPulse}
                  label="Blood Pressure"
                  value={
                    latestVital?.systolic !==
                      null &&
                    latestVital?.systolic !==
                      undefined &&
                    latestVital?.diastolic !==
                      null &&
                    latestVital?.diastolic !==
                      undefined
                      ? `${latestVital.systolic}/${latestVital.diastolic}`
                      : "—"
                  }
                />

                <VitalCell
                  icon={faTemperatureHalf}
                  label="Temperature"
                  value={displayVital(
                    latestVital?.temperature,
                    "°C"
                  )}
                />

                <VitalCell
                  icon={faChartLine}
                  label="Pulse"
                  value={displayVital(
                    latestVital?.pulse,
                    " bpm"
                  )}
                />

                <VitalCell
                  icon={faWind}
                  label="Oxygen"
                  value={displayVital(
                    latestVital?.oxygen_saturation,
                    "%"
                  )}
                />

                <VitalCell
                  icon={faCircleExclamation}
                  label="Pain"
                  value={displayVital(
                    latestVital?.pain_score,
                    "/10"
                  )}
                />

                <VitalCell
                  icon={faUser}
                  label="Recorded By"
                  value={
                    cleanText(
                      latestVital?.recorded_by
                    ) || "—"
                  }
                />
              </div>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={faShieldHeart}
                title="Clinical Summary"
                compact
              />

              <div className="grid grid-cols-2 gap-px bg-slate-200">
                <SummaryMetric
                  label="Medication Records"
                  value={medicationCount}
                />

                <SummaryMetric
                  label="Vital Records"
                  value={vitalCount}
                />

                <SummaryMetric
                  label="Nursing Notes"
                  value={nursingNoteCount}
                />

                <SummaryMetric
                  label="Incident Reports"
                  value={incidentCount}
                  warning={
                    incidentCount > 0
                  }
                />
              </div>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={faFileMedical}
                title="Care Information"
                compact
              />

              <div className="space-y-4 p-5">
                <CareInformation
                  label="Diagnosis"
                  value={
                    cleanText(
                      resident.diagnosis
                    ) ||
                    "Not recorded"
                  }
                />

                <CareInformation
                  label="Allergies"
                  value={
                    hasRecordedAllergy
                      ? allergies
                      : "No known allergies recorded"
                  }
                  warning={
                    hasRecordedAllergy
                  }
                />

                <CareInformation
                  label="Resident Notes"
                  value={
                    cleanText(
                      resident.notes
                    ) ||
                    "No resident notes recorded"
                  }
                />
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

type HeaderDetailProps = {
  icon: IconDefinition;
  value: string;
};

function HeaderDetail({
  icon,
  value,
}: HeaderDetailProps) {
  return (
    <div className="flex items-center gap-2">
      <AppIcon
        icon={icon}
        className="text-green-200"
      />

      <span>{value}</span>
    </div>
  );
}

type HeaderVitalProps = {
  label: string;
  value: string;
  icon: IconDefinition;
};

function HeaderVital({
  label,
  value,
  icon,
}: HeaderVitalProps) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-green-100">
        <AppIcon
          icon={icon}
          className="text-xs"
        />

        <p className="truncate text-[11px] font-medium">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

type ClinicalTabProps = {
  href: string;
  label: string;
  active?: boolean;
};

function ClinicalTab({
  href,
  label,
  active = false,
}: ClinicalTabProps) {
  return (
    <Link
      href={href}
      className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-green-700 text-green-700"
          : "border-transparent text-slate-600 hover:border-green-300 hover:text-green-700"
      }`}
    >
      {label}
    </Link>
  );
}

type ActionLinkProps = {
  href: string;
  icon: IconDefinition;
  label: string;
  primary?: boolean;
};

function ActionLink({
  href,
  icon,
  label,
  primary = false,
}: ActionLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
        primary
          ? "bg-green-700 text-white hover:bg-green-800"
          : "border border-slate-300 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
      }`}
    >
      <AppIcon icon={icon} />

      {label}
    </Link>
  );
}

type SectionHeaderProps = {
  icon: IconDefinition;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  compact?: boolean;
};

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
          <AppIcon icon={icon} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action}
    </header>
  );
}

type TableHeadingProps = {
  children: ReactNode;
};

function TableHeading({
  children,
}: TableHeadingProps) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-green-800">
      {children}
    </th>
  );
}

type EmptySectionProps = {
  icon: IconDefinition;
  title: string;
  description: string;
};

function EmptySection({
  icon,
  title,
  description,
}: EmptySectionProps) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
        <AppIcon icon={icon} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

type ProfileRowProps = {
  icon: IconDefinition;
  label: string;
  value: string;
};

function ProfileRow({
  icon,
  label,
  value,
}: ProfileRowProps) {
  return (
    <div className="flex items-start gap-3 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <AppIcon icon={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

type VitalCellProps = {
  icon: IconDefinition;
  label: string;
  value: string;
};

function VitalCell({
  icon,
  label,
  value,
}: VitalCellProps) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <AppIcon
          icon={icon}
          className="text-xs"
        />

        <p className="text-xs font-medium">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

type SummaryMetricProps = {
  label: string;
  value: number;
  warning?: boolean;
};

function SummaryMetric({
  label,
  value,
  warning = false,
}: SummaryMetricProps) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${
          warning
            ? "text-red-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type CareInformationProps = {
  label: string;
  value: string;
  warning?: boolean;
};

function CareInformation({
  label,
  value,
  warning = false,
}: CareInformationProps) {
  return (
    <div
      className={`border-l-4 px-4 py-3 ${
        warning
          ? "border-red-500 bg-red-50"
          : "border-green-600 bg-green-50"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          warning
            ? "text-red-700"
            : "text-green-700"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 break-words text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}