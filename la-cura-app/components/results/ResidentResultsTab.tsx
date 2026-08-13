"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ChevronDown,
  CircleAlert,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  clinicalLocale,
  clinicalText,
  type ClinicalLanguage,
} from "@/lib/i18n/clinicalModules";


type LabFlag =
  | "Normal"
  | "L"
  | "H"
  | "LL"
  | "HH"
  | "Critical"
  | "Abnormal";


type LabResult = {
  id: number;
  report_id: number;

  test_name: string;
  result_value: string;

  numeric_value:
    | number
    | null;

  units:
    | string
    | null;

  reference_low:
    | number
    | null;

  reference_high:
    | number
    | null;

  reference_range:
    | string
    | null;

  flag: LabFlag;

  sort_order: number;
};


type LabReport = {
  id: number;

  resident_id: number;
  resident_name: string;

  order_id:
    | number
    | null;

  report_name: string;
  category: string;

  report_status: string;

  collection_at:
    | string
    | null;

  reported_at:
    | string
    | null;

  performing_lab:
    | string
    | null;

  review_status: string;

  reviewed_by:
    | string
    | null;

  reviewed_at:
    | string
    | null;

  notes:
    | string
    | null;

  revision_number: number;

  revision_date:
    | string
    | null;

  created_by: string;

  results?: LabResult[];
};


type RadiologyReport = {
  id: number;

  resident_id: number;
  resident_name: string;

  order_id:
    | number
    | null;

  study_name: string;

  body_site:
    | string
    | null;

  report_status: string;

  study_at:
    | string
    | null;

  reported_at:
    | string
    | null;

  radiologist:
    | string
    | null;

  performing_facility:
    | string
    | null;

  findings:
    | string
    | null;

  impression:
    | string
    | null;

  review_status: string;

  reviewed_by:
    | string
    | null;

  reviewed_at:
    | string
    | null;

  notes:
    | string
    | null;

  revision_number: number;

  revision_date:
    | string
    | null;

  created_by: string;
};


type OrderOption = {
  id: number;
  category: string;
  order_name: string;
  status: string;
  order_date:
    | string
    | null;
};


type Props = {
  residentId: number;
  residentName: string;
};


type LabRowForm = {
  key: string;

  testName: string;
  resultValue: string;
  units: string;

  referenceLow: string;
  referenceHigh: string;
  referenceRange: string;

  flag: LabFlag;
};


type LabForm = {
  orderId: string;

  reportName: string;
  category: string;

  collectionDate: string;
  collectionTime: string;

  reportedDate: string;
  reportedTime: string;

  performingLab: string;

  reportStatus: string;

  notes: string;

  results: LabRowForm[];
};


type RadiologyForm = {
  orderId: string;

  studyName: string;
  bodySite: string;

  studyDate: string;
  studyTime: string;

  reportedDate: string;
  reportedTime: string;

  radiologist: string;
  facility: string;

  findings: string;
  impression: string;

  reportStatus: string;

  notes: string;
};


function cleanText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function dateValue(
  date = new Date()
) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}


