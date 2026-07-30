"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  UserRoundCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ResidentClinicalReportModal, {
  type ResidentReportGeneratedData,
} from "@/components/reports/ResidentClinicalReportModal";

type ReportCategory =
  | "All"
  | "Clinical"
  | "Medication"
  | "Resident"
  | "Compliance"
  | "Operational";

type ReportDefinition = {
  id: string;
  name: string;
  description: string;
  category: Exclude<
    ReportCategory,
    "All"
  >;
  icon: LucideIcon;
  iconClass: string;
  iconBackground: string;
};

type RecentReport = {
  id: string;
  name: string;
  category: Exclude<
    ReportCategory,
    "All"
  >;
  dateRange: string;
  format: "PDF" | "CSV";
  generatedAt: string;
  generatedBy: string;
  status: "Ready";
};

const reportCategories: ReportCategory[] = [
  "All",
  "Clinical",
  "Medication",
  "Resident",
  "Compliance",
  "Operational",
];

const reportDefinitions: ReportDefinition[] = [
  {
    id: "resident-clinical-summary",
    name: "Resident Clinical Summary",
    description:
      "Download a branded La-Cura PDF containing resident information and clinical history.",
    category: "Clinical",
    icon: Stethoscope,
    iconClass: "text-green-700",
    iconBackground: "bg-green-50",
  },
  {
    id: "medication-administration",
    name: "Medication Administration Record",
    description:
      "Review administered, held, refused, missed, and overdue medication entries.",
    category: "Medication",
    icon: Pill,
    iconClass: "text-orange-700",
    iconBackground: "bg-orange-50",
  },
  {
    id: "medication-exceptions",
    name: "Medication Exception Report",
    description:
      "Identify medication refusals, holds, omissions, and documentation exceptions.",
    category: "Medication",
    icon: ClipboardCheck,
    iconClass: "text-rose-700",
    iconBackground: "bg-rose-50",
  },
  {
    id: "resident-census",
    name: "Resident Census Report",
    description:
      "View active residents, admission information, room assignments, and status.",
    category: "Resident",
    icon: Users,
    iconClass: "text-emerald-700",
    iconBackground: "bg-emerald-50",
  },
  {
    id: "vitals-summary",
    name: "Vitals Summary Report",
    description:
      "Review blood pressure, pulse, respirations, oxygen saturation, and temperature.",
    category: "Clinical",
    icon: HeartPulse,
    iconClass: "text-red-700",
    iconBackground: "bg-red-50",
  },
  {
    id: "appointments",
    name: "Appointment Schedule",
    description:
      "View upcoming, completed, cancelled, and missed resident appointments.",
    category: "Operational",
    icon: CalendarDays,
    iconClass: "text-purple-700",
    iconBackground: "bg-purple-50",
  },
  {
    id: "staff-activity",
    name: "Staff Activity Report",
    description:
      "Review clinical documentation and system activity completed by staff.",
    category: "Operational",
    icon: UserRoundCheck,
    iconClass: "text-cyan-700",
    iconBackground: "bg-cyan-50",
  },
  {
    id: "compliance-audit",
    name: "Compliance Audit Report",
    description:
      "Review required documentation, incomplete records, and compliance exceptions.",
    category: "Compliance",
    icon: ShieldCheck,
    iconClass: "text-indigo-700",
    iconBackground: "bg-indigo-50",
  },
  {
    id: "incident-summary",
    name: "Incident Summary Report",
    description:
      "Review resident incidents, severity, follow-up actions, and resolution status.",
    category: "Compliance",
    icon: BarChart3,
    iconClass: "text-amber-700",
    iconBackground: "bg-amber-50",
  },
];

