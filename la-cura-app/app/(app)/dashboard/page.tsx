import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  Pill,
  Users,
} from "lucide-react";

import {
  getClinicalAlerts,
} from "@/lib/alerts";

import {
  getDashboardStats,
} from "@/lib/dashboardStats";

import {
  getRecentMedicationActivity,
  getRecentVitalActivity,
} from "@/lib/recentActivity";

import {
  getTodayTasks,
} from "@/lib/tasks";

export const dynamic =
  "force-dynamic";


type AlertRecord = {
  type?: string | null;
  resident?: string | null;
  message?: string | null;
};


type TaskRecord = {
  title?: string | null;
  value?: number | null;
};


type MedicationActivity = {
  id: number;
  status?: string | null;
  administered_at?: string | null;
  administered_by?: string | null;

  residents?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;

  medications?:
    | {
        medication_name?: string | null;
      }
    | {
        medication_name?: string | null;
      }[]
    | null;
};


type VitalActivity = {
  id: number;
  recorded_at?: string | null;
  recorded_by?: string | null;

  residents?:
    | {
        full_name?: string | null;
      }
    | null;
};


function cleanText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function relationText(
  value:
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null
    | undefined,
  key: string
) {
  const relation =
    Array.isArray(value)
      ? value[0]
      : value;

  if (!relation) {
    return "";
  }

  return cleanText(
    relation[key]
  );
}


