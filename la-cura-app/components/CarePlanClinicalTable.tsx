"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  RotateCcw,
  Search,
} from "lucide-react";


export type CarePlanRecord = {
  id: number;

  resident_id?:
    | number
    | null;

  resident_name?:
    | string
    | null;

  diagnosis?:
    | string
    | null;

  care_plan?:
    | string
    | null;

  assigned_nurse?:
    | string
    | null;

  review_date?:
    | string
    | null;

  status?:
    | string
    | null;

  created_at?:
    | string
    | null;
};


type Props = {
  plans: CarePlanRecord[];
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


function formatDate(
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
      year: "numeric",
    }
  ).format(date);
}


function reviewState(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return {
      key: "unscheduled",
      label:
        "Not Scheduled",
      style:
        "border-slate-300 bg-slate-100 text-slate-700",
    };
  }

  const review =
    new Date(value);

  if (
    Number.isNaN(
      review.getTime()
    )
  ) {
    return {
      key: "scheduled",
      label:
        "Scheduled",
      style:
        "border-slate-300 bg-slate-100 text-slate-700",
    };
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  review.setHours(
    0,
    0,
    0,
    0
  );

  const days =
    Math.ceil(
      (review.getTime() -
        today.getTime()) /
        86400000
    );

  if (days < 0) {
    return {
      key: "overdue",
      label: "Overdue",
      style:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (days <= 7) {
    return {
      key: "due",
      label:
        days === 0
          ? "Due Today"
          : "Due Soon",
      style:
        "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    key: "scheduled",
    label: "Scheduled",
    style:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
}


export default function CarePlanClinicalTable({
  plans,
}: Props) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    reviewFilter,
    setReviewFilter,
  ] = useState("all");


  const filtered =
    useMemo(() => {
      const query =
        normalize(search);

      return plans
        .filter(
          (plan) => {
            const review =
              reviewState(
                plan.review_date
              );

            const matchesReview =
              reviewFilter ===
                "all" ||
              review.key ===
                reviewFilter;

            const matchesSearch =
              !query ||
              [
                plan.resident_name,
                plan.diagnosis,
                plan.care_plan,
                plan.assigned_nurse,
                plan.status,
              ].some(
                (value) =>
                  normalize(
                    value
                  ).includes(query)
              );

            return (
              matchesReview &&
              matchesSearch
            );
          }
        )
        .sort(
          (a, b) => {
            const first =
              a.review_date
                ? new Date(
                    a.review_date
                  ).getTime()
                : Number.MAX_SAFE_INTEGER;

            const second =
              b.review_date
                ? new Date(
                    b.review_date
                  ).getTime()
                : Number.MAX_SAFE_INTEGER;

            if (
              first !== second
            ) {
              return (
                first -
                second
              );
            }

            return cleanText(
              a.resident_name
            ).localeCompare(
              cleanText(
                b.resident_name
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
      plans,
      search,
      reviewFilter,
    ]);


  const overdue =
    plans.filter(
      (plan) =>
        reviewState(
          plan.review_date
        ).key ===
        "overdue"
    ).length;


  const dueSoon =
    plans.filter(
      (plan) =>
        reviewState(
          plan.review_date
        ).key === "due"
    ).length;


  const scheduled =
    plans.filter(
      (plan) =>
        reviewState(
          plan.review_date
        ).key ===
        "scheduled"
    ).length;


  function resetFilters() {
    setSearch("");
    setReviewFilter(
      "all"
    );
  }


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* HEADER */}

      <section className="border-b border-[#CCD5D0] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="hover:text-[#073B2F]"
              >
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-[#40524B]">
                Care Plans
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                Resident Care Plans
              </h1>

              <p className="text-xs text-[#718078]">
                Problems, interventions, assignments, and clinical review
              </p>
            </div>
          </div>

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
            Resident List
          </Link>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* REVIEW SUMMARY */}

        <section className="mb-3 grid border border-[#CBD4D0] bg-white sm:grid-cols-4">
          <SummaryCell
            label="Care Plans"
            value={
              plans.length
            }
          />

          <SummaryCell
            label="Overdue"
            value={overdue}
            danger={
              overdue > 0
            }
          />

          <SummaryCell
            label="Due Soon"
            value={dueSoon}
            warning={
              dueSoon > 0
            }
          />

          <SummaryCell
            label="Scheduled"
            value={scheduled}
          />
        </section>


        <section className="border border-[#C8D2CD] bg-white">
          {/* FILTER TOOLBAR */}

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
                  placeholder="Search resident, diagnosis, care plan, nurse..."
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
                  label="All"
                  active={
                    reviewFilter ===
                    "all"
                  }
                  onClick={() =>
                    setReviewFilter(
                      "all"
                    )
                  }
                />

                <FilterButton
                  label="Overdue"
                  active={
                    reviewFilter ===
                    "overdue"
                  }
                  onClick={() =>
                    setReviewFilter(
                      "overdue"
                    )
                  }
                />

                <FilterButton
                  label="Due Soon"
                  active={
                    reviewFilter ===
                    "due"
                  }
                  onClick={() =>
                    setReviewFilter(
                      "due"
                    )
                  }
                />

                <FilterButton
                  label="Scheduled"
                  active={
                    reviewFilter ===
                    "scheduled"
                  }
                  onClick={() =>
                    setReviewFilter(
                      "scheduled"
                    )
                  }
                />

                {(search ||
                  reviewFilter !==
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

                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>


          {/* RESULT STRIP */}

          <div className="flex items-center justify-between border-b border-[#D8DFDB] bg-[#FBFAF7] px-3 py-1.5 text-[10px]">
            <span className="text-[#607169]">
              Showing{" "}
              <strong className="text-[#263A32]">
                {filtered.length}
              </strong>{" "}
              care plan
              {filtered.length ===
              1
                ? ""
                : "s"}
            </span>

            <span className="font-semibold text-[#7D6A35]">
              Review-date order
            </span>
          </div>


          {/* TABLE */}

          {filtered.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1350px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase tracking-[0.035em] text-[#354A41]">
                    <ClinicalHead>
                      Resident
                    </ClinicalHead>

                    <ClinicalHead>
                      Diagnosis / Problem
                    </ClinicalHead>

                    <ClinicalHead>
                      Care Plan / Intervention
                    </ClinicalHead>

                    <ClinicalHead>
                      Assigned Nurse
                    </ClinicalHead>

                    <ClinicalHead>
                      Review Date
                    </ClinicalHead>

                    <ClinicalHead>
                      Review Status
                    </ClinicalHead>

                    <ClinicalHead>
                      Action
                    </ClinicalHead>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (
                      plan,
                      index
                    ) => {
                      const review =
                        reviewState(
                          plan.review_date
                        );

                      return (
                        <tr
                          key={
                            plan.id
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
                            {plan.resident_id ? (
                              <Link
                                href={`/residents/${plan.resident_id}?tab=care-plan`}
                                className="font-bold text-[#073B2F] hover:underline"
                              >
                                {cleanText(
                                  plan.resident_name
                                ) ||
                                  "Resident"}
                              </Link>
                            ) : (
                              <span className="font-bold text-[#30443B]">
                                {cleanText(
                                  plan.resident_name
                                ) ||
                                  "Resident"}
                              </span>
                            )}
                          </td>

                          <td className="max-w-[260px] px-3 py-2 text-[#344A40]">
                            <span className="block whitespace-pre-wrap leading-5">
                              {cleanText(
                                plan.diagnosis
                              ) ||
                                "—"}
                            </span>
                          </td>

                          <td className="max-w-[420px] px-3 py-2 text-[#40544B]">
                            <span className="block whitespace-pre-wrap leading-5">
                              {cleanText(
                                plan.care_plan
                              ) ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-3 py-2 font-medium text-[#40544B]">
                            {cleanText(
                              plan.assigned_nurse
                            ) ||
                              "Unassigned"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#40544B]">
                            {formatDate(
                              plan.review_date
                            )}
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
                                ${review.style}
                              `}
                            >
                              {
                                review.label
                              }
                            </span>
                          </td>

                          <td className="px-3 py-2">
                            {plan.resident_id ? (
                              <Link
                                href={`/residents/${plan.resident_id}?tab=care-plan`}
                                className="
                                  inline-flex h-7
                                  items-center
                                  border
                                  border-[#98AAA1]
                                  bg-white px-2.5
                                  text-[10px]
                                  font-bold
                                  text-[#073B2F]
                                  hover:border-[#073B2F]
                                  hover:bg-[#F0F4F1]
                                "
                              >
                                Open Resident
                              </Link>
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
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[12px] font-semibold text-[#30443B]">
                No care plans match the selected filters.
              </p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-2 text-[10px] font-bold text-[#073B2F] underline"
              >
                Reset filters
              </button>
            </div>
          )}


          <div className="border-t border-[#D1D9D5] bg-[#F8F7F2] px-3 py-2 text-[10px] text-[#607169]">
            Care plans are prioritized by their next clinical review date.
          </div>
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
        h-8 border px-3
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
  danger = false,
  warning = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8DFDB] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span
        className={`
          text-[20px] font-bold

          ${
            danger
              ? "text-red-700"
              : warning
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