const summaryCards = [
  {
    label: "Residents",
    value: 1,
    detail: "Active residents",
    icon: Users,
    iconClass: "text-green-700",
    iconBackground: "bg-green-100",
  },
  {
    label: "Staff",
    value: 0,
    detail: "Active staff members",
    icon: UserRoundCheck,
    iconClass: "text-blue-700",
    iconBackground: "bg-blue-100",
  },
  {
    label: "Medications",
    value: 3,
    detail: "Active medication orders",
    icon: Pill,
    iconClass: "text-orange-700",
    iconBackground: "bg-orange-100",
  },
  {
    label: "Appointments",
    value: 0,
    detail: "Upcoming appointments",
    icon: CalendarDays,
    iconClass: "text-purple-700",
    iconBackground: "bg-purple-100",
  },
];

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export default function ReportsPage() {
  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] =
    useState<ReportCategory>("All");

  const [selectedReport, setSelectedReport] =
    useState<ReportDefinition | null>(
      null
    );

  const [
    residentReportOpen,
    setResidentReportOpen,
  ] = useState(false);

  const [recentReports, setRecentReports] =
    useState<RecentReport[]>([]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return reportDefinitions.filter(
      (report) => {
        const matchesCategory =
          activeCategory === "All" ||
          report.category === activeCategory;

        const matchesSearch =
          !normalizedSearch ||
          report.name
            .toLowerCase()
            .includes(normalizedSearch) ||
          report.description
            .toLowerCase()
            .includes(normalizedSearch) ||
          report.category
            .toLowerCase()
            .includes(normalizedSearch);

        return (
          matchesCategory && matchesSearch
        );
      }
    );
  }, [activeCategory, search]);

  function handleReportCreated(
    report: RecentReport
  ) {
    setRecentReports((currentReports) => [
      report,
      ...currentReports,
    ]);
  }

  function handleResidentReportGenerated(
    data: ResidentReportGeneratedData
  ) {
    handleReportCreated({
      id: `resident-report-${Date.now()}`,
      name: `${data.residentName} Clinical Summary`,
      category: "Clinical",
      dateRange: data.reportingPeriod,
      format: "PDF",
      generatedAt: formatGeneratedDate(),
      generatedBy: "La-Cura Staff",
      status: "Ready",
    });
  }

  function openReport(
    report: ReportDefinition
  ) {
    if (
      report.id ===
      "resident-clinical-summary"
    ) {
      setResidentReportOpen(true);
      return;
    }

    setSelectedReport(report);
  }

  function exportReportHistory() {
    if (recentReports.length === 0) {
      return;
    }

    const headings = [
      "Report Name",
      "Category",
      "Date Range",
      "Format",
      "Generated At",
      "Generated By",
      "Status",
    ];

    const rows = recentReports.map(
      (report) => [
        report.name,
        report.category,
        report.dateRange,
        report.format,
        report.generatedAt,
        report.generatedBy,
        report.status,
      ]
    );

    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "la-cura-report-history.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-green-800 bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white shadow-lg">
        <div className="px-6 py-7 lg:px-10">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                <BarChart3 size={30} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Reports
                </h1>

                <p className="mt-1 text-green-100">
                  Clinical, medication,
                  compliance, and facility
                  reporting
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={exportReportHistory}
                disabled={
                  recentReports.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={18} />
                Export History
              </button>

              <button
                type="button"
                onClick={() =>
                  setResidentReportOpen(true)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-800 shadow-sm transition hover:bg-green-50"
              >
                <FileText size={18} />
                Download Patient Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-8 p-6 lg:p-10">
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-3 text-4xl font-black text-slate-900">
                      {card.value}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {card.detail}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl p-3 ${card.iconBackground}`}
                  >
                    <Icon
                      size={24}
                      className={card.iconClass}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Report Library
                </h2>

                <p className="mt-1 text-slate-500">
                  Select a report and configure
                  its reporting period.
                </p>
              </div>

              <div className="relative w-full xl:max-w-md">
                <Search
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search reports..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {reportCategories.map(
                (category) => {
                  const isActive =
                    activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          category
                        )
                      }
                      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        isActive
                          ? "bg-green-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {category}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:p-8 xl:grid-cols-3">
            {filteredReports.map((report) => {
              const Icon = report.icon;

              return (
                <article
                  key={report.id}
                  className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-green-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`rounded-2xl p-3 ${report.iconBackground}`}
                    >
                      <Icon
                        size={25}
                        className={
                          report.iconClass
                        }
                      />
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {report.category}
                    </span>
                  </div>

                  <div className="mt-5 flex-1">
                    <h3 className="text-lg font-black text-slate-900">
                      {report.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {report.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openReport(report)
                    }
                    className="mt-6 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition group-hover:border-green-600 group-hover:bg-green-50 group-hover:text-green-800"
                  >
                    {report.id ===
                    "resident-clinical-summary"
                      ? "Download PDF"
                      : "Configure Report"}

                    <ChevronRight size={18} />
                  </button>
                </article>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <FileText
                  size={38}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  No reports found
                </h3>

                <p className="mt-1 text-slate-500">
                  Change the search term or
                  choose another category.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center lg:px-8">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Generated Reports
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Reports generated during this
                session.
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
              {recentReports.length} reports
            </span>
          </div>

          {recentReports.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <FileText
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No reports generated yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Download a patient clinical
                report or select another report
                from the library.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-bold lg:px-8">
                      Report
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Category
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Date Range
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Format
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Generated
                    </th>

                    <th className="px-6 py-4 font-bold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentReports.map(
                    (report) => (
                      <tr
                        key={report.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5 lg:px-8">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-50 p-2.5">
                              <FileText
                                size={19}
                                className="text-green-700"
                              />
                            </div>

                            <div>
                              <p className="font-bold text-slate-900">
                                {report.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Generated by{" "}
                                {
                                  report.generatedBy
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {report.category}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {report.dateRange}
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {report.format}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {report.generatedAt}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                            <CheckCircle2
                              size={14}
                            />
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ResidentClinicalReportModal
        open={residentReportOpen}
        onClose={() =>
          setResidentReportOpen(false)
        }
        onGenerated={
          handleResidentReportGenerated
        }
      />

      <GenerateReportModal
        report={selectedReport}
        onClose={() =>
          setSelectedReport(null)
        }
        onCreated={handleReportCreated}
      />
    </div>
  );
}

type GenerateReportModalProps = {
  report: ReportDefinition | null;
  onClose: () => void;
  onCreated: (
    report: RecentReport
  ) => void;
};

function GenerateReportModal({
  report,
  onClose,
  onCreated,
}: GenerateReportModalProps) {
  const [mounted, setMounted] =
    useState(false);

  const [dateRange, setDateRange] =
    useState("Last 7 days");

  const [format, setFormat] = useState<
    "PDF" | "CSV"
  >("PDF");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!report) {
      return;
    }

    setDateRange("Last 7 days");
    setFormat("PDF");
  }, [report]);

  useEffect(() => {
    if (!report) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [report, loading, onClose]);

  async function handleGenerate() {
    if (!report || loading) {
      return;
    }

    setLoading(true);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 600);
      });

      onCreated({
        id: `${report.id}-${Date.now()}`,
        name: report.name,
        category: report.category,
        dateRange,
        format,
        generatedAt:
          formatGeneratedDate(),
        generatedBy: "La-Cura Staff",
        status: "Ready",
      });

      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !report) {
    return null;
  }

  const Icon = report.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-report-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3">
                <Icon size={27} />
              </div>

              <div>
                <p className="text-sm font-semibold text-green-100">
                  Generate Report
                </p>

                <h2
                  id="generate-report-title"
                  className="mt-1 text-2xl font-black"
                >
                  {report.name}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close report modal"
              className="rounded-xl bg-white/15 p-2 transition hover:bg-white/25 disabled:opacity-50"
            >
              <X size={21} />
            </button>
          </div>
        </header>

        <main className="space-y-6 p-6 sm:p-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-600">
              {report.description}
            </p>
          </div>

          <div>
            <label
              htmlFor="report-date-range"
              className="mb-2 block font-bold text-slate-800"
            >
              Reporting Period
            </label>

            <select
              id="report-date-range"
              value={dateRange}
              onChange={(event) =>
                setDateRange(
                  event.target.value
                )
              }
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:opacity-60"
            >
              <option value="Today">
                Today
              </option>

              <option value="Last 7 days">
                Last 7 days
              </option>

              <option value="Last 30 days">
                Last 30 days
              </option>

              <option value="This month">
                This month
              </option>

              <option value="Previous month">
                Previous month
              </option>

              <option value="Year to date">
                Year to date
              </option>
            </select>
          </div>

          <div>
            <p className="mb-2 font-bold text-slate-800">
              Report Format
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["PDF", "CSV"] as const).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setFormat(option)
                    }
                    disabled={loading}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      format === option
                        ? "border-green-600 bg-green-50 ring-2 ring-green-100"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        size={21}
                        className={
                          format === option
                            ? "text-green-700"
                            : "text-slate-500"
                        }
                      />

                      <div>
                        <p className="font-bold text-slate-900">
                          {option}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {option === "PDF"
                            ? "Formatted document"
                            : "Spreadsheet-compatible"}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </main>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Generating...
              </>
            ) : (
              <>
                <Activity size={18} />
                Generate Report
              </>
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}