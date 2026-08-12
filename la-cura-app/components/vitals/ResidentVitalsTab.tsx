"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  BarChart3,
  Eye,
  LoaderCircle,
  Plus,
  RefreshCw,
  Scale,
  X,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase/client";


type RawVital = Record<
  string,
  unknown
>;


type NormalizedVital = {
  id: string;

  recordedAt: string;

  bloodPressure: string;
  systolic: number | null;
  diastolic: number | null;

  temperature: string;
  pulse: string;
  respirations: string;
  oxygen: string;

  weight: string;
  weightNumeric: number | null;

  glucose: string;
  pain: string;

  position: string;
  method: string;

  recordedBy: string;

  raw: RawVital;
};


type TrendMetric =
  | "Weight"
  | "Systolic BP"
  | "Diastolic BP"
  | "Temperature"
  | "Pulse"
  | "Respirations"
  | "Oxygen Saturation"
  | "Glucose";


type Props = {
  residentId: number;
  residentName: string;
};


function cleanText(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(
      value
    ).trim();
  }

  return "";
}


function firstText(
  row: RawVital,
  keys: string[]
) {
  for (
    const key of keys
  ) {
    const value =
      cleanText(
        row[key]
      );

    if (value) {
      return value;
    }
  }

  return "";
}


function numericFromText(
  value: string
): number | null {
  const match =
    value.match(
      /-?\d+(?:\.\d+)?/
    );

  if (!match) {
    return null;
  }

  const number =
    Number(
      match[0]
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}


function firstNumber(
  row: RawVital,
  keys: string[]
): number | null {
  for (
    const key of keys
  ) {
    const text =
      cleanText(
        row[key]
      );

    if (!text) {
      continue;
    }

    const number =
      numericFromText(
        text
      );

    if (
      number !== null
    ) {
      return number;
    }
  }

  return null;
}


function normalizeVital(
  row: RawVital,
  index: number
): NormalizedVital {
  let systolic =
    firstNumber(
      row,
      [
        "systolic",
        "bp_systolic",
        "blood_pressure_systolic",
        "systolic_bp",
      ]
    );

  let diastolic =
    firstNumber(
      row,
      [
        "diastolic",
        "bp_diastolic",
        "blood_pressure_diastolic",
        "diastolic_bp",
      ]
    );


  let bloodPressure =
    firstText(
      row,
      [
        "blood_pressure",
        "bp",
        "blood_pressure_value",
      ]
    );


  if (
    !bloodPressure &&
    systolic !== null &&
    diastolic !== null
  ) {
    bloodPressure =
      `${systolic}/${diastolic}`;
  }


  if (
    bloodPressure &&
    (
      systolic === null ||
      diastolic === null
    )
  ) {
    const match =
      bloodPressure.match(
        /(\d+)\s*\/\s*(\d+)/
      );

    if (match) {
      systolic =
        Number(
          match[1]
        );

      diastolic =
        Number(
          match[2]
        );
    }
  }


  const recordedAt =
    firstText(
      row,
      [
        "recorded_at",
        "taken_at",
        "measured_at",
        "date_recorded",
        "created_at",
      ]
    );


  const weight =
    firstText(
      row,
      [
        "weight",
        "weight_lbs",
        "weight_lb",
        "body_weight",
      ]
    );


  return {
    id:
      firstText(
        row,
        ["id"]
      ) ||
      `${recordedAt}-${index}`,

    recordedAt,

    bloodPressure,
    systolic,
    diastolic,

    temperature:
      firstText(
        row,
        [
          "temperature",
          "temp",
          "body_temperature",
        ]
      ),

    pulse:
      firstText(
        row,
        [
          "pulse",
          "heart_rate",
          "hr",
        ]
      ),

    respirations:
      firstText(
        row,
        [
          "respirations",
          "respiratory_rate",
          "resp_rate",
          "rr",
        ]
      ),

    oxygen:
      firstText(
        row,
        [
          "oxygen_saturation",
          "o2_saturation",
          "spo2",
          "oxygen",
          "o2",
        ]
      ),

    weight,

    weightNumeric:
      firstNumber(
        row,
        [
          "weight",
          "weight_lbs",
          "weight_lb",
          "body_weight",
        ]
      ),

    glucose:
      firstText(
        row,
        [
          "blood_glucose",
          "glucose",
          "blood_sugar",
          "bs",
        ]
      ),

    pain:
      firstText(
        row,
        [
          "pain_level",
          "pain",
          "pain_score",
        ]
      ),

    position:
      firstText(
        row,
        [
          "position",
          "body_position",
        ]
      ),

    method:
      firstText(
        row,
        [
          "method",
          "measurement_method",
          "route",
        ]
      ),

    recordedBy:
      firstText(
        row,
        [
          "recorded_by",
          "staff_name",
          "created_by",
          "entered_by",
        ]
      ),

    raw: row,
  };
}


function formatDateTime(
  value: string
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
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function dateRangeStart(
  range: string
) {
  if (
    range === "All"
  ) {
    return null;
  }

  const days =
    Number(range);

  const date =
    new Date();

  date.setDate(
    date.getDate() -
      days
  );

  return date;
}


function metricValue(
  vital:
    NormalizedVital,
  metric:
    TrendMetric
): number | null {
  switch (metric) {
    case "Weight":
      return vital.weightNumeric;

    case "Systolic BP":
      return vital.systolic;

    case "Diastolic BP":
      return vital.diastolic;

    case "Temperature":
      return numericFromText(
        vital.temperature
      );

    case "Pulse":
      return numericFromText(
        vital.pulse
      );

    case "Respirations":
      return numericFromText(
        vital.respirations
      );

    case "Oxygen Saturation":
      return numericFromText(
        vital.oxygen
      );

    case "Glucose":
      return numericFromText(
        vital.glucose
      );

    default:
      return null;
  }
}


function errorMessage(
  value: unknown
) {
  if (
    value instanceof Error
  ) {
    return value.message;
  }

  if (
    value &&
    typeof value === "object"
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
      "Resident vitals could not be loaded."
    );
  }

  return "Resident vitals could not be loaded.";
}


export default function ResidentVitalsTab({
  residentId,
  residentName,
}: Props) {
  const [
    vitals,
    setVitals,
  ] = useState<
    NormalizedVital[]
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
    section,
    setSection,
  ] = useState<
    "Vitals" | "Weights"
  >("Vitals");

  const [
    range,
    setRange,
  ] = useState("30");

  const [
    viewing,
    setViewing,
  ] =
    useState<NormalizedVital | null>(
      null
    );

  const [
    trending,
    setTrending,
  ] = useState(false);


  const loadVitals =
    useCallback(
      async (
        quiet = false
      ) => {
        quiet
          ? setRefreshing(true)
          : setLoading(true);

        setError("");


        try {
          const {
            data,
            error:
              loadError,
          } =
            await supabase
              .from(
                "vital_signs"
              )
              .select("*")
              .eq(
                "resident_id",
                residentId
              )
              .order(
                "recorded_at",
                {
                  ascending:
                    false,
                }
              );


          if (
            loadError
          ) {
            throw loadError;
          }


          setVitals(
            (
              data ??
              []
            ).map(
              (
                row,
                index
              ) =>
                normalizeVital(
                  row as RawVital,
                  index
                )
            )
          );
        } catch (
          caughtError
        ) {
          console.error(
            "Unable to load resident vitals:",
            caughtError
          );

          setError(
            errorMessage(
              caughtError
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
    void loadVitals();
  }, [
    loadVitals,
  ]);


  const filtered =
    useMemo(() => {
      const start =
        dateRangeStart(
          range
        );


      return vitals.filter(
        (
          vital
        ) => {
          if (
            start &&
            vital.recordedAt
          ) {
            const date =
              new Date(
                vital.recordedAt
              );

            if (
              !Number.isNaN(
                date.getTime()
              ) &&
              date < start
            ) {
              return false;
            }
          }


          if (
            section ===
            "Weights"
          ) {
            return (
              vital.weightNumeric !==
              null
            );
          }


          return true;
        }
      );
    }, [
      vitals,
      range,
      section,
    ]);


  const latest =
    vitals[0] ??
    null;


  const latestWeight =
    vitals.find(
      (
        vital
      ) =>
        vital.weightNumeric !==
        null
    ) ??
    null;


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
        <div className="border-b border-[#70825D] bg-[#8FA47A] px-2 py-1 text-[11px] font-bold text-white">
          Weights / Vitals
        </div>


        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BCC8C1] bg-[#F1F2ED] px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/add-vitals?residentId=${residentId}`}
              className="inline-flex h-7 items-center gap-1 border border-[#687B5B] bg-white px-2.5 text-[10px] font-bold text-[#283D33]"
            >
              <Plus
                size={11}
              />

              New Vital Entry
            </Link>


            <button
              type="button"
              onClick={() =>
                setTrending(
                  true
                )
              }
              className="inline-flex h-7 items-center gap-1 border border-[#687B5B] bg-white px-2.5 text-[10px] font-bold text-[#283D33]"
            >
              <BarChart3
                size={11}
              />

              Trending
            </button>


            <button
              type="button"
              onClick={() =>
                setSection(
                  "Vitals"
                )
              }
              className={`
                h-7 border px-2.5 text-[10px] font-bold

                ${
                  section ===
                  "Vitals"
                    ? "border-[#073B2F] bg-[#073B2F] text-white"
                    : "border-[#AAB7AF] bg-white text-[#33483F]"
                }
              `}
            >
              Vitals
            </button>


            <button
              type="button"
              onClick={() =>
                setSection(
                  "Weights"
                )
              }
              className={`
                h-7 border px-2.5 text-[10px] font-bold

                ${
                  section ===
                  "Weights"
                    ? "border-[#073B2F] bg-[#073B2F] text-white"
                    : "border-[#AAB7AF] bg-white text-[#33483F]"
                }
              `}
            >
              Weights
            </button>


            <select
              value={
                range
              }
              onChange={(
                event
              ) =>
                setRange(
                  event.target
                    .value
                )
              }
              className="h-7 border border-[#AAB7AF] bg-white px-2 text-[10px]"
            >
              <option value="7">
                Last 7 Days
              </option>

              <option value="30">
                Last 30 Days
              </option>

              <option value="90">
                Last 90 Days
              </option>

              <option value="365">
                Last 12 Months
              </option>

              <option value="All">
                All Records
              </option>
            </select>
          </div>


          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              void loadVitals(
                true
              )
            }
            className="inline-flex h-7 items-center gap-1 border border-[#687B5B] bg-white px-2.5 text-[10px] font-bold text-[#283D33] disabled:opacity-50"
          >
            <RefreshCw
              size={10}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>


        <div className="grid border-b border-[#D4DDD8] bg-[#FAFAF7] sm:grid-cols-4">
          <Summary
            label="Latest BP"
            value={
              latest
                ?.bloodPressure ||
              "—"
            }
          />

          <Summary
            label="Latest Pulse"
            value={
              latest
                ?.pulse ||
              "—"
            }
          />

          <Summary
            label="Latest O₂ Sat"
            value={
              latest
                ?.oxygen ||
              "—"
            }
          />

          <Summary
            label="Latest Weight"
            value={
              latestWeight
                ?.weight ||
              "—"
            }
          />
        </div>


        {error && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}


        {section ===
        "Vitals" ? (
          <VitalsTable
            vitals={
              filtered
            }
            onView={
              setViewing
            }
          />
        ) : (
          <WeightsTable
            vitals={
              filtered
            }
            onView={
              setViewing
            }
          />
        )}
      </div>


      {viewing && (
        <VitalDetailModal
          vital={
            viewing
          }
          residentName={
            residentName
          }
          onClose={() =>
            setViewing(
              null
            )
          }
        />
      )}


      {trending && (
        <VitalsTrendingModal
          vitals={
            vitals
          }
          residentName={
            residentName
          }
          onClose={() =>
            setTrending(
              false
            )
          }
        />
      )}
    </>
  );
}


function VitalsTable({
  vitals,
  onView,
}: {
  vitals:
    NormalizedVital[];

  onView: (
    vital:
      NormalizedVital
  ) => void;
}) {
  if (
    vitals.length === 0
  ) {
    return (
      <div className="px-6 py-12 text-center">
        <Activity
          size={20}
          className="mx-auto text-[#829088]"
        />

        <p className="mt-2 text-[11px] font-semibold text-[#465A50]">
          No vital-sign records match this date range.
        </p>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px] border-collapse">
        <thead>
          <tr className="bg-[#E5EEF4] text-[9px] font-bold text-[#263A31]">
            <Head>
              Actions
            </Head>

            <Head>
              Recorded Date / Time
            </Head>

            <Head>
              Blood Pressure
            </Head>

            <Head>
              Temperature
            </Head>

            <Head>
              Pulse
            </Head>

            <Head>
              Respirations
            </Head>

            <Head>
              O₂ Saturation
            </Head>

            <Head>
              Weight
            </Head>

            <Head>
              Glucose
            </Head>

            <Head>
              Pain
            </Head>

            <Head>
              Position / Method
            </Head>

            <Head>
              Recorded By
            </Head>
          </tr>
        </thead>


        <tbody>
          {vitals.map(
            (
              vital,
              index
            ) => (
              <tr
                key={
                  vital.id
                }
                className={`
                  border-b border-[#D7DEDA]
                  text-[10px]

                  ${
                    index %
                      2 ===
                    0
                      ? "bg-white"
                      : "bg-[#FAFAF7]"
                  }
                `}
              >
                <td className="w-[78px] border-r border-[#D7DEDA] px-1 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      onView(
                        vital
                      )
                    }
                    className="inline-flex h-6 items-center gap-1 border border-[#AEB8B3] bg-white px-2 text-[9px] font-semibold text-[#175D86]"
                  >
                    <Eye
                      size={9}
                    />

                    View
                  </button>
                </td>


                <Cell>
                  {formatDateTime(
                    vital.recordedAt
                  )}
                </Cell>

                <Cell strong>
                  {vital.bloodPressure ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.temperature ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.pulse ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.respirations ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.oxygen ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.weight ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.glucose ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.pain ||
                    "—"}
                </Cell>

                <Cell>
                  {[
                    vital.position,
                    vital.method,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " • "
                    ) ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.recordedBy ||
                    "—"}
                </Cell>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function WeightsTable({
  vitals,
  onView,
}: {
  vitals:
    NormalizedVital[];

  onView: (
    vital:
      NormalizedVital
  ) => void;
}) {
  if (
    vitals.length === 0
  ) {
    return (
      <div className="px-6 py-12 text-center">
        <Scale
          size={20}
          className="mx-auto text-[#829088]"
        />

        <p className="mt-2 text-[11px] font-semibold text-[#465A50]">
          No weight records match this date range.
        </p>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="bg-[#E5EEF4] text-[9px] font-bold text-[#263A31]">
            <Head>
              Actions
            </Head>

            <Head>
              Date / Time
            </Head>

            <Head>
              Weight
            </Head>

            <Head>
              Position
            </Head>

            <Head>
              Method
            </Head>

            <Head>
              Recorded By
            </Head>
          </tr>
        </thead>


        <tbody>
          {vitals.map(
            (
              vital,
              index
            ) => (
              <tr
                key={
                  vital.id
                }
                className={`
                  border-b border-[#D7DEDA]
                  text-[10px]

                  ${
                    index %
                      2 ===
                    0
                      ? "bg-white"
                      : "bg-[#FAFAF7]"
                  }
                `}
              >
                <td className="w-[78px] border-r border-[#D7DEDA] px-1 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      onView(
                        vital
                      )
                    }
                    className="inline-flex h-6 items-center gap-1 border border-[#AEB8B3] bg-white px-2 text-[9px] font-semibold text-[#175D86]"
                  >
                    <Eye
                      size={9}
                    />

                    View
                  </button>
                </td>

                <Cell>
                  {formatDateTime(
                    vital.recordedAt
                  )}
                </Cell>

                <Cell strong>
                  {vital.weight}
                </Cell>

                <Cell>
                  {vital.position ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.method ||
                    "—"}
                </Cell>

                <Cell>
                  {vital.recordedBy ||
                    "—"}
                </Cell>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function VitalDetailModal({
  vital,
  residentName,
  onClose,
}: {
  vital:
    NormalizedVital;

  residentName:
    string;

  onClose:
    () => void;
}) {
  const standardKeys =
    new Set([
      "id",
      "resident_id",
      "recorded_at",
      "created_at",

      "blood_pressure",
      "bp",
      "systolic",
      "diastolic",
      "bp_systolic",
      "bp_diastolic",

      "temperature",
      "temp",

      "pulse",
      "heart_rate",

      "respirations",
      "respiratory_rate",

      "oxygen_saturation",
      "o2_saturation",
      "spo2",

      "weight",
      "weight_lbs",

      "glucose",
      "blood_glucose",

      "pain",
      "pain_level",

      "position",
      "method",

      "recorded_by",
      "created_by",
    ]);


  const additional =
    Object.entries(
      vital.raw
    ).filter(
      ([
        key,
        value,
      ]) =>
        !standardKeys.has(
          key
        ) &&
        cleanText(
          value
        )
    );


  return (
    <ModalShell
      title="Vital Sign Details"
      residentName={
        residentName
      }
      onClose={
        onClose
      }
    >
      <div className="grid gap-px bg-[#D8DFDB] sm:grid-cols-3">
        <Detail
          label="Recorded"
          value={
            formatDateTime(
              vital.recordedAt
            )
          }
        />

        <Detail
          label="Blood Pressure"
          value={
            vital.bloodPressure
          }
        />

        <Detail
          label="Temperature"
          value={
            vital.temperature
          }
        />

        <Detail
          label="Pulse"
          value={
            vital.pulse
          }
        />

        <Detail
          label="Respirations"
          value={
            vital.respirations
          }
        />

        <Detail
          label="O₂ Saturation"
          value={
            vital.oxygen
          }
        />

        <Detail
          label="Weight"
          value={
            vital.weight
          }
        />

        <Detail
          label="Glucose"
          value={
            vital.glucose
          }
        />

        <Detail
          label="Pain"
          value={
            vital.pain
          }
        />

        <Detail
          label="Position"
          value={
            vital.position
          }
        />

        <Detail
          label="Method"
          value={
            vital.method
          }
        />

        <Detail
          label="Recorded By"
          value={
            vital.recordedBy
          }
        />
      </div>


      {additional.length >
        0 && (
        <>
          <div className="border-y border-[#819371] bg-[#91A47E] px-2 py-1 text-[10px] font-bold text-white">
            Additional Recorded Data
          </div>

          <div className="grid gap-px bg-[#D8DFDB] sm:grid-cols-3">
            {additional.map(
              ([
                key,
                value,
              ]) => (
                <Detail
                  key={
                    key
                  }
                  label={key
                    .replace(
                      /_/g,
                      " "
                    )
                    .replace(
                      /\b\w/g,
                      (
                        letter
                      ) =>
                        letter.toUpperCase()
                    )}
                  value={
                    cleanText(
                      value
                    )
                  }
                />
              )
            )}
          </div>
        </>
      )}
    </ModalShell>
  );
}


function VitalsTrendingModal({
  vitals,
  residentName,
  onClose,
}: {
  vitals:
    NormalizedVital[];

  residentName:
    string;

  onClose:
    () => void;
}) {
  const metrics:
    TrendMetric[] = [
      "Weight",
      "Systolic BP",
      "Diastolic BP",
      "Temperature",
      "Pulse",
      "Respirations",
      "Oxygen Saturation",
      "Glucose",
    ];


  const [
    metric,
    setMetric,
  ] =
    useState<TrendMetric>(
      "Weight"
    );


  const points =
    useMemo(() => {
      return vitals
        .map(
          (
            vital
          ) => ({
            date:
              vital.recordedAt,

            value:
              metricValue(
                vital,
                metric
              ),
          })
        )
        .filter(
          (
            point
          ): point is {
            date: string;
            value: number;
          } =>
            point.value !==
              null &&
            Boolean(
              point.date
            )
        )
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              a.date
            ).getTime() -
            new Date(
              b.date
            ).getTime()
        );
    }, [
      vitals,
      metric,
    ]);


  const values =
    points.map(
      (
        point
      ) =>
        point.value
    );


  const latest =
    values.length
      ? values[
          values.length -
          1
        ]
      : null;

  const minimum =
    values.length
      ? Math.min(
          ...values
        )
      : null;

  const maximum =
    values.length
      ? Math.max(
          ...values
        )
      : null;


  return (
    <ModalShell
      title="Vitals Trending"
      residentName={
        residentName
      }
      onClose={
        onClose
      }
      wide
    >
      <div className="p-3">
        <label className="block max-w-xs">
          <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
            Trend
          </span>

          <select
            value={
              metric
            }
            onChange={(
              event
            ) =>
              setMetric(
                event.target
                  .value as
                  TrendMetric
              )
            }
            className="h-8 w-full border border-[#B8C3BD] bg-white px-2 text-[10px]"
          >
            {metrics.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                >
                  {item}
                </option>
              )
            )}
          </select>
        </label>


        <div className="mt-3 grid border border-[#D7DFDA] bg-[#FAFAF7] sm:grid-cols-3">
          <Summary
            label="Latest"
            value={
              latest !== null
                ? String(
                    latest
                  )
                : "—"
            }
          />

          <Summary
            label="Lowest Recorded"
            value={
              minimum !== null
                ? String(
                    minimum
                  )
                : "—"
            }
          />

          <Summary
            label="Highest Recorded"
            value={
              maximum !== null
                ? String(
                    maximum
                  )
                : "—"
            }
          />
        </div>


        <div className="mt-3">
          <TrendChart
            points={
              points
            }
          />
        </div>


        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-[#E5EEF4] text-[9px] font-bold">
                <Head>
                  Date / Time
                </Head>

                <Head>
                  {metric}
                </Head>
              </tr>
            </thead>

            <tbody>
              {[...points]
                .reverse()
                .map(
                  (
                    point,
                    index
                  ) => (
                    <tr
                      key={`${point.date}-${index}`}
                      className="border-b border-[#D7DEDA] text-[10px]"
                    >
                      <Cell>
                        {formatDateTime(
                          point.date
                        )}
                      </Cell>

                      <Cell strong>
                        {String(
                          point.value
                        )}
                      </Cell>
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


function TrendChart({
  points,
}: {
  points: {
    date: string;
    value: number;
  }[];
}) {
  if (
    points.length <
    2
  ) {
    return (
      <div className="flex h-40 items-center justify-center border border-[#D8DFDB] bg-[#FAFAF7] text-[10px] text-[#74827B]">
        At least two recorded values are needed to display a trend line.
      </div>
    );
  }


  const values =
    points.map(
      (
        point
      ) =>
        point.value
    );


  const min =
    Math.min(
      ...values
    );

  const max =
    Math.max(
      ...values
    );

  const span =
    max - min || 1;


  const width =
    900;

  const height =
    220;

  const padding =
    24;


  const coordinates =
    points.map(
      (
        point,
        index
      ) => {
        const x =
          padding +
          (
            index /
            Math.max(
              1,
              points.length -
                1
            )
          ) *
            (
              width -
              padding * 2
            );

        const y =
          height -
          padding -
          (
            (
              point.value -
              min
            ) /
            span
          ) *
            (
              height -
              padding * 2
            );

        return {
          x,
          y,
        };
      }
    );


  const path =
    coordinates
      .map(
        (
          point,
          index
        ) =>
          `${
            index ===
            0
              ? "M"
              : "L"
          } ${point.x} ${point.y}`
      )
      .join(
        " "
      );


  return (
    <div className="overflow-x-auto border border-[#D8DFDB] bg-white p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] min-w-[700px] w-full"
        role="img"
        aria-label="Vital sign trend"
      >
        <line
          x1={
            padding
          }
          y1={
            height -
            padding
          }
          x2={
            width -
            padding
          }
          y2={
            height -
            padding
          }
          stroke="currentColor"
          className="text-[#D6DED9]"
        />

        <path
          d={
            path
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#073B2F]"
        />

        {coordinates.map(
          (
            point,
            index
          ) => (
            <circle
              key={
                index
              }
              cx={
                point.x
              }
              cy={
                point.y
              }
              r="3"
              fill="currentColor"
              className="text-[#D5A437]"
            />
          )
        )}
      </svg>
    </div>
  );
}


function ModalShell({
  title,
  residentName,
  children,
  onClose,
  wide = false,
}: {
  title: string;

  residentName:
    string;

  children:
    React.ReactNode;

  onClose:
    () => void;

  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 p-3"
      onMouseDown={
        onClose
      }
    >
      <div
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className={`
          max-h-[92vh]
          w-full
          overflow-y-auto
          border
          border-[#A8B5AE]
          bg-white
          shadow-xl

          ${
            wide
              ? "max-w-6xl"
              : "max-w-4xl"
          }
        `}
      >
        <header className="flex items-center justify-between bg-[#073B2F] px-3 py-2 text-white">
          <div>
            <p className="text-[9px] font-semibold uppercase text-[#CAD8D1]">
              Resident:{" "}
              {residentName}
            </p>

            <h2 className="text-[13px] font-bold">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-7 w-7 items-center justify-center border border-white/25"
          >
            <X
              size={13}
            />
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}


function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#D7DFDA] px-3 py-2 last:border-b-0 sm:border-b-0 sm:border-r">
      <p className="text-[9px] font-bold uppercase text-[#68776F]">
        {label}
      </p>

      <p className="mt-0.5 text-[12px] font-bold text-[#263D33]">
        {value}
      </p>
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
    <th className="border-r border-[#BFCAD0] px-2 py-1 text-left last:border-r-0">
      {children}
    </th>
  );
}


function Cell({
  children,
  strong = false,
}: {
  children:
    React.ReactNode;

  strong?: boolean;
}) {
  return (
    <td
      className={`
        whitespace-nowrap
        border-r
        border-[#D7DEDA]
        px-2
        py-1

        ${
          strong
            ? "font-bold text-[#273D33]"
            : ""
        }
      `}
    >
      {children}
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
