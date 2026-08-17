"use client";

import useAppUi from "@/components/i18n/useAppUi";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";


export type MedicationRecord = {
  id: number;

  resident_id?:
    | number
    | null;

  resident_name?:
    | string
    | null;

  medication_name?:
    | string
    | null;

  dosage?:
    | string
    | null;

  frequency?:
    | string
    | null;

  time_to_take?:
    | string
    | null;

  status?:
    | string
    | null;

  route?:
    | string
    | null;

  instructions?:
    | string
    | null;

  start_date?:
    | string
    | null;

  end_date?:
    | string
    | null;

  created_at?:
    | string
    | null;
};


type Props = {
  medications:
    MedicationRecord[];

  loadError?: boolean;
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


function getStatus(
  medication:
    MedicationRecord
) {
  return (
    cleanText(
      medication.status
    ) ||
    "Active"
  );
}


function statusStyle(
  value: string
) {
  const status =
    value.toLowerCase();

  if (
    status.includes(
      "discontinu"
    )
  ) {
    return "border-slate-300 bg-slate-100 text-slate-700";
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
      "inactive"
    )
  ) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}


function formatDate(
  value:
    | string
    | null
    | undefined,
  locale = "en-CM"
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
    locale,
    {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    }
  ).format(date);
}


export default function MedicationClinicalTable({
  medications,
  loadError = false,
}: Props) {
  const { ui, locale } =
    useAppUi();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("all");

  const filtered =
    useMemo(() => {
      const query =
        normalize(search);

      return medications
        .filter(
          (medication) => {
            const currentStatus =
              getStatus(
                medication
              );

            const matchesStatus =
              status === "all" ||
              normalize(
                currentStatus
              ).includes(status);

            const matchesSearch =
              !query ||
              [
                medication.resident_name,
                medication.medication_name,
                medication.dosage,
                medication.frequency,
                medication.time_to_take,
                medication.route,
                medication.instructions,
                currentStatus,
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
            const residentCompare =
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
              residentCompare !==
              0
            ) {
              return residentCompare;
            }

            return cleanText(
              a.medication_name
            ).localeCompare(
              cleanText(
                b.medication_name
              ),
              undefined,
              {
                sensitivity:
                  "base",
              }
            );
          }
        );
    }, [
      medications,
      search,
      status,
    ]);

  const activeCount =
    medications.filter(
      (medication) =>
        normalize(
          getStatus(
            medication
          )
        ).includes(
          "active"
        )
    ).length;

  const heldCount =
    medications.filter(
      (medication) => {
        const value =
          normalize(
            getStatus(
              medication
            )
          );

        return (
          value.includes(
            "held"
          ) ||
          value.includes(
            "hold"
          )
        );
      }
    ).length;

  const discontinuedCount =
    medications.filter(
      (medication) =>
        normalize(
          getStatus(
            medication
          )
        ).includes(
          "discontinu"
        )
    ).length;

  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE TITLE */}

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
                {ui("Medications")}</span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                {ui("Medication Orders")}</h1>

              <p className="text-xs text-[#718078]">
                {ui("Resident medication record")}</p>
            </div>
          </div>

          <Link
            href="/add-medication"
            className="
              inline-flex h-9
              items-center
              justify-center
              gap-2
              border
              border-[#063428]
              bg-[#073B2F]
              px-4
              text-xs
              font-bold
              text-white
              transition
              hover:bg-[#0D4A3A]
            "
          >
            <Plus size={14} />

            {ui("Add Medication")}</Link>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* SUMMARY */}

        <section className="mb-3 grid border border-[#CCD5D0] bg-white sm:grid-cols-4">
          <SummaryCell
            label={ui("Medication Records")}
            value={
              medications.length
            }
          />

          <SummaryCell
            label={ui("Active")}
            value={activeCount}
          />

          <SummaryCell
            label={ui("Held")}
            value={heldCount}
            warning={
              heldCount > 0
            }
          />

          <SummaryCell
            label={ui("Discontinued")}
            value={
              discontinuedCount
            }
          />
        </section>


        <section className="border border-[#C9D3CE] bg-white">
          {/* TOOLBAR */}

          <div className="border-b border-[#D8DFDB] bg-[#F8F7F2]">
            <div className="flex flex-col gap-2 p-2.5 xl:flex-row xl:items-center">
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
                  placeholder={ui("Search resident, medication, dosage, frequency, instructions...")}
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

              <div className="flex flex-wrap items-center gap-1">
                <FilterButton
                  label={ui("All")}
                  active={
                    status ===
                    "all"
                  }
                  onClick={() =>
                    setStatus(
                      "all"
                    )
                  }
                />

                <FilterButton
                  label={ui("Active")}
                  active={
                    status ===
                    "active"
                  }
                  onClick={() =>
                    setStatus(
                      "active"
                    )
                  }
                />

                <FilterButton
                  label={ui("Held")}
                  active={
                    status ===
                    "held"
                  }
                  onClick={() =>
                    setStatus(
                      "held"
                    )
                  }
                />

                <FilterButton
                  label={ui("Discontinued")}
                  active={
                    status ===
                    "discontinu"
                  }
                  onClick={() =>
                    setStatus(
                      "discontinu"
                    )
                  }
                />

                {(search ||
                  status !==
                    "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatus(
                        "all"
                      );
                    }}
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
            <p className="text-[#607169]">
              {ui("Showing")}{" "}
              <strong className="text-[#263A32]">
                {filtered.length}
              </strong>{" "}
              {ui("medication record")}{filtered.length ===
              1
                ? ""
                : "s"}
            </p>

            <p className="font-semibold text-[#7D6A35]">
              {ui("Resident order")}</p>
          </div>


          {/* ERROR */}

          {loadError && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
              {ui("Medication records could not be loaded.")}</div>
          )}


          {/* TABLE */}

          {!loadError &&
          filtered.length >
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
                      {ui("Scheduled Time")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Route")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Instructions")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Start")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("End")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Status")}</ClinicalHead>

                    <ClinicalHead>
                      {ui("Action")}</ClinicalHead>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (
                      medication,
                      index
                    ) => {
                      const medStatus =
                        getStatus(
                          medication
                        );

                      return (
                        <tr
                          key={
                            medication.id
                          }
                          className={`
                            border-b
                            border-[#E2E7E4]
                            text-[11px]
                            transition-colors
                            hover:bg-[#FFFDF7]

                            ${
                              index %
                                2 ===
                              0
                                ? "bg-white"
                                : "bg-[#FAFAF7]"
                            }
                          `}
                        >
                          <td className="px-3 py-2">
                            {medication.resident_id ? (
                              <Link
                                href={`/residents/${medication.resident_id}`}
                                className="font-bold text-[#073B2F] hover:underline"
                              >
                                {cleanText(
                                  medication.resident_name
                                ) ||
                                  "Resident"}
                              </Link>
                            ) : (
                              <span className="font-bold text-[#30443B]">
                                {cleanText(
                                  medication.resident_name
                                ) ||
                                  "Resident"}
                              </span>
                            )}
                          </td>

                          <td className="max-w-[220px] px-3 py-2">
                            <span className="block truncate font-semibold text-[#263A32]">
                              {cleanText(
                                medication.medication_name
                              ) ||
                                "Medication"}
                            </span>
                          </td>

                          <td className="px-3 py-2 font-medium text-[#40534B]">
                            {cleanText(
                              medication.dosage
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#40534B]">
                            {cleanText(
                              medication.frequency
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#40534B]">
                            {cleanText(
                              medication.time_to_take
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#506159]">
                            {cleanText(
                              medication.route
                            ) ||
                              "—"}
                          </td>

                          <td className="max-w-[280px] px-3 py-2 text-[#506159]">
                            <span className="block truncate">
                              {cleanText(
                                medication.instructions
                              ) ||
                                "—"}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-[#607169]">
                            {formatDate(
                              medication.start_date,
                              locale
                            )}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-[#607169]">
                            {formatDate(
                              medication.end_date,
                              locale
                            )}
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
                                  medStatus
                                )}
                              `}
                            >
                              {ui(medStatus)}
                            </span>
                          </td>

                          <td className="px-3 py-2">
                            {medication.resident_id ? (
                              <Link
                                href={`/residents/${medication.resident_id}?tab=orders`}
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
                              <span className="text-[10px] text-[#87948E]">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : !loadError ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[12px] font-semibold text-[#30443B]">
                {ui("No medication records match the selected filters.")}</p>

              {(search ||
                status !==
                  "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus(
                      "all"
                    );
                  }}
                  className="mt-2 text-[10px] font-bold text-[#073B2F] underline"
                >
                  {ui("Reset filters")}</button>
              )}
            </div>
          ) : null}


          {/* FOOTER */}

          <div className="border-t border-[#D1D9D5] bg-[#F8F7F2] px-3 py-2 text-[10px] text-[#607169]">
            {ui("Medication records are displayed in resident alphabetical order.")}</div>
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
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8DFDB] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span
        className={`
          text-[20px]
          font-bold

          ${
            warning
              ? "text-amber-700"
              : "text-[#073B2F]"
          }
        `}
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
