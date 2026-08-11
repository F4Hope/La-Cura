"use client";

import type {
  LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChartColumn,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  HeartPulse,
  LoaderCircle,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  createPortal,
} from "react-dom";

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

  category:
    Exclude<
      ReportCategory,
      "All"
    >;

  icon: LucideIcon;
};


type RecentReport = {
  id: string;
  name: string;

  category:
    Exclude<
      ReportCategory,
      "All"
    >;

  dateRange: string;

  format:
    | "PDF"
    | "CSV";

  generatedAt: string;
  generatedBy: string;
  status: "Ready";
};


const reportCategories:
  ReportCategory[] = [
    "All",
    "Clinical",
    "Medication",
    "Resident",
    "Compliance",
    "Operational",
  ];


const reportDefinitions:
  ReportDefinition[] = [
    {
      id:
        "resident-clinical-summary",

      name:
        "Resident Clinical Summary",

      description:
        "Resident demographics and available clinical history in a La-Cura PDF.",

      category:
        "Clinical",

      icon:
        Stethoscope,
    },

    {
      id:
        "medication-administration",

      name:
        "Medication Administration Record",

      description:
        "Administration, hold, refusal, missed-dose, and medication-status review.",

      category:
        "Medication",

      icon:
        Pill,
    },

    {
      id:
        "medication-exceptions",

      name:
        "Medication Exception Report",

      description:
        "Medication refusals, holds, omissions, and documentation exceptions.",

      category:
        "Medication",

      icon:
        ClipboardCheck,
    },

    {
      id:
        "resident-census",

      name:
        "Resident Census Report",

      description:
        "Resident status, admission information, room assignment, and census review.",

      category:
        "Resident",

      icon:
        Users,
    },

    {
      id:
        "vitals-summary",

      name:
        "Vitals Summary Report",

      description:
        "Blood pressure, pulse, respirations, oxygen saturation, temperature, and pain review.",

      category:
        "Clinical",

      icon:
        HeartPulse,
    },

    {
      id:
        "appointments",

      name:
        "Appointment Schedule",

      description:
        "Scheduled, completed, cancelled, and missed resident appointments.",

      category:
        "Operational",

      icon:
        CalendarDays,
    },

    {
      id:
        "staff-activity",

      name:
        "Staff Activity Report",

      description:
        "Clinical documentation and system activity recorded by staff.",

      category:
        "Operational",

      icon:
        UserCheck,
    },

    {
      id:
        "compliance-audit",

      name:
        "Compliance Audit Report",

      description:
        "Required documentation, incomplete records, and identified compliance exceptions.",

      category:
        "Compliance",

      icon:
        ShieldCheck,
    },

    {
      id:
        "incident-summary",

      name:
        "Incident Summary Report",

      description:
        "Resident incidents, severity, follow-up actions, and resolution status.",

      category:
        "Compliance",

      icon:
        ChartColumn,
    },
  ];


function formatGeneratedDate() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date()
  );
}


