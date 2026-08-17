"use client";

import useAppUi from "@/components/i18n/useAppUi";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  RotateCcw,
  Search,
} from "lucide-react";

import AdministerButton from "@/components/AdministerButton";
import HoldButton from "@/components/HoldButton";
import RefusedButton from "@/components/RefusedButton";


export type MedicationAdministrationRecord = {
  id: number;
  resident_id: number;
  resident_name: string;
  medication_name: string;

  dosage?:
    | string
    | null;

  frequency?:
    | string
    | null;

  time_to_take?:
    | string
    | null;

  route?:
    | string
    | null;

  status?:
    | string
    | null;
};


type Props = {
  medications:
    MedicationAdministrationRecord[];
};


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


function medicationStatus(
  medication:
    MedicationAdministrationRecord
) {
  return (
    cleanText(
      medication.status
    ) ||
    "Pending"
  );
}


function statusStyle(
  value: string
) {
  const status =
    value.toLowerCase();

  if (
    status.includes(
      "administer"
    )
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (
    status.includes(
      "held"
    ) ||
    status.includes(
      "hold"
    )
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (
    status.includes(
      "refus"
    )
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}


export default function MedicationAdministrationClinicalTable({
  medications,
}: Props) {
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

      return medications
        .filter(
          (medication) => {
            const status =
              medicationStatus(
                medication
              );

            const matchesStatus =
              statusFilter ===
                "all" ||
              normalize(
                status
              ).includes(
                statusFilter
              );

            const matchesSearch =
              !query ||
              [
                medication.resident_name,
                medication.medication_name,
                medication.dosage,
                medication.frequency,
                medication.time_to_take,
                medication.route,
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
            const resident =
              cleanText(
                a.resident_name
              ).localeCompare(
                cleanText(
                  b.resident_name
                ),
                undefined,
                {
                  sensitivity:
                    "base",
                  numeric: true,
                }
              );

            if (
              resident !== 0
            ) {
              return resident;
            }

            return cleanText(
              a.time_to_take
            ).localeCompare(
              cleanText(
                b.time_to_take
              )
            );
          }
        );
    }, [
      medications,
      search,
      statusFilter,
    ]);


  const administered =
    medications.filter(
      (medication) =>
        normalize(
          medicationStatus(
            medication
          )
        ).includes(
          "administer"
        )
    ).length;


  const held =
    medications.filter(
      (medication) => {
        const status =
          normalize(
            medicationStatus(
              medication
            )
          );

        return (
          status.includes(
            "held"
          ) ||
          status.includes(
            "hold"
          )
        );
      }
    ).length;


  const refused =
    medications.filter(
      (medication) =>
        normalize(
          medicationStatus(
            medication
          )
        ).includes(
          "refus"
        )
    ).length;


  const pending =
    medications.length -
    administered -
    held -
    refused;


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
                {ui("Medication Administration")}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                {ui("Medication Administration Record")}</h1>

              <p className="text-xs text-[#718078]">
                {ui("Administer, hold, or document refused medications")}</p>
            </div>
          </div>

          <Link
            href="/medications"
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
            {ui("Medication Orders")}</Link>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* PCC-LIKE STATUS STRIP */}

        <section className="mb-3 grid border border-[#CBD4D0] bg-white sm:grid-cols-5">
          <SummaryCell
            label={ui("Scheduled")}
            value={
              medications.length
            }
          />

          <SummaryCell
            label={ui("Pending")}
            value={
              Math.max(
                0,
                pending
              )
            }
            info
          />

          <SummaryCell
            label={ui("Administered")}
            value={
              administered
            }
            success
          />

          <SummaryCell
            label={ui("Held")}
            value={held}
            warning={
              held > 0
            }
          />

          <SummaryCell
            label={ui("Refused")}
            value={refused}
            danger={
              refused > 0
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
                      event.target
                        .value
                    )
                  }
                  placeholder={ui("Search resident, medication, dosage, time...")}
                  className="
                    h-8 w-full
                    border
                    border-[#BCC9C3]
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
                  label={ui("Pending")}
                  active={
                    statusFilter ===
                    "pending"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "pending"
                    )
                  }
                />

                <FilterButton
                  label={ui("Administered")}
                  active={
                    statusFilter ===
                    "administer"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "administer"
                    )
                  }
                />

                <FilterButton
                  label={ui("Held")}
                  active={
                    statusFilter ===
                    "held"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "held"
                    )
                  }
                />

                <FilterButton
                  label={ui("Refused")}
                  active={
                    statusFilter ===
                    "refus"
                  }
                  onClick={() =>
                    setStatusFilter(
                      "refus"
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

          <div className="flex items-center justify-between border-b border-[#D8DFDB] bg-[#FBFAF7] px-3 py-1.5 text-[10px]">
            <span className="text-[#607169]">
              {ui("Showing")}{" "}
              <strong className="text-[#263A32]">
                {filtered.length}
              </strong>{" "}
              {ui("medication")}{filtered.length ===
              1
                ? ""
                : "s"}
            </span>

            <span className="font-semibold text-[#7D6A35]">
              {ui("eMAR Worklist")}</span>
          </div>


          {/* TABLE */}

          {filtered.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1420px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase tracking-[0.035em] text-[#354A41]">
                    <ClinicalHead>
                      {ui("Resident")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Medication")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Dosage")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Frequency")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Time")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Route")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Status")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Administration Action")}</ClinicalHead>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (
                      medication,
                      index
                    ) => {
                      const status =
                        medicationStatus(
                          medication
                        );

                      return (
                        <tr
                          key={
                            medication.id
                          }
                          className={`
                            border-b
                            border-[#E1E6E3]
                            align-top
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
                          <td className="min-w-[190px] px-3 py-2">
                            <Link
                              href={`/residents/${medication.resident_id}`}
                              className="font-bold text-[#073B2F] hover:underline"
                            >
                              {cleanText(
                                medication.resident_name
                              ) ||
                                "Resident"}
                            </Link>

                            <p className="mt-0.5 text-[9px] text-[#85918B]">
                              {ui("Resident #")}{
                                medication.resident_id
                              }
                            </p>
                          </td>

                          <td className="min-w-[200px] px-3 py-2 font-semibold text-[#283C33]">
                            {cleanText(
                              medication.medication_name
                            ) ||
                              "Medication"}
                          </td>

                          <td className="px-3 py-2 text-[#41544C]">
                            {cleanText(
                              medication.dosage
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#41544C]">
                            {cleanText(
                              medication.frequency
                            ) ||
                              "—"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#31473D]">
                            {cleanText(
                              medication.time_to_take
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#52645C]">
                            {cleanText(
                              medication.route
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`
                                inline-flex
                                whitespace-nowrap
                                border
                                px-1.5 py-0.5
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

                          <td className="min-w-[350px] px-3 py-1.5">
                            <div
                              className="
                                grid grid-cols-3 gap-1

                                [&_button]:!min-h-7
                                [&_button]:!rounded-[3px]
                                [&_button]:!px-2
                                [&_button]:!py-1
                                [&_button]:!text-[10px]
                                [&_button]:!font-bold
                                [&_button]:!shadow-none
                              "
                            >
                              <AdministerButton
                                medicationId={
                                  medication.id
                                }
                                residentId={
                                  medication.resident_id
                                }
                                resident={
                                  medication.resident_name
                                }
                                medication={
                                  medication.medication_name
                                }
                              />

                              <HoldButton
                                medicationId={
                                  medication.id
                                }
                                residentId={
                                  medication.resident_id
                                }
                                resident={
                                  medication.resident_name
                                }
                                medication={
                                  medication.medication_name
                                }
                              />

                              <RefusedButton
                                medicationId={
                                  medication.id
                                }
                                residentId={
                                  medication.resident_id
                                }
                                resident={
                                  medication.resident_name
                                }
                                medication={
                                  medication.medication_name
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[12px] font-semibold text-[#30443B]">
                {ui("No medications match the selected worklist.")}</p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-2 text-[10px] font-bold text-[#073B2F] underline"
              >
                {ui("Reset filters")}</button>
            </div>
          )}


          <div className="border-t border-[#D1D9D5] bg-[#F8F7F2] px-3 py-2 text-[10px] text-[#607169]">
            {ui("Medication administration actions are written to the resident&apos;s medication administration record.")}</div>
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
  success = false,
  warning = false,
  danger = false,
  info = false,
}: {
  label: string;
  value: number;
  success?: boolean;
  warning?: boolean;
  danger?: boolean;
  info?: boolean;
}) {
  let valueClass =
    "text-[#073B2F]";

  if (success) {
    valueClass =
      "text-emerald-700";
  }

  if (warning) {
    valueClass =
      "text-amber-700";
  }

  if (danger) {
    valueClass =
      "text-red-700";
  }

  if (info) {
    valueClass =
      "text-blue-700";
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