function timeValue(
  date = new Date()
) {
  return `${String(
    date.getHours()
  ).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}


function splitDateTime(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return {
      date: "",
      time: "",
    };
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return {
      date: "",
      time: "",
    };
  }

  return {
    date:
      dateValue(date),

    time:
      timeValue(date),
  };
}


function combineDateTime(
  date: string,
  time: string
) {
  if (!date) {
    return "";
  }

  const result =
    new Date(
      `${date}T${
        time || "00:00"
      }`
    );

  return Number.isNaN(
    result.getTime()
  )
    ? ""
    : result.toISOString();
}


function formatDateTime(
  value:
    | string
    | null
    | undefined,
  language:
    ClinicalLanguage
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
    clinicalLocale(
      language
    ),
    {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}


function newLabRow(): LabRowForm {
  return {
    key:
      crypto.randomUUID(),

    testName: "",
    resultValue: "",
    units: "",

    referenceLow: "",
    referenceHigh: "",
    referenceRange: "",

    flag: "Normal",
  };
}


function emptyLabForm(): LabForm {
  const now =
    new Date();

  return {
    orderId: "",

    reportName: "",
    category: "Chemistry",

    collectionDate:
      dateValue(now),

    collectionTime:
      timeValue(now),

    reportedDate:
      dateValue(now),

    reportedTime:
      timeValue(now),

    performingLab: "",

    reportStatus:
      "Completed",

    notes: "",

    results: [
      newLabRow(),
    ],
  };
}


function emptyRadiologyForm(): RadiologyForm {
  const now =
    new Date();

  return {
    orderId: "",

    studyName: "",
    bodySite: "",

    studyDate:
      dateValue(now),

    studyTime:
      timeValue(now),

    reportedDate:
      dateValue(now),

    reportedTime:
      timeValue(now),

    radiologist: "",
    facility: "",

    findings: "",
    impression: "",

    reportStatus:
      "Final",

    notes: "",
  };
}


function flagRank(
  flag: LabFlag
) {
  if (
    flag ===
      "Critical" ||
    flag === "LL" ||
    flag === "HH"
  ) {
    return 3;
  }

  if (
    flag === "L" ||
    flag === "H" ||
    flag === "Abnormal"
  ) {
    return 2;
  }

  return 0;
}


function reportFlag(
  report: LabReport
) {
  let best: LabFlag =
    "Normal";

  for (
    const result
    of report.results ?? []
  ) {
    if (
      flagRank(
        result.flag
      ) >
      flagRank(best)
    ) {
      best =
        result.flag;
    }
  }

  return best;
}


function autoFlag(
  value: string,
  low: string,
  high: string,
  current:
    LabFlag
): LabFlag {
  if (
    current ===
      "Critical" ||
    current === "LL" ||
    current === "HH" ||
    current ===
      "Abnormal"
  ) {
    return current;
  }

  const numeric =
    Number(value);

  const lowValue =
    Number(low);

  const highValue =
    Number(high);


  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return "Normal";
  }


  if (
    low.trim() &&
    Number.isFinite(
      lowValue
    ) &&
    numeric < lowValue
  ) {
    return "L";
  }


  if (
    high.trim() &&
    Number.isFinite(
      highValue
    ) &&
    numeric > highValue
  ) {
    return "H";
  }


  return "Normal";
}


function flagDisplayClass(
  flag: LabFlag
) {
  if (
    flag ===
      "Critical" ||
    flag === "LL" ||
    flag === "HH"
  ) {
    return "font-extrabold text-red-700";
  }

  if (
    flag === "L" ||
    flag === "H" ||
    flag ===
      "Abnormal"
  ) {
    return "font-bold text-amber-700";
  }

  return "text-[#4B5B54]";
}


function errorMessage(
  value: unknown,
  fallback: string
) {
  if (
    value instanceof
    Error
  ) {
    return value.message;
  }

  if (
    value &&
    typeof value ===
      "object"
  ) {
    const record =
      value as Record<
        string,
        unknown
      >;

    return (
      cleanText(
        record.message
      ) ||
      cleanText(
        record.details
      ) ||
      fallback
    );
  }

  return fallback;
}


export default function ResidentResultsTab({
  residentId,
  residentName,
}: Props) {
  const { language } = useLanguage();

  const [
    section,
    setSection,
  ] = useState<
    "Laboratory" |
    "Radiology"
  >("Laboratory");

  const [
    labReports,
    setLabReports,
  ] = useState<
    LabReport[]
  >([]);

  const [
    radiologyReports,
    setRadiologyReports,
  ] = useState<
    RadiologyReport[]
  >([]);

  const [
    orders,
    setOrders,
  ] = useState<
    OrderOption[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    labFormOpen,
    setLabFormOpen,
  ] = useState(false);

  const [
    editingLab,
    setEditingLab,
  ] =
    useState<LabReport | null>(
      null
    );

  const [
    viewingLab,
    setViewingLab,
  ] =
    useState<LabReport | null>(
      null
    );

  const [
    radiologyFormOpen,
    setRadiologyFormOpen,
  ] = useState(false);

  const [
    editingRadiology,
    setEditingRadiology,
  ] =
    useState<RadiologyReport | null>(
      null
    );

  const [
    viewingRadiology,
    setViewingRadiology,
  ] =
    useState<RadiologyReport | null>(
      null
    );

  const [
    trendingOpen,
    setTrendingOpen,
  ] = useState(false);


  const loadData =
    useCallback(
      async (
        quiet = false
      ) => {
        quiet
          ? setRefreshing(true)
          : setLoading(true);

        setError("");

        try {
          const [
            labResponse,
            radiologyResponse,
            orderResponse,
          ] =
            await Promise.all([
              supabase
                .from(
                  "lab_reports"
                )
                .select("*")
                .eq(
                  "resident_id",
                  residentId
                )
                .order(
                  "collection_at",
                  {
                    ascending:
                      false,
                  }
                ),

              supabase
                .from(
                  "radiology_reports"
                )
                .select("*")
                .eq(
                  "resident_id",
                  residentId
                )
                .order(
                  "study_at",
                  {
                    ascending:
                      false,
                  }
                ),

              supabase
                .from("orders")
                .select(
                  "id, category, order_name, status, order_date"
                )
                .eq(
                  "resident_id",
                  residentId
                )
                .in(
                  "category",
                  [
                    "Laboratory",
                    "Diagnostic",
                  ]
                )
                .order(
                  "order_date",
                  {
                    ascending:
                      false,
                  }
                ),
            ]);


          if (
            labResponse.error
          ) {
            throw labResponse.error;
          }

          if (
            radiologyResponse.error
          ) {
            throw radiologyResponse.error;
          }

          if (
            orderResponse.error
          ) {
            throw orderResponse.error;
          }


          const reports =
            (labResponse.data ??
              []) as LabReport[];


          const reportIds =
            reports.map(
              (
                report
              ) =>
                report.id
            );


          let resultRows:
            LabResult[] = [];


          if (
            reportIds.length >
            0
          ) {
            const {
              data,
              error:
                resultError,
            } =
              await supabase
                .from(
                  "lab_results"
                )
                .select("*")
                .in(
                  "report_id",
                  reportIds
                )
                .order(
                  "sort_order",
                  {
                    ascending:
                      true,
                  }
                );


            if (resultError) {
              throw resultError;
            }


            resultRows =
              (data ??
                []) as LabResult[];
          }


          const byReport =
            new Map<
              number,
              LabResult[]
            >();


          for (
            const result
            of resultRows
          ) {
            const list =
              byReport.get(
                result.report_id
              ) ?? [];

            list.push(result);

            byReport.set(
              result.report_id,
              list
            );
          }


          setLabReports(
            reports.map(
              (
                report
              ) => ({
                ...report,

                results:
                  byReport.get(
                    report.id
                  ) ?? [],
              })
            )
          );


          setRadiologyReports(
            (radiologyResponse.data ??
              []) as RadiologyReport[]
          );


          setOrders(
            (orderResponse.data ??
              []) as OrderOption[]
          );
        } catch (
          caughtError
        ) {
          console.error(
            "Unable to load results:",
            caughtError
          );

          setError(
            errorMessage(
              caughtError,
              clinicalText(
                language,
                "The operation could not be completed."
              )
            )
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false
          );
        }
      },
      [
        residentId,
      ]
    );


  useEffect(() => {
    void loadData();
  }, [
    loadData,
  ]);


  const filteredLabs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return labReports;
      }

      return labReports.filter(
        (
          report
        ) =>
          [
            report.report_name,
            report.category,
            report.report_status,
            report.review_status,
            report.performing_lab,
            ...(report.results ??
              []).flatMap(
                (
                  result
                ) => [
                  result.test_name,
                  result.result_value,
                ]
              ),
          ].some(
            (
              value
            ) =>
              cleanText(
                value
              )
                .toLowerCase()
                .includes(
                  query
                )
          )
      );
    }, [
      labReports,
      search,
    ]);


  const filteredRadiology =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return radiologyReports;
      }

      return radiologyReports.filter(
        (
          report
        ) =>
          [
            report.study_name,
            report.body_site,
            report.radiologist,
            report.findings,
            report.impression,
            report.review_status,
          ].some(
            (
              value
            ) =>
              cleanText(
                value
              )
                .toLowerCase()
                .includes(
                  query
                )
          )
      );
    }, [
      radiologyReports,
      search,
    ]);


  async function reviewLab(
    report: LabReport
  ) {
    const {
      error:
        reviewError,
    } =
      await supabase.rpc(
        "la_cura_review_lab_report",
        {
          p_report_id:
            report.id,
        }
      );

    if (reviewError) {
      window.alert(
        reviewError.message
      );

      return;
    }

    await loadData(true);
  }


  async function reviewRadiology(
    report:
      RadiologyReport
  ) {
    const {
      error:
        reviewError,
    } =
      await supabase.rpc(
        "la_cura_review_radiology_report",
        {
          p_report_id:
            report.id,
        }
      );

    if (reviewError) {
      window.alert(
        reviewError.message
      );

      return;
    }

    await loadData(true);
  }


  function viewLinkedOrder() {
    window.location.href =
      `/residents/${residentId}?tab=orders`;
  }


  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-white">
        <LoaderCircle
          size={20}
          className="animate-spin text-[#073B2F]"
        />
      </div>
    );
  }


  return (
    <>
      <div className="bg-white">
        {/* RESULTS TITLE */}

        <div className="border-b border-[#73865F] bg-[#8FA47A] px-2 py-1 text-[11px] font-bold text-white">
          {clinicalText(language, "Results")}
        </div>


        {/* LAB / RADIOLOGY */}

        <div className="flex gap-2 px-4 pt-3">
          {[
            "Laboratory",
            "Radiology",
          ].map(
            (
              item
            ) => (
              <button
                key={
                  item
                }
                type="button"
                onClick={() => {
                  setSection(
                    item as
                      | "Laboratory"
                      | "Radiology"
                  );

                  setSearch(
                    ""
                  );
                }}
                className={`
                  h-6 px-3
                  text-[10px]
                  font-bold
                  text-white

                  ${
                    section ===
                    item
                      ? "bg-[#8FA47A]"
                      : "bg-[#64686B] hover:bg-[#555B5D]"
                  }
                `}
              >
                {clinicalText(
                  language,
                  item
                )}
              </button>
            )
          )}
        </div>


        <div className="mt-1 border-b border-[#73865F] bg-[#8FA47A] px-2 py-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <strong className="mr-2 text-[11px] text-white">
                {section ===
                "Laboratory"
                  ? clinicalText(
                      language,
                      "Lab Results"
                    )
                  : clinicalText(
                      language,
                      "Radiology Results"
                    )}
              </strong>


              <button
                type="button"
                onClick={() => {
                  if (
                    section ===
                    "Laboratory"
                  ) {
                    setEditingLab(
                      null
                    );

                    setLabFormOpen(
                      true
                    );
                  } else {
                    setEditingRadiology(
                      null
                    );

                    setRadiologyFormOpen(
                      true
                    );
                  }
                }}
                className="inline-flex h-6 items-center gap-1 border border-[#6A795F] bg-white px-2 text-[9px] font-bold text-[#273C33]"
              >
                <Plus
                  size={10}
                />

                {clinicalText(language, "New")}
              </button>


              {section ===
                "Laboratory" && (
                <button
                  type="button"
                  onClick={() =>
                    setTrendingOpen(
                      true
                    )
                  }
                  className="inline-flex h-6 items-center gap-1 border border-[#6A795F] bg-white px-2 text-[9px] font-bold text-[#273C33]"
                >
                  <TrendingUp
                    size={10}
                  />

                  {clinicalText(language, "Trending")}
                </button>
              )}
            </div>


            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                void loadData(
                  true
                )
              }
              className="inline-flex h-6 items-center gap-1 border border-[#6A795F] bg-white px-2 text-[9px] font-bold text-[#273C33] disabled:opacity-50"
            >
              <RefreshCw
                size={9}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {clinicalText(language, "Refresh")}
            </button>
          </div>
        </div>


        {/* FILTER */}

        <div className="border-b border-[#B7B7B7] bg-[#929292] px-3 py-1.5">
          <div className="relative max-w-[440px]">
            <Search
              size={11}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6C7670]"
            />

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder={clinicalText(language, "Display filters / search results...")}
              className="h-7 w-full border border-[#B8C1BC] bg-white pl-7 pr-2 text-[10px] outline-none"
            />
          </div>
        </div>


        {error && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}


        {section ===
        "Laboratory" ? (
          <LaboratoryTable
            reports={
              filteredLabs
            }
            onView={
              setViewingLab
            }
            onEdit={(
              report
            ) => {
              setEditingLab(
                report
              );

              setLabFormOpen(
                true
              );
            }}
            onReview={(
              report
            ) =>
              void reviewLab(
                report
              )
            }
            onViewOrder={
              viewLinkedOrder
            }
          />
        ) : (
          <RadiologyTable
            reports={
              filteredRadiology
            }
            onView={
              setViewingRadiology
            }
            onEdit={(
              report
            ) => {
              setEditingRadiology(
                report
              );

              setRadiologyFormOpen(
                true
              );
            }}
            onReview={(
              report
            ) =>
              void reviewRadiology(
                report
              )
            }
            onViewOrder={
              viewLinkedOrder
            }
          />
        )}
      </div>


      <LabEntryModal
        open={
          labFormOpen
        }
        residentId={
          residentId
        }
        residentName={
          residentName
        }
        orders={
          orders.filter(
            (
              order
            ) =>
              order.category ===
              "Laboratory"
          )
        }
        initialReport={
          editingLab
        }
        onClose={() => {
          setLabFormOpen(
            false
          );

          setEditingLab(
            null
          );
        }}
        onSaved={() =>
          void loadData(
            true
          )
        }
      />


      <RadiologyEntryModal
        open={
          radiologyFormOpen
        }
        residentId={
          residentId
        }
        residentName={
          residentName
        }
        orders={
          orders.filter(
            (
              order
            ) =>
              order.category ===
              "Diagnostic"
          )
        }
        initialReport={
          editingRadiology
        }
        onClose={() => {
          setRadiologyFormOpen(
            false
          );

          setEditingRadiology(
            null
          );
        }}
        onSaved={() =>
          void loadData(
            true
          )
        }
      />


      {viewingLab && (
        <LabViewModal
          report={
            viewingLab
          }
          onClose={() =>
            setViewingLab(
              null
            )
          }
        />
      )}


      {viewingRadiology && (
        <RadiologyViewModal
          report={
            viewingRadiology
          }
          onClose={() =>
            setViewingRadiology(
              null
            )
          }
        />
      )}


      {trendingOpen && (
        <TrendingModal
          reports={
            labReports
          }
          onClose={() =>
            setTrendingOpen(
              false
            )
          }
        />
      )}
    </>
  );
}


function LaboratoryTable({
  reports,
  onView,
  onEdit,
  onReview,
  onViewOrder,
}: {
  reports:
    LabReport[];

  onView: (
    report:
      LabReport
  ) => void;

  onEdit: (
    report:
      LabReport
  ) => void;

  onReview: (
    report:
      LabReport
  ) => void;

  onViewOrder:
    () => void;
}) {
  const { language } = useLanguage();

  if (
    reports.length === 0
  ) {
    return (
      <div className="px-6 py-12 text-center text-[11px] text-[#697970]">
        {clinicalText(language, "No laboratory reports are recorded for this resident.")}
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px] border-collapse">
        <thead>
          <tr className="bg-gradient-to-b from-white to-[#D9D9D9] text-[9px] font-bold text-[#263A31]">
            <Head>
              {clinicalText(language, "Actions")}
            </Head>

            <Head>
              {clinicalText(language, "Flag")}
            </Head>

            <Head>
              {clinicalText(language, "Report Name")}
            </Head>

            <Head>
              {clinicalText(language, "Report Status")}
            </Head>

            <Head>
              {clinicalText(language, "Category")}
            </Head>

            <Head>
              {clinicalText(language, "Collection Date")}
            </Head>

            <Head>
              {clinicalText(language, "Reported Date")}
            </Head>

            <Head>
              {clinicalText(language, "Review Status")}
            </Head>
          </tr>
        </thead>


        <tbody>
          {reports.map(
            (
              report,
              index
            ) => {
              const flag =
                reportFlag(
                  report
                );

              return (
                <tr
                  key={
                    report.id
                  }
                  className={`
                    border-b border-[#D7D7D7]
                    text-[10px]

                    ${
                      index % 2 ===
                      0
                        ? "bg-white"
                        : "bg-[#FAFAFA]"
                    }
                  `}
                >
                  <td className="w-[110px] border-r border-[#D7D7D7] px-1 py-1">
                    <select
                      defaultValue=""
                      onChange={(
                        event
                      ) => {
                        const action =
                          event.target
                            .value;

                        event.target.value =
                          "";

                        if (
                          action ===
                          "view"
                        ) {
                          onView(
                            report
                          );
                        }

                        if (
                          action ===
                          "order"
                        ) {
                          onViewOrder();
                        }

                        if (
                          action ===
                          "review"
                        ) {
                          onReview(
                            report
                          );
                        }

                        if (
                          action ===
                          "edit"
                        ) {
                          onEdit(
                            report
                          );
                        }
                      }}
                      className="h-6 w-[95px] border border-[#AEB8B3] bg-white px-1 text-[9px] font-semibold text-[#12639B]"
                    >
                      <option value="">
                        {clinicalText(language, "Actions")}
                      </option>

                      <option value="view">
                        {clinicalText(language, "View Results")}
                      </option>

                      {report.order_id && (
                        <option value="order">
                          {clinicalText(language, "View Order")}
                        </option>
                      )}

                      {report.review_status !==
                        "Reviewed" && (
                        <option value="review">
                          {clinicalText(language, "Review / Sign")}
                        </option>
                      )}

                      <option value="edit">
                        {clinicalText(language, "Edit / Correct")}
                      </option>
                    </select>
                  </td>


                  <td className="w-[42px] border-r border-[#D7D7D7] px-2 py-1 text-center">
                    <ReportFlagIcon
                      flag={
                        flag
                      }
                    />
                  </td>


                  <td className="border-r border-[#D7D7D7] px-2 py-1 font-medium text-[#1E342B]">
                    {report.report_name}
                  </td>


                  <td className="border-r border-[#D7D7D7] px-2 py-1">
                    {clinicalText(language, report.report_status)}
                  </td>


                  <td className="border-r border-[#D7D7D7] px-2 py-1">
                    {clinicalText(language, report.category)}
                  </td>


                  <td className="whitespace-nowrap border-r border-[#D7D7D7] px-2 py-1">
                    {formatDateTime(
                      report.collection_at
                    ,
            language)}
                  </td>


                  <td className="whitespace-nowrap border-r border-[#D7D7D7] px-2 py-1">
                    {formatDateTime(
                      report.reported_at
                    ,
            language)}
                  </td>


                  <td className="px-2 py-1 font-semibold">
                    {clinicalText(language, report.review_status)}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}


function RadiologyTable({
  reports,
  onView,
  onEdit,
  onReview,
  onViewOrder,
}: {
  reports:
    RadiologyReport[];

  onView: (
    report:
      RadiologyReport
  ) => void;

  onEdit: (
    report:
      RadiologyReport
  ) => void;

  onReview: (
    report:
      RadiologyReport
  ) => void;

  onViewOrder:
    () => void;
}) {
  const { language } = useLanguage();

  if (
    reports.length === 0
  ) {
    return (
      <div className="px-6 py-12 text-center text-[11px] text-[#697970]">
        {clinicalText(language, "No radiology reports are recorded for this resident.")}
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse">
        <thead>
          <tr className="bg-gradient-to-b from-white to-[#D9D9D9] text-[9px] font-bold text-[#263A31]">
            <Head>
              {clinicalText(language, "Actions")}
            </Head>

            <Head>
              {clinicalText(language, "Study")}
            </Head>

            <Head>
              {clinicalText(language, "Body Site")}
            </Head>

            <Head>
              {clinicalText(language, "Status")}
            </Head>

            <Head>
              {clinicalText(language, "Study Date")}
            </Head>

            <Head>
              {clinicalText(language, "Reported Date")}
            </Head>

            <Head>
              {clinicalText(language, "Radiologist")}
            </Head>

            <Head>
              {clinicalText(language, "Review Status")}
            </Head>
          </tr>
        </thead>


        <tbody>
          {reports.map(
            (
              report,
              index
            ) => (
              <tr
                key={
                  report.id
                }
                className={`
                  border-b border-[#D7D7D7]
                  text-[10px]

                  ${
                    index % 2 ===
                    0
                      ? "bg-white"
                      : "bg-[#FAFAFA]"
                  }
                `}
              >
                <td className="w-[110px] border-r border-[#D7D7D7] px-1 py-1">
                  <select
                    defaultValue=""
                    onChange={(
                      event
                    ) => {
                      const action =
                        event.target
                          .value;

                      event.target.value =
                        "";

                      if (
                        action ===
                        "view"
                      ) {
                        onView(
                          report
                        );
                      }

                      if (
                        action ===
                        "order"
                      ) {
                        onViewOrder();
                      }

                      if (
                        action ===
                        "review"
                      ) {
                        onReview(
                          report
                        );
                      }

                      if (
                        action ===
                        "edit"
                      ) {
                        onEdit(
                          report
                        );
                      }
                    }}
                    className="h-6 w-[95px] border border-[#AEB8B3] bg-white px-1 text-[9px] font-semibold text-[#12639B]"
                  >
                    <option value="">
                      {clinicalText(language, "Actions")}
                    </option>

                    <option value="view">
                      {clinicalText(language, "View Report")}
                    </option>

                    {report.order_id && (
                      <option value="order">
                        {clinicalText(language, "View Order")}
                      </option>
                    )}

                    {report.review_status !==
                      "Reviewed" && (
                      <option value="review">
                        {clinicalText(language, "Review / Sign")}
                      </option>
                    )}

                    <option value="edit">
                      {clinicalText(language, "Edit / Correct")}
                    </option>
                  </select>
                </td>


                <td className="border-r border-[#D7D7D7] px-2 py-1 font-semibold">
                  {report.study_name}
                </td>

                <td className="border-r border-[#D7D7D7] px-2 py-1">
                  {report.body_site ||
                    "—"}
                </td>

                <td className="border-r border-[#D7D7D7] px-2 py-1">
                  {clinicalText(language, report.report_status)}
                </td>

                <td className="whitespace-nowrap border-r border-[#D7D7D7] px-2 py-1">
                  {formatDateTime(
                    report.study_at
                  ,
            language)}
                </td>

                <td className="whitespace-nowrap border-r border-[#D7D7D7] px-2 py-1">
                  {formatDateTime(
                    report.reported_at
                  ,
            language)}
                </td>

                <td className="border-r border-[#D7D7D7] px-2 py-1">
                  {report.radiologist ||
                    "—"}
                </td>

                <td className="px-2 py-1 font-semibold">
                  {clinicalText(language, report.review_status)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function LabEntryModal({
  open,
  residentId,
  residentName,
  orders,
  initialReport,
  onClose,
  onSaved,
}: {
  open: boolean;

  residentId: number;
  residentName: string;

  orders:
    OrderOption[];

  initialReport:
    | LabReport
    | null;

  onClose:
    () => void;

  onSaved:
    () => void;
}) {
  const { language } = useLanguage();

  const [
    form,
    setForm,
  ] =
    useState<LabForm>(
      emptyLabForm()
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    if (!open) {
      return;
    }


    if (
      initialReport
    ) {
      const collection =
        splitDateTime(
          initialReport.collection_at
        );

      const reported =
        splitDateTime(
          initialReport.reported_at
        );


      setForm({
        orderId:
          initialReport.order_id
            ? String(
                initialReport.order_id
              )
            : "",

        reportName:
          initialReport.report_name,

        category:
          initialReport.category,

        collectionDate:
          collection.date,

        collectionTime:
          collection.time,

        reportedDate:
          reported.date,

        reportedTime:
          reported.time,

        performingLab:
          initialReport.performing_lab ??
          "",

        reportStatus:
          initialReport.report_status,

        notes:
          initialReport.notes ??
          "",

        results:
          (
            initialReport.results ??
            []
          ).map(
            (
              result
            ) => ({
              key:
                String(
                  result.id
                ),

              testName:
                result.test_name,

              resultValue:
                result.result_value,

              units:
                result.units ??
                "",

              referenceLow:
                result.reference_low ===
                null
                  ? ""
                  : String(
                      result.reference_low
                    ),

              referenceHigh:
                result.reference_high ===
                null
                  ? ""
                  : String(
                      result.reference_high
                    ),

              referenceRange:
                result.reference_range ??
                "",

              flag:
                result.flag,
            })
          ),
      });
    } else {
      setForm(
        emptyLabForm()
      );
    }


    setError("");
  }, [
    open,
    initialReport,
  ]);


  if (!open) {
    return null;
  }


  function updateRow(
    key: string,
    field:
      keyof LabRowForm,
    value: string
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        results:
          current.results.map(
            (
              row
            ) => {
              if (
                row.key !==
                key
              ) {
                return row;
              }


              const next = {
                ...row,
                [field]:
                  value,
              } as LabRowForm;


              if (
                field ===
                  "resultValue" ||
                field ===
                  "referenceLow" ||
                field ===
                  "referenceHigh"
              ) {
                next.flag =
                  autoFlag(
                    field ===
                      "resultValue"
                      ? value
                      : next.resultValue,

                    field ===
                      "referenceLow"
                      ? value
                      : next.referenceLow,

                    field ===
                      "referenceHigh"
                      ? value
                      : next.referenceHigh,

                    next.flag
                  );
              }


              return next;
            }
          ),
      })
    );
  }


  function selectFlag(
    key: string,
    flag: LabFlag
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        results:
          current.results.map(
            (
              row
            ) =>
              row.key ===
              key
                ? {
                    ...row,
                    flag,
                  }
                : row
          ),
      })
    );
  }


  async function save() {
    if (
      !form.reportName.trim()
    ) {
      setError(
        clinicalText(
          language,
          "Report name is required."
        )
      );

      return;
    }


    const validResults =
      form.results.filter(
        (
          row
        ) =>
          row.testName.trim() &&
          row.resultValue.trim()
      );


    if (
      validResults.length ===
      0
    ) {
      setError(
        clinicalText(
          language,
          "Enter at least one laboratory test and result."
        )
      );

      return;
    }


    setSaving(true);
    setError("");


    try {
      const payload = {
        resident_id:
          residentId,

        order_id:
          form.orderId,

        report_name:
          form.reportName.trim(),

        category:
          form.category,

        report_status:
          form.reportStatus,

        collection_at:
          combineDateTime(
            form.collectionDate,
            form.collectionTime
          ),

        reported_at:
          combineDateTime(
            form.reportedDate,
            form.reportedTime
          ),

        performing_lab:
          form.performingLab.trim(),

        notes:
          form.notes.trim(),

        results:
          validResults.map(
            (
              row
            ) => {
              const numeric =
                Number(
                  row.resultValue
                );

              return {
                test_name:
                  row.testName.trim(),

                result_value:
                  row.resultValue.trim(),

                numeric_value:
                  Number.isFinite(
                    numeric
                  )
                    ? String(
                        numeric
                      )
                    : "",

                units:
                  row.units.trim(),

                reference_low:
                  row.referenceLow,

                reference_high:
                  row.referenceHigh,

                reference_range:
                  row.referenceRange.trim(),

                flag:
                  row.flag,
              };
            }
          ),
      };


      if (
        initialReport
      ) {
        const {
          error:
            updateError,
        } =
          await supabase.rpc(
            "la_cura_update_lab_report",
            {
              p_report_id:
                initialReport.id,

              p_payload:
                payload,
            }
          );


        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          error:
            createError,
        } =
          await supabase.rpc(
            "la_cura_create_lab_report",
            {
              p_payload:
                payload,
            }
          );


        if (createError) {
          throw createError;
        }
      }


      onSaved();
      onClose();
    } catch (
      caughtError
    ) {
      console.error(
        "Unable to save laboratory report:",
        caughtError
      );

      setError(
        errorMessage(
          caughtError,
          clinicalText(
            language,
            "The operation could not be completed."
          )
        )
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <ModalShell
      title={
        initialReport
          ? clinicalText(
              language,
              "Correct Laboratory Result"
            )
          : clinicalText(
              language,
              "New Laboratory Result"
            )
      }
      residentName={
        residentName
      }
      onClose={
        onClose
      }
      saving={
        saving
      }
      footer={
        <>
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void save()
            }
            className="h-8 border border-[#073B2F] bg-[#073B2F] px-4 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {saving
              ? clinicalText(language, "Saving...")
              : initialReport
                ? clinicalText(language, "Save Correction")
                : clinicalText(language, "Save")}
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="h-8 border border-[#8D9C94] bg-white px-4 text-[10px] font-bold text-[#34483F]"
          >
            {clinicalText(language, "Cancel")}
          </button>
        </>
      }
    >
      <SectionBar>
        {clinicalText(language, "Report Details")}
      </SectionBar>


      <div className="grid gap-3 p-3 md:grid-cols-2">
        <Select
          label={clinicalText(language, "Linked Laboratory Order")}
          value={
            form.orderId
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                orderId:
                  value,
              })
            )
          }
          options={[
            {
              value: "",
              label:
                "No linked order",
            },

            ...orders.map(
              (
                order
              ) => ({
                value:
                  String(
                    order.id
                  ),

                label:
                  `${order.order_name} — ${clinicalText(
                    language,
                    order.status
                  )}`,
              })
            ),
          ]}
        />


        <Input
          label={clinicalText(language, "Report Name")}
          required
          value={
            form.reportName
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportName:
                  value,
              })
            )
          }
          placeholder={clinicalText(language, "CBC / Basic Metabolic Panel")}
        />


        <Select
          label={clinicalText(language, "Category")}
          value={
            form.category
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                category:
                  value,
              })
            )
          }
          options={[
            {
              value:
                "Chemistry",
              label:
                "Chemistry",
            },
            {
              value:
                "Hematology",
              label:
                "Hematology",
            },
            {
              value:
                "Microbiology",
              label:
                "Microbiology",
            },
            {
              value:
                "Urinalysis",
              label:
                "Urinalysis",
            },
            {
              value:
                "Endocrinology",
              label:
                "Endocrinology",
            },
            {
              value:
                "Coagulation",
              label:
                "Coagulation",
            },
            {
              value:
                "Other",
              label:
                "Other",
            },
          ]}
        />


        <Input
          label={clinicalText(language, "Performing Laboratory")}
          value={
            form.performingLab
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                performingLab:
                  value,
              })
            )
          }
        />


        <DateTimePair
          label={clinicalText(language, "Collection Date / Time")}
          date={
            form.collectionDate
          }
          time={
            form.collectionTime
          }
          onDate={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                collectionDate:
                  value,
              })
            )
          }
          onTime={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                collectionTime:
                  value,
              })
            )
          }
        />


        <DateTimePair
          label={clinicalText(language, "Reported Date / Time")}
          date={
            form.reportedDate
          }
          time={
            form.reportedTime
          }
          onDate={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportedDate:
                  value,
              })
            )
          }
          onTime={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportedTime:
                  value,
              })
            )
          }
        />


        <Select
          label={clinicalText(language, "Report Status")}
          value={
            form.reportStatus
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportStatus:
                  value,
              })
            )
          }
          options={[
            {
              value:
                "Draft",
              label:
                "Draft",
            },
            {
              value:
                "Preliminary",
              label:
                "Preliminary",
            },
            {
              value:
                "Completed",
              label:
                "Completed",
            },
            {
              value:
                "Corrected",
              label:
                "Corrected",
            },
          ]}
        />
      </div>


      <SectionBar>
        {clinicalText(language, "Laboratory Results")}
      </SectionBar>


      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="bg-[#E7ECE8] text-[9px] font-bold text-[#34483F]">
              <Head>
                {clinicalText(language, "Test")}
              </Head>

              <Head>
                {clinicalText(language, "Result")}
              </Head>

              <Head>
                {clinicalText(language, "Units")}
              </Head>

              <Head>
                {clinicalText(language, "Ref Low")}
              </Head>

              <Head>
                {clinicalText(language, "Ref High")}
              </Head>

              <Head>
                {clinicalText(language, "Reference Range")}
              </Head>

              <Head>
                {clinicalText(language, "Flag")}
              </Head>

              <Head>
                {clinicalText(language, "Remove")}
              </Head>
            </tr>
          </thead>


          <tbody>
            {form.results.map(
              (
                row
              ) => (
                <tr
                  key={
                    row.key
                  }
                  className="border-b border-[#D9DFDB]"
                >
                  <CellInput
                    value={
                      row.testName
                    }
                    onChange={(
                      value
                    ) =>
                      updateRow(
                        row.key,
                        "testName",
                        value
                      )
                    }
                  />

                  <CellInput
                    value={
                      row.resultValue
                    }
                    onChange={(
                      value
                    ) =>
                      updateRow(
                        row.key,
                        "resultValue",
                        value
                      )
                    }
                  />

                  <CellInput
                    value={
                      row.units
                    }
                    onChange={(
                      value
                    ) =>
                      updateRow(
                        row.key,
                        "units",
                        value
                      )
                    }
                  />

                  <CellInput
                    value={
                      row.referenceLow
                    }
                    onChange={(
                      value
                    ) =>
                      updateRow(
                        row.key,
                        "referenceLow",
                        value
                      )
                    }
                  />

                  <CellInput
                    value={
                      row.referenceHigh
                    }
                    onChange={(
                      value
                    ) =>
                      updateRow(
                        row.key,
                        "referenceHigh",
                        value
                      )
                    }
                  />

                  <CellInput
                    value={
                      row.referenceRange
                    }
                    onChange={(
                      value
                    ) =>
                      updateRow(
                        row.key,
                        "referenceRange",
                        value
                      )
                    }
                  />


                  <td className="border-r border-[#D9DFDB] p-1">
                    <select
                      value={
                        row.flag
                      }
                      onChange={(
                        event
                      ) =>
                        selectFlag(
                          row.key,
                          event.target
                            .value as
                            LabFlag
                        )
                      }
                      className={`h-7 w-full border border-[#B7C1BC] bg-white px-1 text-[9px] ${flagDisplayClass(
                        row.flag
                      )}`}
                    >
                      {[
                        "Normal",
                        "L",
                        "H",
                        "LL",
                        "HH",
                        "Critical",
                        "Abnormal",
                      ].map(
                        (
                          flag
                        ) => (
                          <option
                            key={
                              flag
                            }
                            value={
                              flag
                            }
                          >
                            {clinicalText(
                              language,
                              flag
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </td>


                  <td className="p-1 text-center">
                    <button
                      type="button"
                      disabled={
                        form.results.length <=
                        1
                      }
                      onClick={() =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,

                            results:
                              current.results.filter(
                                (
                                  item
                                ) =>
                                  item.key !==
                                  row.key
                              ),
                          })
                        )
                      }
                      className="h-7 border border-[#C8D0CB] bg-white px-2 text-[9px] font-bold text-red-700 disabled:opacity-30"
                    >
                      {clinicalText(language, "Remove")}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>


      <div className="p-2">
        <button
          type="button"
          onClick={() =>
            setForm(
              (
                current
              ) => ({
                ...current,

                results: [
                  ...current.results,
                  newLabRow(),
                ],
              })
            )
          }
          className="h-7 border border-[#8FA095] bg-white px-3 text-[9px] font-bold text-[#294338]"
        >
          {clinicalText(language, "+ Add Result")}
        </button>
      </div>


      <SectionBar>
        {clinicalText(language, "Clinical Information")}
      </SectionBar>


      <div className="p-3">
        <label>
          <span className="mb-1 block text-[10px] font-bold text-[#34483F]">
            {clinicalText(language, "Clinical Notes")}
          </span>

          <textarea
            rows={3}
            value={
              form.notes
            }
            onChange={(
              event
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,
                  notes:
                    event.target
                      .value,
                })
              )
            }
            className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
          />
        </label>


        {error && (
          <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}
      </div>
    </ModalShell>
  );
}


function RadiologyEntryModal({
  open,
  residentId,
  residentName,
  orders,
  initialReport,
  onClose,
  onSaved,
}: {
  open: boolean;

  residentId: number;
  residentName: string;

  orders:
    OrderOption[];

  initialReport:
    | RadiologyReport
    | null;

  onClose:
    () => void;

  onSaved:
    () => void;
}) {
  const { language } = useLanguage();

  const [
    form,
    setForm,
  ] =
    useState<RadiologyForm>(
      emptyRadiologyForm()
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    if (!open) {
      return;
    }


    if (
      initialReport
    ) {
      const study =
        splitDateTime(
          initialReport.study_at
        );

      const reported =
        splitDateTime(
          initialReport.reported_at
        );


      setForm({
        orderId:
          initialReport.order_id
            ? String(
                initialReport.order_id
              )
            : "",

        studyName:
          initialReport.study_name,

        bodySite:
          initialReport.body_site ??
          "",

        studyDate:
          study.date,

        studyTime:
          study.time,

        reportedDate:
          reported.date,

        reportedTime:
          reported.time,

        radiologist:
          initialReport.radiologist ??
          "",

        facility:
          initialReport.performing_facility ??
          "",

        findings:
          initialReport.findings ??
          "",

        impression:
          initialReport.impression ??
          "",

        reportStatus:
          initialReport.report_status,

        notes:
          initialReport.notes ??
          "",
      });
    } else {
      setForm(
        emptyRadiologyForm()
      );
    }


    setError("");
  }, [
    open,
    initialReport,
  ]);


  if (!open) {
    return null;
  }


  async function save() {
    if (
      !form.studyName.trim()
    ) {
      setError(
        clinicalText(
          language,
          "Study name is required."
        )
      );

      return;
    }


    setSaving(true);
    setError("");


    const payload = {
      resident_id:
        residentId,

      order_id:
        form.orderId,

      study_name:
        form.studyName.trim(),

      body_site:
        form.bodySite.trim(),

      study_at:
        combineDateTime(
          form.studyDate,
          form.studyTime
        ),

      reported_at:
        combineDateTime(
          form.reportedDate,
          form.reportedTime
        ),

      radiologist:
        form.radiologist.trim(),

      performing_facility:
        form.facility.trim(),

      findings:
        form.findings.trim(),

      impression:
        form.impression.trim(),

      report_status:
        form.reportStatus,

      notes:
        form.notes.trim(),
    };


    try {
      if (
        initialReport
      ) {
        const {
          error:
            updateError,
        } =
          await supabase.rpc(
            "la_cura_update_radiology_report",
            {
              p_report_id:
                initialReport.id,

              p_payload:
                payload,
            }
          );


        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          error:
            createError,
        } =
          await supabase.rpc(
            "la_cura_create_radiology_report",
            {
              p_payload:
                payload,
            }
          );


        if (createError) {
          throw createError;
        }
      }


      onSaved();
      onClose();
    } catch (
      caughtError
    ) {
      setError(
        errorMessage(
          caughtError,
          clinicalText(
            language,
            "The operation could not be completed."
          )
        )
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <ModalShell
      title={
        initialReport
          ? clinicalText(
              language,
              "Correct Radiology Result"
            )
          : clinicalText(
              language,
              "New Radiology Result"
            )
      }
      residentName={
        residentName
      }
      onClose={
        onClose
      }
      saving={
        saving
      }
      footer={
        <>
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void save()
            }
            className="h-8 border border-[#073B2F] bg-[#073B2F] px-4 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {saving
              ? clinicalText(language, "Saving...")
              : clinicalText(language, "Save")}
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="h-8 border border-[#8D9C94] bg-white px-4 text-[10px] font-bold text-[#34483F]"
          >
            {clinicalText(language, "Cancel")}
          </button>
        </>
      }
    >
      <SectionBar>
        {clinicalText(language, "Radiology Report")}
      </SectionBar>


      <div className="grid gap-3 p-3 md:grid-cols-2">
        <Select
          label={clinicalText(language, "Linked Diagnostic Order")}
          value={
            form.orderId
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                orderId:
                  value,
              })
            )
          }
          options={[
            {
              value: "",
              label:
                "No linked order",
            },

            ...orders.map(
              (
                order
              ) => ({
                value:
                  String(
                    order.id
                  ),

                label:
                  `${order.order_name} — ${clinicalText(
                    language,
                    order.status
                  )}`,
              })
            ),
          ]}
        />


        <Input
          label={clinicalText(language, "Study")}
          required
          value={
            form.studyName
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                studyName:
                  value,
              })
            )
          }
          placeholder={clinicalText(language, "Chest X-Ray, CT Abdomen/Pelvis...")}
        />


        <Input
          label={clinicalText(language, "Body Site")}
          value={
            form.bodySite
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                bodySite:
                  value,
              })
            )
          }
        />


        <Select
          label={clinicalText(language, "Report Status")}
          value={
            form.reportStatus
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportStatus:
                  value,
              })
            )
          }
          options={[
            {
              value:
                "Preliminary",
              label:
                "Preliminary",
            },
            {
              value:
                "Final",
              label:
                "Final",
            },
            {
              value:
                "Corrected",
              label:
                "Corrected",
            },
          ]}
        />


        <DateTimePair
          label={clinicalText(language, "Study Date / Time")}
          date={
            form.studyDate
          }
          time={
            form.studyTime
          }
          onDate={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                studyDate:
                  value,
              })
            )
          }
          onTime={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                studyTime:
                  value,
              })
            )
          }
        />


        <DateTimePair
          label={clinicalText(language, "Reported Date / Time")}
          date={
            form.reportedDate
          }
          time={
            form.reportedTime
          }
          onDate={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportedDate:
                  value,
              })
            )
          }
          onTime={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                reportedTime:
                  value,
              })
            )
          }
        />


        <Input
          label={clinicalText(language, "Radiologist")}
          value={
            form.radiologist
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                radiologist:
                  value,
              })
            )
          }
        />


        <Input
          label={clinicalText(language, "Performing Facility")}
          value={
            form.facility
          }
          onChange={(
            value
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                facility:
                  value,
              })
            )
          }
        />
      </div>


      <SectionBar>
        {clinicalText(language, "Findings")}
      </SectionBar>

      <div className="p-3">
        <textarea
          rows={5}
          value={
            form.findings
          }
          onChange={(
            event
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                findings:
                  event.target
                    .value,
              })
            )
          }
          className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
        />
      </div>


      <SectionBar>
        {clinicalText(language, "Impression")}
      </SectionBar>

      <div className="p-3">
        <textarea
          rows={4}
          value={
            form.impression
          }
          onChange={(
            event
          ) =>
            setForm(
              (
                current
              ) => ({
                ...current,
                impression:
                  event.target
                    .value,
              })
            )
          }
          className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
        />


        <label className="mt-3 block">
          <span className="mb-1 block text-[10px] font-bold text-[#34483F]">
            {clinicalText(language, "Notes")}
          </span>

          <textarea
            rows={2}
            value={
              form.notes
            }
            onChange={(
              event
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,
                  notes:
                    event.target
                      .value,
                })
              )
            }
            className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
          />
        </label>


        {error && (
          <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}
      </div>
    </ModalShell>
  );
}


function LabViewModal({
  report,
  onClose,
}: {
  report: LabReport;

  onClose:
    () => void;
}) {
  const { language } = useLanguage();

  return (
    <ModalShell
      title={
        report.report_name
      }
      residentName={
        report.resident_name
      }
      onClose={
        onClose
      }
      footer={
        <button
          type="button"
          onClick={
            onClose
          }
          className="h-8 border border-[#8D9C94] bg-white px-4 text-[10px] font-bold"
        >
          {clinicalText(language, "Close")}
        </button>
      }
    >
      <SectionBar>
        {clinicalText(language, "Laboratory Report")}
      </SectionBar>


      <div className="grid gap-px bg-[#D9DFDB] sm:grid-cols-4">
        <Detail
          label={clinicalText(language, "Status")}
          value={
            clinicalText(
              language,
              report.report_status
            )
          }
        />

        <Detail
          label={clinicalText(language, "Category")}
          value={
            clinicalText(
              language,
              report.category
            )
          }
        />

        <Detail
          label={clinicalText(language, "Collection")}
          value={
            formatDateTime(
              report.collection_at
            ,
            language)
          }
        />

        <Detail
          label={clinicalText(language, "Reported")}
          value={
            formatDateTime(
              report.reported_at
            ,
            language)
          }
        />
      </div>


      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[#E6ECE8] text-[9px] font-bold">
              <Head>
                {clinicalText(language, "Test")}
              </Head>

              <Head>
                {clinicalText(language, "Result")}
              </Head>

              <Head>
                {clinicalText(language, "Units")}
              </Head>

              <Head>
                {clinicalText(language, "Reference Range")}
              </Head>

              <Head>
                {clinicalText(language, "Flag")}
              </Head>
            </tr>
          </thead>

          <tbody>
            {(report.results ??
              []).map(
              (
                result
              ) => (
                <tr
                  key={
                    result.id
                  }
                  className="border-b border-[#D9DFDB] text-[10px]"
                >
                  <td className="px-2 py-1.5 font-semibold">
                    {result.test_name}
                  </td>

                  <td className={`px-2 py-1.5 ${flagDisplayClass(
                    result.flag
                  )}`}>
                    {result.result_value}
                  </td>

                  <td className="px-2 py-1.5">
                    {result.units ||
                      "—"}
                  </td>

                  <td className="px-2 py-1.5">
                    {result.reference_range ||
                      [
                        result.reference_low,
                        result.reference_high,
                      ]
                        .filter(
                          (
                            value
                          ) =>
                            value !==
                            null
                        )
                        .join(
                          " - "
                        ) ||
                      "—"}
                  </td>

                  <td className={`px-2 py-1.5 ${flagDisplayClass(
                    result.flag
                  )}`}>
                    {clinicalText(
                      language,
                      result.flag
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>


      {report.notes && (
        <div className="border-t border-[#D9DFDB] p-3">
          <p className="text-[9px] font-bold uppercase text-[#718078]">
            {clinicalText(language, "Notes")}
          </p>

          <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5">
            {report.notes}
          </p>
        </div>
      )}
    </ModalShell>
  );
}


function RadiologyViewModal({
  report,
  onClose,
}: {
  report:
    RadiologyReport;

  onClose:
    () => void;
}) {
  const { language } = useLanguage();

  return (
    <ModalShell
      title={
        report.study_name
      }
      residentName={
        report.resident_name
      }
      onClose={
        onClose
      }
      footer={
        <button
          type="button"
          onClick={
            onClose
          }
          className="h-8 border border-[#8D9C94] bg-white px-4 text-[10px] font-bold"
        >
          {clinicalText(language, "Close")}
        </button>
      }
    >
      <SectionBar>
        {clinicalText(language, "Radiology Report")}
      </SectionBar>

      <div className="grid gap-px bg-[#D9DFDB] sm:grid-cols-4">
        <Detail
          label={clinicalText(language, "Status")}
          value={
            clinicalText(
              language,
              report.report_status
            )
          }
        />

        <Detail
          label={clinicalText(language, "Body Site")}
          value={
            report.body_site
          }
        />

        <Detail
          label={clinicalText(language, "Study Date")}
          value={
            formatDateTime(
              report.study_at
            ,
            language)
          }
        />

        <Detail
          label={clinicalText(language, "Radiologist")}
          value={
            report.radiologist
          }
        />
      </div>


      <SectionBar>
        {clinicalText(language, "Findings")}
      </SectionBar>

      <div className="p-3 whitespace-pre-wrap text-[10px] leading-5">
        {report.findings ||
          clinicalText(
            language,
            "No findings recorded."
          )}
      </div>


      <SectionBar>
        {clinicalText(language, "Impression")}
      </SectionBar>

      <div className="p-3 whitespace-pre-wrap text-[10px] leading-5">
        {report.impression ||
          clinicalText(
            language,
            "No impression recorded."
          )}
      </div>
    </ModalShell>
  );
}


function TrendingModal({
  reports,
  onClose,
}: {
  reports:
    LabReport[];

  onClose:
    () => void;
}) {
  const { language } = useLanguage();

  const testNames =
    useMemo(
      () =>
        Array.from(
          new Set(
            reports.flatMap(
              (
                report
              ) =>
                (
                  report.results ??
                  []
                ).map(
                  (
                    result
                  ) =>
                    result.test_name
                )
            )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b
            )
        ),
      [
        reports,
      ]
    );


  const [
    selected,
    setSelected,
  ] = useState(
    testNames[0] ??
      ""
  );


  useEffect(() => {
    if (
      !selected &&
      testNames[0]
    ) {
      setSelected(
        testNames[0]
      );
    }
  }, [
    selected,
    testNames,
  ]);


  const points =
    useMemo(() => {
      if (!selected) {
        return [];
      }

      return reports
        .flatMap(
          (
            report
          ) =>
            (
              report.results ??
              []
            )
              .filter(
                (
                  result
                ) =>
                  result.test_name ===
                  selected
              )
              .map(
                (
                  result
                ) => ({
                  date:
                    report.collection_at,

                  result,
                })
              )
        )
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              a.date ??
                0
            ).getTime() -
            new Date(
              b.date ??
                0
            ).getTime()
        );
    }, [
      reports,
      selected,
    ]);


  return (
    <ModalShell
      title={clinicalText(language, "Laboratory Trending")}
      residentName=""
      onClose={
        onClose
      }
      footer={
        <button
          type="button"
          onClick={
            onClose
          }
          className="h-8 border border-[#8D9C94] bg-white px-4 text-[10px] font-bold"
        >
          {clinicalText(language, "Close")}
        </button>
      }
    >
      <div className="p-3">
        <Select
          label={clinicalText(language, "Analyte")}
          value={
            selected
          }
          onChange={
            setSelected
          }
          options={
            testNames.map(
              (
                name
              ) => ({
                value:
                  name,

                label:
                  name,
              })
            )
          }
        />


        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-[#E6ECE8] text-[9px] font-bold">
                <Head>
                  {clinicalText(language, "Collection Date")}
                </Head>

                <Head>
                  {clinicalText(language, "Result")}
                </Head>

                <Head>
                  {clinicalText(language, "Units")}
                </Head>

                <Head>
                  {clinicalText(language, "Reference")}
                </Head>

                <Head>
                  {clinicalText(language, "Flag")}
                </Head>
              </tr>
            </thead>

            <tbody>
              {points.map(
                (
                  point,
                  index
                ) => (
                  <tr
                    key={`${point.result.id}-${index}`}
                    className="border-b border-[#D9DFDB] text-[10px]"
                  >
                    <td className="px-2 py-1.5">
                      {formatDateTime(
                        point.date
                      ,
            language)}
                    </td>

                    <td className={`px-2 py-1.5 ${flagDisplayClass(
                      point.result
                        .flag
                    )}`}>
                      {point.result
                        .result_value}
                    </td>

                    <td className="px-2 py-1.5">
                      {point.result
                        .units ||
                        "—"}
                    </td>

                    <td className="px-2 py-1.5">
                      {point.result
                        .reference_range ||
                        "—"}
                    </td>

                    <td className={`px-2 py-1.5 ${flagDisplayClass(
                      point.result
                        .flag
                    )}`}>
                      {clinicalText(
                        language,
                        point.result.flag
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalShell>
  );
}


function ReportFlagIcon({
  flag,
}: {
  flag: LabFlag;
}) {
  if (
    flag ===
      "Critical" ||
    flag === "LL" ||
    flag === "HH"
  ) {
    return (
      <CircleAlert
        size={14}
        className="inline text-red-700"
      />
    );
  }

  if (
    flag === "L" ||
    flag === "H" ||
    flag ===
      "Abnormal"
  ) {
    return (
      <AlertCircle
        size={14}
        className="inline text-amber-600"
      />
    );
  }

  return null;
}


function ModalShell({
  title,
  residentName,
  children,
  footer,
  onClose,
  saving = false,
}: {
  title: string;

  residentName: string;

  children:
    React.ReactNode;

  footer:
    React.ReactNode;

  onClose:
    () => void;

  saving?: boolean;
}) {
  const { language } = useLanguage();

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 p-2 sm:p-4"
      onMouseDown={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="flex max-h-[95vh] w-full max-w-[1250px] flex-col overflow-hidden border border-[#9DABA3] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between bg-[#073B2F] px-3 py-2 text-white">
          <div>
            {residentName && (
              <p className="text-[9px] font-semibold uppercase text-[#C8D8D0]">
                {clinicalText(
                  language,
                  "Resident"
                )}:{" "}
                {residentName}
              </p>
            )}

            <h2 className="text-[14px] font-bold">
              {title}
            </h2>
          </div>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="flex h-7 w-7 items-center justify-center border border-white/25"
          >
            <X size={13} />
          </button>
        </header>


        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>


        <footer className="flex justify-center gap-1.5 border-t border-[#BEC8C2] bg-[#F3F2ED] px-3 py-2">
          {footer}
        </footer>
      </div>
    </div>
  );
}


function SectionBar({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="border-y border-[#819371] bg-[#91A47E] px-2 py-1 text-[11px] font-bold text-white">
      {children}
    </div>
  );
}


function Head({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="border-r border-[#BFC8C3] px-2 py-1 text-left last:border-r-0">
      {children}
    </th>
  );
}


function Input({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;

  onChange:
    (
      value: string
    ) => void;

  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold text-[#34483F]">
        {label}

        {required && (
          <span className="ml-0.5 text-red-600">
            *
          </span>
        )}
      </span>

      <input
        value={
          value
        }
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
        className="h-8 w-full border border-[#B8C3BD] px-2 text-[10px] outline-none"
      />
    </label>
  );
}


function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;

  options: {
    value: string;
    label: string;
  }[];

  onChange:
    (
      value: string
    ) => void;
}) {
  const { language } = useLanguage();

  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold text-[#34483F]">
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="h-8 w-full border border-[#B8C3BD] bg-white px-2 text-[10px] outline-none"
      >
        {options.map(
          (
            option
          ) => (
            <option
              key={
                option.value ||
                "__empty"
              }
              value={
                option.value
              }
            >
              {clinicalText(
                language,
                option.label
              )}
            </option>
          )
        )}
      </select>
    </label>
  );
}


function DateTimePair({
  label,
  date,
  time,
  onDate,
  onTime,
}: {
  label: string;
  date: string;
  time: string;

  onDate:
    (
      value: string
    ) => void;

  onTime:
    (
      value: string
    ) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold text-[#34483F]">
        {label}
      </p>

      <div className="grid grid-cols-[1fr_100px] gap-1">
        <input
          type="date"
          value={
            date
          }
          onChange={(
            event
          ) =>
            onDate(
              event.target
                .value
            )
          }
          className="h-8 border border-[#B8C3BD] px-2 text-[10px]"
        />

        <input
          type="time"
          value={
            time
          }
          onChange={(
            event
          ) =>
            onTime(
              event.target
                .value
            )
          }
          className="h-8 border border-[#B8C3BD] px-2 text-[10px]"
        />
      </div>
    </div>
  );
}


function CellInput({
  value,
  onChange,
}: {
  value: string;

  onChange:
    (
      value: string
    ) => void;
}) {
  return (
    <td className="border-r border-[#D9DFDB] p-1">
      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="h-7 w-full border border-[#B7C1BC] px-1.5 text-[9px] outline-none"
      />
    </td>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;

  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div className="bg-white p-3">
      <p className="text-[9px] font-bold uppercase text-[#718078]">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-[#33483F]">
        {cleanText(
          value
        ) ||
          "—"}
      </p>
    </div>
  );
}