export default function ReportsPage() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState<ReportCategory>(
      "All"
    );

  const [
    selectedReport,
    setSelectedReport,
  ] =
    useState<ReportDefinition | null>(
      null
    );

  const [
    residentReportOpen,
    setResidentReportOpen,
  ] = useState(false);

  const [
    recentReports,
    setRecentReports,
  ] =
    useState<RecentReport[]>(
      []
    );


  const filteredReports =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reportDefinitions.filter(
        (report) => {
          const matchesCategory =
            activeCategory ===
              "All" ||
            report.category ===
              activeCategory;

          const matchesSearch =
            !query ||
            report.name
              .toLowerCase()
              .includes(query) ||
            report.description
              .toLowerCase()
              .includes(query) ||
            report.category
              .toLowerCase()
              .includes(query);

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      activeCategory,
      search,
    ]);


  const clinicalCount =
    reportDefinitions.filter(
      (report) =>
        report.category ===
        "Clinical"
    ).length;


  const complianceCount =
    reportDefinitions.filter(
      (report) =>
        report.category ===
        "Compliance"
    ).length;


  function handleReportCreated(
    report:
      RecentReport
  ) {
    setRecentReports(
      (
        currentReports
      ) => [
        report,
        ...currentReports,
      ]
    );
  }


  function handleResidentReportGenerated(
    data:
      ResidentReportGeneratedData
  ) {
    handleReportCreated({
      id:
        `resident-report-${Date.now()}`,

      name:
        `${data.residentName} Clinical Summary`,

      category:
        "Clinical",

      dateRange:
        data.reportingPeriod,

      format:
        "PDF",

      generatedAt:
        formatGeneratedDate(),

      generatedBy:
        "La-Cura Staff",

      status:
        "Ready",
    });
  }


  function openReport(
    report:
      ReportDefinition
  ) {
    if (
      report.id ===
      "resident-clinical-summary"
    ) {
      setResidentReportOpen(
        true
      );

      return;
    }

    setSelectedReport(
      report
    );
  }


  function exportReportHistory() {
    if (
      recentReports.length ===
      0
    ) {
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

    const rows =
      recentReports.map(
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

    const csv = [
      headings,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (cell) =>
                `"${String(
                  cell
                ).replaceAll(
                  '"',
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      url;

    anchor.download =
      "la-cura-report-history.csv";

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(
      url
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
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-[#40524B]">
                Reports
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                Reports
              </h1>

              <p className="text-xs text-[#718078]">
                Clinical, medication, compliance, resident, and operational reporting
              </p>
            </div>
          </div>


          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={
                exportReportHistory
              }
              disabled={
                recentReports.length ===
                0
              }
              className="
                inline-flex h-8
                items-center gap-1.5
                border
                border-[#AAB8B1]
                bg-white px-3
                text-[10px]
                font-bold
                text-[#30483E]
                hover:border-[#073B2F]
                hover:bg-[#F2F5F3]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Download
                size={12}
              />

              Export History
            </button>

            <button
              type="button"
              onClick={() =>
                setResidentReportOpen(
                  true
                )
              }
              className="
                inline-flex h-8
                items-center gap-1.5
                border
                border-[#063428]
                bg-[#073B2F]
                px-3
                text-[10px]
                font-bold
                text-white
                hover:bg-[#0D4A3A]
              "
            >
              <FileText
                size={12}
              />

              Resident Clinical PDF
            </button>
          </div>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* SUMMARY STRIP */}

        <section className="mb-3 grid border border-[#CBD4D0] bg-white sm:grid-cols-4">
          <SummaryCell
            label="Available Reports"
            value={
              reportDefinitions.length
            }
          />

          <SummaryCell
            label="Clinical"
            value={
              clinicalCount
            }
          />

          <SummaryCell
            label="Compliance"
            value={
              complianceCount
            }
          />

          <SummaryCell
            label="Generated This Session"
            value={
              recentReports.length
            }
            gold={
              recentReports.length >
              0
            }
          />
        </section>


        {/* REPORT LIBRARY */}

        <section className="border border-[#C8D2CD] bg-white">
          <div className="flex flex-col gap-1 border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
              Report Library
            </h2>

            <span className="text-[9px] text-[#718078]">
              Select a report to configure its reporting period
            </span>
          </div>


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
                  placeholder="Search report name, category, or purpose..."
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
                {reportCategories.map(
                  (category) => (
                    <button
                      key={
                        category
                      }
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          category
                        )
                      }
                      className={`
                        h-8 border
                        px-3
                        text-[10px]
                        font-bold

                        ${
                          activeCategory ===
                          category
                            ? "border-[#073B2F] bg-[#073B2F] text-white"
                            : "border-[#BCC9C3] bg-white text-[#465A51] hover:bg-[#EEF2EF]"
                        }
                      `}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>


          <div className="flex items-center justify-between border-b border-[#D8DFDB] bg-[#FBFAF7] px-3 py-1.5 text-[10px]">
            <span className="text-[#607169]">
              Showing{" "}
              <strong className="text-[#263A32]">
                {filteredReports.length}
              </strong>{" "}
              report
              {filteredReports.length ===
              1
                ? ""
                : "s"}
            </span>

            <span className="font-semibold text-[#7D6A35]">
              Report Catalog
            </span>
          </div>


          {filteredReports.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase tracking-[0.035em] text-[#354A41]">
                    <ClinicalHead>
                      Report
                    </ClinicalHead>

                    <ClinicalHead>
                      Category
                    </ClinicalHead>

                    <ClinicalHead>
                      Description
                    </ClinicalHead>

                    <ClinicalHead>
                      Action
                    </ClinicalHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map(
                    (
                      report,
                      index
                    ) => {
                      const Icon =
                        report.icon;

                      return (
                        <tr
                          key={
                            report.id
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
                          <td className="min-w-[260px] px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#CBD5D0] bg-[#EEF3EF] text-[#073B2F]">
                                <Icon
                                  size={13}
                                />
                              </span>

                              <span className="font-bold text-[#263A32]">
                                {report.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <span className="inline-flex border border-[#D2D9D5] bg-[#F5F6F4] px-1.5 py-0.5 text-[9px] font-bold text-[#52645C]">
                              {report.category}
                            </span>
                          </td>

                          <td className="max-w-[650px] px-3 py-2 leading-5 text-[#52645C]">
                            {report.description}
                          </td>

                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                openReport(
                                  report
                                )
                              }
                              className="
                                inline-flex h-7
                                items-center gap-1.5
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
                              {report.id ===
                              "resident-clinical-summary"
                                ? "Generate PDF"
                                : "Configure"}

                              <ChevronRight
                                size={11}
                              />
                            </button>
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
                No reports match the selected filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory(
                    "All"
                  );
                }}
                className="mt-2 text-[10px] font-bold text-[#073B2F] underline"
              >
                Reset report filters
              </button>
            </div>
          )}
        </section>


        {/* GENERATED HISTORY */}

        <section className="mt-3 border border-[#C8D2CD] bg-white">
          <div className="flex items-center justify-between border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
              Generated Reports
            </h2>

            <span className="text-[9px] font-semibold text-[#718078]">
              {recentReports.length} this session
            </span>
          </div>


          {recentReports.length ===
          0 ? (
            <div className="flex min-h-[140px] items-center justify-center px-6 py-8">
              <div className="text-center">
                <span className="mx-auto flex h-8 w-8 items-center justify-center border border-[#D1D9D5] bg-[#F4F6F4] text-[#697A72]">
                  <FileText
                    size={14}
                  />
                </span>

                <p className="mt-2 text-[11px] font-semibold text-[#40544B]">
                  No reports generated during this session
                </p>

                <p className="mt-1 text-[9px] text-[#7B8982]">
                  Generated report activity will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#F4F6F4] text-[10px] font-bold uppercase tracking-[0.03em] text-[#40544B]">
                    <ClinicalHead>
                      Report
                    </ClinicalHead>

                    <ClinicalHead>
                      Category
                    </ClinicalHead>

                    <ClinicalHead>
                      Date Range
                    </ClinicalHead>

                    <ClinicalHead>
                      Format
                    </ClinicalHead>

                    <ClinicalHead>
                      Generated
                    </ClinicalHead>

                    <ClinicalHead>
                      Generated By
                    </ClinicalHead>

                    <ClinicalHead>
                      Status
                    </ClinicalHead>
                  </tr>
                </thead>

                <tbody>
                  {recentReports.map(
                    (
                      report,
                      index
                    ) => (
                      <tr
                        key={
                          report.id
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
                        `}
                      >
                        <td className="px-3 py-2 font-bold text-[#263A32]">
                          {report.name}
                        </td>

                        <td className="px-3 py-2 text-[#52645C]">
                          {report.category}
                        </td>

                        <td className="px-3 py-2 text-[#52645C]">
                          {report.dateRange}
                        </td>

                        <td className="px-3 py-2">
                          <span className="border border-[#D1D9D5] bg-[#F4F6F4] px-1.5 py-0.5 text-[9px] font-bold text-[#52645C]">
                            {report.format}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-3 py-2 text-[#607169]">
                          {report.generatedAt}
                        </td>

                        <td className="px-3 py-2 text-[#607169]">
                          {report.generatedBy}
                        </td>

                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                            <CheckCircle2
                              size={9}
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
        open={
          residentReportOpen
        }
        onClose={() =>
          setResidentReportOpen(
            false
          )
        }
        onGenerated={
          handleResidentReportGenerated
        }
      />


      <GenerateReportModal
        report={
          selectedReport
        }
        onClose={() =>
          setSelectedReport(
            null
          )
        }
        onCreated={
          handleReportCreated
        }
      />
    </div>
  );
}


type GenerateReportModalProps = {
  report:
    ReportDefinition | null;

  onClose:
    () => void;

  onCreated:
    (
      report:
        RecentReport
    ) => void;
};


function GenerateReportModal({
  report,
  onClose,
  onCreated,
}: GenerateReportModalProps) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    dateRange,
    setDateRange,
  ] = useState(
    "Last 7 days"
  );

  const [
    format,
    setFormat,
  ] =
    useState<
      "PDF" | "CSV"
    >("PDF");

  const [
    loading,
    setLoading,
  ] = useState(false);


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

    setDateRange(
      "Last 7 days"
    );

    setFormat("PDF");
  }, [
    report,
  ]);


  useEffect(() => {
    if (!report) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    function handleEscape(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
          "Escape" &&
        !loading
      ) {
        onClose();
      }
    }

    document.body.style.overflow =
      "hidden";

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
  }, [
    report,
    loading,
    onClose,
  ]);


  async function handleGenerate() {
    if (
      !report ||
      loading
    ) {
      return;
    }

    setLoading(true);

    try {
      await new Promise<void>(
        (resolve) => {
          window.setTimeout(
            resolve,
            600
          );
        }
      );

      onCreated({
        id:
          `${report.id}-${Date.now()}`,

        name:
          report.name,

        category:
          report.category,

        dateRange,

        format,

        generatedAt:
          formatGeneratedDate(),

        generatedBy:
          "La-Cura Staff",

        status:
          "Ready",
      });

      onClose();
    } finally {
      setLoading(false);
    }
  }


  if (
    !mounted ||
    !report
  ) {
    return null;
  }


  const Icon =
    report.icon;


  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/45 p-4"
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
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-lg border border-[#AEBAB4] bg-white shadow-2xl"
      >
        {/* MODAL HEADER */}

        <header className="flex items-start justify-between gap-4 border-b border-[#C9D3CE] bg-[#073B2F] px-4 py-3 text-white">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/25 bg-white/10">
              <Icon
                size={15}
              />
            </span>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#D8E6DF]">
                Configure Report
              </p>

              <h2
                id="generate-report-title"
                className="mt-0.5 text-[15px] font-bold"
              >
                {report.name}
              </h2>
            </div>
          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            aria-label="Close report modal"
            className="flex h-7 w-7 items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20 disabled:opacity-50"
          >
            <X size={13} />
          </button>
        </header>


        <div className="p-4">
          <div className="border border-[#D7DFDB] bg-[#F8F7F2] px-3 py-2.5">
            <p className="text-[10px] leading-5 text-[#52645C]">
              {report.description}
            </p>
          </div>


          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.03em] text-[#4D6158]">
                Reporting Period
              </span>

              <select
                value={
                  dateRange
                }
                onChange={(
                  event
                ) =>
                  setDateRange(
                    event.target.value
                  )
                }
                disabled={
                  loading
                }
                className="
                  h-9 w-full
                  border
                  border-[#BFCAC4]
                  bg-white
                  px-2.5
                  text-[11px]
                  font-semibold
                  text-[#30443B]
                  outline-none
                  focus:border-[#667E72]
                  disabled:opacity-60
                "
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
            </label>


            <div>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.03em] text-[#4D6158]">
                Format
              </span>

              <div className="grid grid-cols-2 gap-1">
                {(
                  [
                    "PDF",
                    "CSV",
                  ] as const
                ).map(
                  (option) => (
                    <button
                      key={
                        option
                      }
                      type="button"
                      onClick={() =>
                        setFormat(
                          option
                        )
                      }
                      disabled={
                        loading
                      }
                      className={`
                        h-9 border
                        text-[10px]
                        font-bold

                        ${
                          format ===
                          option
                            ? "border-[#073B2F] bg-[#EAF0EC] text-[#073B2F]"
                            : "border-[#BFCAC4] bg-white text-[#52645C]"
                        }
                      `}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>


        <footer className="flex justify-end gap-1.5 border-t border-[#D4DDD8] bg-[#F8F7F2] px-4 py-3">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            className="
              h-8 border
              border-[#B4C0BA]
              bg-white px-3
              text-[10px]
              font-bold
              text-[#52645C]
              hover:bg-[#F0F2F0]
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleGenerate
            }
            disabled={
              loading
            }
            className="
              inline-flex h-8
              min-w-[120px]
              items-center
              justify-center
              gap-1.5
              border
              border-[#063428]
              bg-[#073B2F]
              px-3
              text-[10px]
              font-bold
              text-white
              hover:bg-[#0D4A3A]
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={11}
                  className="animate-spin"
                />

                Generating...
              </>
            ) : (
              <>
                <FileText
                  size={11}
                />

                Generate
              </>
            )}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}


function SummaryCell({
  label,
  value,
  gold = false,
}: {
  label: string;
  value: number;
  gold?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8DFDB] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span
        className={`
          text-[20px]
          font-bold

          ${
            gold
              ? "text-[#9A7420]"
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
