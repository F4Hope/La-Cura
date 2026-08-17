"use client";

import useAppUi from "@/components/i18n/useAppUi";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  RotateCcw,
  Search,
} from "lucide-react";


type AppointmentRecord = {
  id: number;
  resident_id?: number | null;
  resident_name?: string | null;
  appointment_date?: string | null;
  appointment_time?: string | null;
  appointment_type?: string | null;
  provider?: string | null;
  location?: string | null;
  status?: string | null;
  notes?: string | null;
};


/*
 * Appointment storage is not currently connected on this page.
 * Keep the workspace honest rather than displaying invented records.
 */
const appointmentRecords: AppointmentRecord[] = [];


function cleanText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function normalize(
  value: unknown
) {
  return cleanText(
    value
  ).toLowerCase();
}


function statusStyle(
  value: string
) {
  const status =
    value.toLowerCase();

  if (
    status.includes("cancel") ||
    status.includes("miss")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    status.includes("complete")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (
    status.includes("pending") ||
    status.includes("scheduled")
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
}


export default function AppointmentsPage() {
  const { ui } =
    useAppUi();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const filtered =
    useMemo(() => {
      const query =
        normalize(search);

      return appointmentRecords
        .filter(
          (appointment) => {
            const status =
              cleanText(
                appointment.status
              ) ||
              "Scheduled";

            const matchesStatus =
              statusFilter === "all" ||
              normalize(
                status
              ).includes(
                statusFilter
              );

            const matchesSearch =
              !query ||
              [
                appointment.resident_name,
                appointment.appointment_type,
                appointment.provider,
                appointment.location,
                appointment.notes,
                status,
              ].some(
                (value) =>
                  normalize(
                    value
                  ).includes(query)
              );

            return (
              matchesStatus &&
              matchesSearch
            );
          }
        )
        .sort(
          (a, b) => {
            const first =
              `${a.appointment_date ?? ""} ${a.appointment_time ?? ""}`;

            const second =
              `${b.appointment_date ?? ""} ${b.appointment_time ?? ""}`;

            return first.localeCompare(
              second
            );
          }
        );
    }, [
      search,
      statusFilter,
    ]);


  const scheduled =
    appointmentRecords.filter(
      (appointment) =>
        normalize(
          appointment.status ||
            "Scheduled"
        ).includes(
          "schedul"
        )
    ).length;


  const completed =
    appointmentRecords.filter(
      (appointment) =>
        normalize(
          appointment.status
        ).includes(
          "complete"
        )
    ).length;


  const exceptions =
    appointmentRecords.filter(
      (appointment) => {
        const status =
          normalize(
            appointment.status
          );

        return (
          status.includes(
            "miss"
          ) ||
          status.includes(
            "cancel"
          )
        );
      }
    ).length;


  function resetFilters() {
    setSearch("");
    setStatusFilter(
      "all"
    );
  }


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE HEADER */}

      <section className="border-b border-[#CCD5D0] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="hover:text-[#073B2F]"
              >
                {ui("Home")}</Link>

              <span>/</span>

              <span className="font-semibold text-[#40524B]">
                {ui("Appointments")}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                {ui("Resident Appointments")}</h1>

              <p className="text-xs text-[#718078]">
                {ui("Clinical and external appointment schedule")}</p>
            </div>
          </div>


          <div className="flex gap-1.5">
            <Link
              href="/residents"
              className="
                inline-flex h-8
                items-center
                border border-[#AAB8B1]
                bg-white px-3
                text-[10px]
                font-bold
                text-[#30483E]
                hover:border-[#073B2F]
                hover:bg-[#F2F5F3]
              "
            >
              {ui("Resident List")}</Link>

            <Link
              href="/reports"
              className="
                inline-flex h-8
                items-center
                border border-[#073B2F]
                bg-[#073B2F]
                px-3
                text-[10px]
                font-bold
                text-white
                hover:bg-[#0D4A3A]
              "
            >
              {ui("Appointment Reports")}</Link>
          </div>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* SUMMARY */}

        <section className="mb-3 grid border border-[#CBD4D0] bg-white sm:grid-cols-4">
          <SummaryCell
            label={ui("Appointments")}
            value={
              appointmentRecords.length
            }
          />

          <SummaryCell
            label={ui("Scheduled")}
            value={scheduled}
            info
          />

          <SummaryCell
            label={ui("Completed")}
            value={completed}
            success
          />

          <SummaryCell
            label={ui("Missed / Cancelled")}
            value={exceptions}
            danger={
              exceptions > 0
            }
          />
        </section>


        <section className="border border-[#C8D2CD] bg-white">
          {/* TOOLBAR */}

          <div className="border-b border-[#D8DFDB] bg-[#F8F7F2] p-2.5">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6D7D76]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder={ui("Search resident, provider, appointment type, location...")}
                  className="
                    h-8 w-full
                    border border-[#BCC9C3]
                    bg-white
                    pl-8 pr-3
                    text-xs
                    text-[#1D2F28]
                    outline-none
                    placeholder:text-[#8B9892]
                    focus:border-[#59766B]
                    focus:ring-1
                    focus:ring-[#59766B]/20
                  "
                />
              </div>


              <div className="flex flex-wrap gap-1">
                <FilterButton
                  label={ui("All")}
                  active={
                    statusFilter ===
                    "all"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "all"
                    )
                  }
                />

                <FilterButton
                  label={ui("Scheduled")}
                  active={
                    statusFilter ===
                    "schedul"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "schedul"
                    )
                  }
                />

                <FilterButton
                  label={ui("Completed")}
                  active={
                    statusFilter ===
                    "complete"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "complete"
                    )
                  }
                />

                <FilterButton
                  label={ui("Cancelled")}
                  active={
                    statusFilter ===
                    "cancel"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "cancel"
                    )
                  }
                />

                <FilterButton
                  label={ui("Missed")}
                  active={
                    statusFilter ===
                    "miss"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "miss"
                    )
                  }
                />

                {(search ||
                  statusFilter !==
                    "all") && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="
                      ml-1
                      inline-flex h-8
                      items-center
                      gap-1.5
                      border
                      border-[#BCC9C3]
                      bg-white
                      px-2.5
                      text-[10px]
                      font-bold
                      text-[#52645C]
                      hover:bg-[#F2F4F2]
                    "
                  >
                    <RotateCcw
                      size={11}
                    />

                    {ui("Reset")}</button>
                )}
              </div>
            </div>
          </div>


          {/* RESULT BAR */}

          <div className="flex items-center justify-between gap-3 border-b border-[#D8DFDB] bg-[#FBFAF7] px-3 py-1.5 text-[10px]">
            <span className="text-[#607169]">
              {ui("Showing")}{" "}
              <strong className="text-[#263A32]">
                {filtered.length}
              </strong>{" "}
              {ui("appointment")}{filtered.length ===
              1
                ? ""
                : "s"}
            </span>

            <span className="font-semibold text-[#7D6A35]">
              {ui("Appointment Schedule")}</span>
          </div>


          {/* TABLE */}

          {filtered.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1350px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase tracking-[0.035em] text-[#354A41]">
                    <ClinicalHead>
                      {ui("Date")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Time")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Resident")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Appointment Type")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Provider")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Location")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Status")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Notes")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Action")}</ClinicalHead>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (
                      appointment,
                      index
                    ) => {
                      const status =
                        cleanText(
                          appointment.status
                        ) ||
                        "Scheduled";

                      return (
                        <tr
                          key={
                            appointment.id
                          }
                          className={`
                            border-b
                            border-[#E1E6E3]
                            text-[11px]

                            ${
                              index %
                                2 ===
                              0
                                ? "bg-white"
                                : "bg-[#FAFAF7]"
                            }

                            hover:bg-[#FFFDF7]
                          `}
                        >
                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#40544B]">
                            {cleanText(
                              appointment.appointment_date
                            ) ||
                              "—"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-[#40544B]">
                            {cleanText(
                              appointment.appointment_time
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2">
                            {appointment.resident_id ? (
                              <Link
                                href={`/residents/${appointment.resident_id}`}
                                className="font-bold text-[#073B2F] hover:underline"
                              >
                                {cleanText(
                                  appointment.resident_name
                                ) ||
                                  "Resident"}
                              </Link>
                            ) : (
                              <span className="font-bold text-[#30443B]">
                                {cleanText(
                                  appointment.resident_name
                                ) ||
                                  "Resident"}
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-2 text-[#40544B]">
                            {cleanText(
                              appointment.appointment_type
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#40544B]">
                            {cleanText(
                              appointment.provider
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#52645C]">
                            {cleanText(
                              appointment.location
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`
                                inline-flex
                                whitespace-nowrap
                                border
                                px-1.5
                                py-0.5
                                text-[9px]
                                font-bold
                                ${statusStyle(
                                  status
                                )}
                              `}
                            >
                              {ui(status)}
                            </span>
                          </td>

                          <td className="max-w-[280px] px-3 py-2 text-[#52645C]">
                            {cleanText(
                              appointment.notes
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2">
                            {appointment.resident_id ? (
                              <Link
                                href={`/residents/${appointment.resident_id}`}
                                className="
                                  inline-flex h-7
                                  items-center
                                  border
                                  border-[#98AAA1]
                                  bg-white
                                  px-2.5
                                  text-[10px]
                                  font-bold
                                  text-[#073B2F]
                                  hover:border-[#073B2F]
                                  hover:bg-[#F0F4F1]
                                "
                              >
                                {ui("Resident")}</Link>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[230px] items-center justify-center px-6 py-12">
              <div className="max-w-lg text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center border border-[#CBD5D0] bg-[#EEF3EF] text-[#073B2F]">
                  <CalendarDays
                    size={17}
                  />
                </span>

                <h2 className="mt-3 text-[12px] font-bold text-[#30443B]">
                  {ui("No appointment records available")}</h2>

                <p className="mx-auto mt-1 max-w-md text-[10px] leading-5 text-[#728078]">
                  {ui("The appointment workspace is ready, but no appointment records are currently connected to this module.")}</p>

                {(search ||
                  statusFilter !==
                    "all") && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="mt-2 text-[10px] font-bold text-[#073B2F] underline"
                  >
                    {ui("Reset filters")}</button>
                )}
              </div>
            </div>
          )}


          <div className="border-t border-[#D1D9D5] bg-[#F8F7F2] px-3 py-2 text-[10px] text-[#607169]">
            {ui("Appointment scheduling data will populate this worklist when the appointment data source is connected.")}</div>
        </section>
      </main>
    </div>
  );
}


function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-8 border
        px-3
        text-[10px]
        font-bold

        ${
          active
            ? "border-[#073B2F] bg-[#073B2F] text-white"
            : "border-[#BCC9C3] bg-white text-[#465A51] hover:bg-[#EEF2EF]"
        }
      `}
    >
      {label}
    </button>
  );
}


function SummaryCell({
  label,
  value,
  info = false,
  success = false,
  danger = false,
}: {
  label: string;
  value: number;
  info?: boolean;
  success?: boolean;
  danger?: boolean;
}) {
  let valueClass =
    "text-[#073B2F]";

  if (info) {
    valueClass =
      "text-blue-700";
  }

  if (success) {
    valueClass =
      "text-emerald-700";
  }

  if (danger) {
    valueClass =
      "text-red-700";
  }

  return (
    <div className="flex items-center gap-3 border-b border-[#D8DFDB] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span
        className={`text-[20px] font-bold ${valueClass}`}
      >
        {value}
      </span>

      <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#6D7D76]">
        {label}
      </span>
    </div>
  );
}


function ClinicalHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="border-r border-[#D2DBD6] px-3 py-2 last:border-r-0">
      {children}
    </th>
  );
}