function formatDateTime(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function alertStyle(
  value: unknown
) {
  const type =
    cleanText(
      value
    ).toLowerCase();

  if (
    type.includes("critical") ||
    type.includes("urgent") ||
    type.includes("high")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    type.includes("warning") ||
    type.includes("moderate")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}


export default async function DashboardPage() {
  const [
    stats,
    medicationActivityRaw,
    vitalActivityRaw,
    alertsRaw,
    tasksRaw,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentMedicationActivity(),
    getRecentVitalActivity(),
    getClinicalAlerts(),
    getTodayTasks(),
  ]);

  const medicationActivity =
    medicationActivityRaw as
      MedicationActivity[];

  const vitalActivity =
    vitalActivityRaw as
      VitalActivity[];

  const alerts =
    alertsRaw as AlertRecord[];

  const tasks =
    tasksRaw as TaskRecord[];

  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE TITLE */}

      <section className="border-b border-[#CCD5D0] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7A8982]">
              Clinical Operations
            </p>

            <h1 className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
              Home
            </h1>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <DashboardAction
              href="/add-vitals"
              label="Record Vitals"
            />

            <DashboardAction
              href="/add-medication"
              label="Add Medication"
            />

            <DashboardAction
              href="/add-nursing-note"
              label="Progress Note"
            />

            <DashboardAction
              href="/residents"
              label="Resident List"
              primary
            />
          </div>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* COMPACT PCC-LIKE METRIC STRIP */}

        <section className="mb-3 border border-[#C7D1CC] bg-white">
          <div className="border-b border-[#D4DDD8] bg-[#E7EDE9] px-3 py-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
              Clinical Overview
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-5">
            <MetricCell
              label="Residents"
              value={stats.residents}
              href="/residents"
              icon={
                <Users size={15} />
              }
            />

            <MetricCell
              label="Staff"
              value={stats.staff}
              icon={
                <Users size={15} />
              }
            />

            <MetricCell
              label="Medication Orders"
              value={
                stats.medications
              }
              href="/medications"
              icon={
                <Pill size={15} />
              }
            />

            <MetricCell
              label="Vital Records"
              value={stats.vitals}
              href="/add-vitals"
              icon={
                <HeartPulse
                  size={15}
                />
              }
            />

            <MetricCell
              label="Medication Passes"
              value={
                stats.medicationAdministration
              }
              href="/medication-administration"
              icon={
                <ClipboardCheck
                  size={15}
                />
              }
            />
          </div>
        </section>


        {/* FIRST CLINICAL ROW */}

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
          {/* ALERTS */}

          <ClinicalPanel
            title="Clinical Alerts"
            right={
              alerts.length > 0
                ? `${alerts.length} requiring review`
                : "No active alerts"
            }
          >
            {alerts.length ===
            0 ? (
              <EmptyState
                icon={
                  <CheckCircle2
                    size={17}
                  />
                }
                title="No active clinical alerts"
                description="No resident alerts currently require review."
                success
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="bg-[#F4F6F4] text-[10px] font-bold uppercase tracking-[0.03em] text-[#40544B]">
                      <ClinicalHead>
                        Severity
                      </ClinicalHead>

                      <ClinicalHead>
                        Resident
                      </ClinicalHead>

                      <ClinicalHead>
                        Alert
                      </ClinicalHead>

                      <ClinicalHead>
                        Message
                      </ClinicalHead>
                    </tr>
                  </thead>

                  <tbody>
                    {alerts.map(
                      (
                        alert,
                        index
                      ) => (
                        <tr
                          key={`${alert.type}-${alert.resident}-${index}`}
                          className={`
                            border-b
                            border-[#E0E6E3]
                            text-[11px]

                            ${
                              index %
                                2 ===
                              0
                                ? "bg-white"
                                : "bg-[#FBFAF7]"
                            }
                          `}
                        >
                          <td className="px-3 py-2">
                            <span
                              className={`
                                inline-flex
                                items-center
                                rounded-[3px]
                                border
                                px-1.5
                                py-0.5
                                text-[9px]
                                font-bold
                                uppercase
                                ${alertStyle(
                                  alert.type
                                )}
                              `}
                            >
                              <AlertTriangle
                                size={10}
                                className="mr-1"
                              />

                              {cleanText(
                                alert.type
                              ) ||
                                "Alert"}
                            </span>
                          </td>

                          <td className="px-3 py-2 font-semibold text-[#263A32]">
                            {cleanText(
                              alert.resident
                            ) ||
                              "Resident"}
                          </td>

                          <td className="px-3 py-2 text-[#40544B]">
                            {cleanText(
                              alert.type
                            ) ||
                              "Clinical Alert"}
                          </td>

                          <td className="max-w-[360px] px-3 py-2 text-[#607169]">
                            {cleanText(
                              alert.message
                            ) ||
                              "Review resident record."}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </ClinicalPanel>


          {/* OPERATIONAL COUNTERS */}

          <ClinicalPanel
            title="Clinical Workload"
            right="Current recorded activity"
          >
            {tasks.length ===
            0 ? (
              <EmptyState
                icon={
                  <CheckCircle2
                    size={17}
                  />
                }
                title="No workload counters"
                description="No task data is currently available."
                success
              />
            ) : (
              <div>
                {tasks.map(
                  (
                    task,
                    index
                  ) => (
                    <div
                      key={`${task.title}-${index}`}
                      className="
                        grid
                        grid-cols-[minmax(0,1fr)_90px]
                        border-b
                        border-[#E0E6E3]
                        last:border-b-0
                      "
                    >
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] font-semibold text-[#31463D]">
                          {cleanText(
                            task.title
                          ) ||
                            "Clinical Activity"}
                        </p>
                      </div>

                      <div className="border-l border-[#E0E6E3] bg-[#FBFAF7] px-3 py-2.5 text-right">
                        <span className="text-[16px] font-bold text-[#073B2F]">
                          {task.value ??
                            0}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </ClinicalPanel>
        </div>


        {/* SECOND ROW */}

        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {/* MEDICATION ACTIVITY */}

          <ClinicalPanel
            title="Recent Medication Activity"
            right={
              <Link
                href="/medication-administration"
                className="font-semibold text-[#073B2F] hover:underline"
              >
                View MAR
              </Link>
            }
          >
            {medicationActivity.length ===
            0 ? (
              <TableEmpty message="No recent medication administration activity." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="bg-[#F4F6F4] text-[10px] font-bold uppercase tracking-[0.03em] text-[#40544B]">
                      <ClinicalHead>
                        Date / Time
                      </ClinicalHead>

                      <ClinicalHead>
                        Resident
                      </ClinicalHead>

                      <ClinicalHead>
                        Medication
                      </ClinicalHead>

                      <ClinicalHead>
                        Status
                      </ClinicalHead>

                      <ClinicalHead>
                        Staff
                      </ClinicalHead>
                    </tr>
                  </thead>

                  <tbody>
                    {medicationActivity.map(
                      (
                        item,
                        index
                      ) => {
                        const resident =
                          relationText(
                            item.residents as
                              | Record<
                                  string,
                                  unknown
                                >
                              | Record<
                                  string,
                                  unknown
                                >[]
                              | null,
                            "full_name"
                          );

                        const medication =
                          relationText(
                            item.medications as
                              | Record<
                                  string,
                                  unknown
                                >
                              | Record<
                                  string,
                                  unknown
                                >[]
                              | null,
                            "medication_name"
                          );

                        return (
                          <tr
                            key={
                              item.id
                            }
                            className={`
                              border-b
                              border-[#E0E6E3]
                              text-[11px]

                              ${
                                index %
                                  2 ===
                                0
                                  ? "bg-white"
                                  : "bg-[#FBFAF7]"
                              }
                            `}
                          >
                            <td className="whitespace-nowrap px-3 py-2 text-[#5C6D65]">
                              {formatDateTime(
                                item.administered_at
                              )}
                            </td>

                            <td className="px-3 py-2 font-semibold text-[#263A32]">
                              {resident ||
                                "Resident"}
                            </td>

                            <td className="px-3 py-2 text-[#40544B]">
                              {medication ||
                                "Medication"}
                            </td>

                            <td className="px-3 py-2">
                              <StatusBadge
                                value={
                                  cleanText(
                                    item.status
                                  ) ||
                                  "Recorded"
                                }
                              />
                            </td>

                            <td className="px-3 py-2 text-[#5C6D65]">
                              {cleanText(
                                item.administered_by
                              ) ||
                                "—"}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </ClinicalPanel>


          {/* VITAL ACTIVITY */}

          <ClinicalPanel
            title="Recent Vital-Sign Activity"
            right={
              <Link
                href="/add-vitals"
                className="font-semibold text-[#073B2F] hover:underline"
              >
                Record vitals
              </Link>
            }
          >
            {vitalActivity.length ===
            0 ? (
              <TableEmpty message="No recent vital-sign activity." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse">
                  <thead>
                    <tr className="bg-[#F4F6F4] text-[10px] font-bold uppercase tracking-[0.03em] text-[#40544B]">
                      <ClinicalHead>
                        Date / Time
                      </ClinicalHead>

                      <ClinicalHead>
                        Resident
                      </ClinicalHead>

                      <ClinicalHead>
                        Activity
                      </ClinicalHead>

                      <ClinicalHead>
                        Recorded By
                      </ClinicalHead>
                    </tr>
                  </thead>

                  <tbody>
                    {vitalActivity.map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            item.id
                          }
                          className={`
                            border-b
                            border-[#E0E6E3]
                            text-[11px]

                            ${
                              index %
                                2 ===
                              0
                                ? "bg-white"
                                : "bg-[#FBFAF7]"
                            }
                          `}
                        >
                          <td className="whitespace-nowrap px-3 py-2 text-[#5C6D65]">
                            {formatDateTime(
                              item.recorded_at
                            )}
                          </td>

                          <td className="px-3 py-2 font-semibold text-[#263A32]">
                            {cleanText(
                              item.residents
                                ?.full_name
                            ) ||
                              "Resident"}
                          </td>

                          <td className="px-3 py-2 text-[#40544B]">
                            Vital signs recorded
                          </td>

                          <td className="px-3 py-2 text-[#5C6D65]">
                            {cleanText(
                              item.recorded_by
                            ) ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </ClinicalPanel>
        </div>


        {/* QUICK CLINICAL LINKS */}

        <section className="mt-3 border border-[#C7D1CC] bg-white">
          <div className="border-b border-[#D4DDD8] bg-[#E7EDE9] px-3 py-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
              Clinical Shortcuts
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            <Shortcut
              href="/residents"
              icon={
                <Users size={15} />
              }
              title="Residents"
              detail="Open resident records"
            />

            <Shortcut
              href="/medications"
              icon={
                <Pill size={15} />
              }
              title="Medication Orders"
              detail="Review medication records"
            />

            <Shortcut
              href="/medication-administration"
              icon={
                <ClipboardCheck
                  size={15}
                />
              }
              title="Medication Administration"
              detail="Open MAR workspace"
            />

            <Shortcut
              href="/appointments"
              icon={
                <CalendarDays
                  size={15}
                />
              }
              title="Appointments"
              detail="Review clinical schedule"
            />
          </div>
        </section>
      </main>
    </div>
  );
}


function ClinicalPanel({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 border border-[#C7D1CC] bg-white">
      <div className="flex min-h-[34px] items-center justify-between gap-3 border-b border-[#D4DDD8] bg-[#E7EDE9] px-3 py-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
          {title}
        </h2>

        {right && (
          <div className="text-[10px] text-[#6B7B74]">
            {right}
          </div>
        )}
      </div>

      {children}
    </section>
  );
}


function MetricCell({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number;
  href?: string;
  icon: ReactNode;
}) {
  const content = (
    <div
      className={`
        flex min-h-[76px]
        items-center gap-3
        border-b
        border-[#D8DFDB]
        px-4 py-3
        sm:border-r
        xl:border-b-0
        xl:last:border-r-0

        ${
          href
            ? "transition-colors hover:bg-[#FBFAF7]"
            : ""
        }
      `}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#CAD5CF] bg-[#EEF3EF] text-[#073B2F]">
        {icon}
      </span>

      <div>
        <p className="text-[21px] font-bold leading-none text-[#073B2F]">
          {value}
        </p>

        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.035em] text-[#687970]">
          {label}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}


function DashboardAction({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        inline-flex h-7
        items-center
        border px-2.5
        text-[10px]
        font-bold
        transition

        ${
          primary
            ? "border-[#073B2F] bg-[#073B2F] text-white hover:bg-[#0D4A3A]"
            : "border-[#AEBDB5] bg-white text-[#30483E] hover:bg-[#F2F5F3]"
        }
      `}
    >
      {label}
    </Link>
  );
}


function ClinicalHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="border-r border-[#D2DBD6] px-3 py-2 text-left last:border-r-0">
      {children}
    </th>
  );
}


function StatusBadge({
  value,
}: {
  value: string;
}) {
  const normalized =
    value.toLowerCase();

  const danger =
    normalized.includes(
      "refus"
    ) ||
    normalized.includes(
      "miss"
    ) ||
    normalized.includes(
      "held"
    ) ||
    normalized.includes(
      "error"
    );

  return (
    <span
      className={`
        inline-flex
        whitespace-nowrap
        border
        px-1.5
        py-0.5
        text-[9px]
        font-bold

        ${
          danger
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }
      `}
    >
      {value}
    </span>
  );
}


function EmptyState({
  icon,
  title,
  description,
  success = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-7">
      <span
        className={`
          flex h-9 w-9
          shrink-0
          items-center
          justify-center
          border

          ${
            success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-[#D2DAD6] bg-[#F5F6F4] text-[#65766E]"
          }
        `}
      >
        {icon}
      </span>

      <div>
        <p className="text-[11px] font-bold text-[#30443B]">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-[#718078]">
          {description}
        </p>
      </div>
    </div>
  );
}


function TableEmpty({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-4 py-8 text-center text-[11px] text-[#6B7A73]">
      {message}
    </div>
  );
}


function Shortcut({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center
        gap-3 border-b
        border-[#DCE3DF]
        px-3 py-3
        transition
        hover:bg-[#FBFAF7]
        sm:border-r
        lg:border-b-0
        lg:last:border-r-0
      "
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#CBD5D0] bg-[#EEF3EF] text-[#073B2F]">
        {icon}
      </span>

      <span>
        <span className="block text-[11px] font-bold text-[#30443B]">
          {title}
        </span>

        <span className="mt-0.5 block text-[9px] text-[#74837C]">
          {detail}
        </span>
      </span>
    </Link>
  );
}
