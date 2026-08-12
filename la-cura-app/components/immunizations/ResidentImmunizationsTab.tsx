"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Syringe,
  X,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase/client";


type ImmunizationStatus =
  | "Completed"
  | "Due"
  | "Declined"
  | "Contraindicated";


type ImmunizationRecord = {
  id: number;

  resident_id: number;
  resident_name: string;

  vaccine_name: string;

  vaccine_code:
    | string
    | null;

  dose_number:
    | string
    | null;

  dose_amount:
    | string
    | null;

  status:
    ImmunizationStatus;

  administered_at:
    | string
    | null;

  administered_by:
    | string
    | null;

  route:
    | string
    | null;

  site:
    | string
    | null;

  manufacturer:
    | string
    | null;

  lot_number:
    | string
    | null;

  expiration_date:
    | string
    | null;

  due_date:
    | string
    | null;

  vis_date:
    | string
    | null;

  consent_status:
    | string
    | null;

  refusal_reason:
    | string
    | null;

  contraindication_reason:
    | string
    | null;

  source:
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

  created_at:
    | string
    | null;
};


type HistoryRecord = {
  id: number;

  immunization_id: number;

  action: string;

  previous_status:
    | string
    | null;

  new_status:
    | string
    | null;

  changed_by: string;

  changed_at: string;
};


type Props = {
  residentId: number;
  residentName: string;
};


type FormState = {
  vaccineName: string;
  vaccineCode: string;

  doseNumber: string;
  doseAmount: string;

  status:
    ImmunizationStatus;

  administeredDate: string;
  administeredTime: string;

  administeredBy: string;

  route: string;
  site: string;

  manufacturer: string;
  lotNumber: string;
  expirationDate: string;

  dueDate: string;

  visDate: string;

  consentStatus: string;

  refusalReason: string;

  contraindicationReason:
    string;

  source: string;
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


function dateInput(
  date = new Date()
) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    date.getDate()
  ).padStart(
    2,
    "0"
  )}`;
}


function timeInput(
  date = new Date()
) {
  return `${String(
    date.getHours()
  ).padStart(
    2,
    "0"
  )}:${String(
    date.getMinutes()
  ).padStart(
    2,
    "0"
  )}`;
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
      dateInput(date),

    time:
      timeInput(date),
  };
}


function combineDateTime(
  date: string,
  time: string
) {
  if (!date) {
    return "";
  }


  const value =
    new Date(
      `${date}T${
        time || "00:00"
      }`
    );


  return Number.isNaN(
    value.getTime()
  )
    ? ""
    : value.toISOString();
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
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
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
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function emptyForm(): FormState {
  const now =
    new Date();

  return {
    vaccineName: "",
    vaccineCode: "",

    doseNumber: "",
    doseAmount: "",

    status:
      "Completed",

    administeredDate:
      dateInput(now),

    administeredTime:
      timeInput(now),

    administeredBy: "",

    route: "",
    site: "",

    manufacturer: "",
    lotNumber: "",
    expirationDate: "",

    dueDate: "",

    visDate: "",

    consentStatus:
      "Unknown",

    refusalReason: "",

    contraindicationReason:
      "",

    source: "",
    notes: "",
  };
}


function statusClass(
  status:
    ImmunizationStatus
) {
  switch (status) {
    case "Due":
      return "font-bold text-amber-700";

    case "Declined":
      return "font-bold text-red-700";

    case "Contraindicated":
      return "font-bold text-red-800";

    default:
      return "font-bold text-[#1D6550]";
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
      "The immunization record could not be saved."
    );
  }


  return "The immunization record could not be saved.";
}


export default function ResidentImmunizationsTab({
  residentId,
  residentName,
}: Props) {
  const [
    records,
    setRecords,
  ] = useState<
    ImmunizationRecord[]
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
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<ImmunizationRecord | null>(
      null
    );

  const [
    presetStatus,
    setPresetStatus,
  ] =
    useState<ImmunizationStatus | null>(
      null
    );

  const [
    viewing,
    setViewing,
  ] =
    useState<ImmunizationRecord | null>(
      null
    );

  const [
    historyRecord,
    setHistoryRecord,
  ] =
    useState<ImmunizationRecord | null>(
      null
    );

  const [
    history,
    setHistory,
  ] = useState<
    HistoryRecord[]
  >([]);

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);


  const loadRecords =
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
                "resident_immunizations"
              )
              .select("*")
              .eq(
                "resident_id",
                residentId
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              );


          if (loadError) {
            throw loadError;
          }


          setRecords(
            (data ??
              []) as ImmunizationRecord[]
          );
        } catch (
          caughtError
        ) {
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
    void loadRecords();
  }, [
    loadRecords,
  ]);


  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      return records.filter(
        (
          record
        ) => {
          const statusMatches =
            statusFilter ===
              "All" ||
            record.status ===
              statusFilter;


          const queryMatches =
            !query ||
            [
              record.vaccine_name,
              record.vaccine_code,
              record.manufacturer,
              record.lot_number,
              record.route,
              record.site,
              record.administered_by,
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
            );


          return (
            statusMatches &&
            queryMatches
          );
        }
      );
    }, [
      records,
      statusFilter,
      search,
    ]);


  const completedCount =
    records.filter(
      (
        record
      ) =>
        record.status ===
        "Completed"
    ).length;


  const dueCount =
    records.filter(
      (
        record
      ) =>
        record.status ===
        "Due"
    ).length;


  const declinedCount =
    records.filter(
      (
        record
      ) =>
        record.status ===
          "Declined" ||
        record.status ===
          "Contraindicated"
    ).length;


  function openNew() {
    setEditing(null);
    setPresetStatus(
      null
    );
    setFormOpen(true);
  }


  function openEdit(
    record:
      ImmunizationRecord,
    status:
      ImmunizationStatus | null =
      null
  ) {
    setEditing(record);
    setPresetStatus(
      status
    );
    setFormOpen(true);
  }


  async function openHistory(
    record:
      ImmunizationRecord
  ) {
    setHistoryRecord(
      record
    );

    setHistory([]);
    setHistoryLoading(
      true
    );


    const {
      data,
      error:
        historyError,
    } =
      await supabase
        .from(
          "resident_immunization_history"
        )
        .select("*")
        .eq(
          "immunization_id",
          record.id
        )
        .order(
          "changed_at",
          {
            ascending:
              false,
          }
        );


    if (!historyError) {
      setHistory(
        (data ??
          []) as HistoryRecord[]
      );
    }


    setHistoryLoading(
      false
    );
  }


  function action(
    record:
      ImmunizationRecord,
    value: string
  ) {
    if (
      value === "view"
    ) {
      setViewing(
        record
      );
    }


    if (
      value === "edit"
    ) {
      openEdit(
        record
      );
    }


    if (
      value ===
      "administer"
    ) {
      openEdit(
        record,
        "Completed"
      );
    }


    if (
      value === "due"
    ) {
      openEdit(
        record,
        "Due"
      );
    }


    if (
      value ===
      "decline"
    ) {
      openEdit(
        record,
        "Declined"
      );
    }


    if (
      value ===
      "contraindicated"
    ) {
      openEdit(
        record,
        "Contraindicated"
      );
    }


    if (
      value ===
      "history"
    ) {
      void openHistory(
        record
      );
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center bg-white">
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
        <div className="border-b border-[#71845E] bg-[#8FA47A] px-2 py-1 text-[11px] font-bold text-white">
          Immunizations
        </div>


        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BCC8C1] bg-[#F1F2ED] px-2 py-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={
                openNew
              }
              className="inline-flex h-7 items-center gap-1 border border-[#687B5B] bg-white px-2.5 text-[10px] font-bold text-[#283D33]"
            >
              <Plus
                size={11}
              />

              New Immunization
            </button>


            <div className="relative min-w-[220px] flex-1 sm:max-w-[420px]">
              <Search
                size={11}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[#65766E]"
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
                placeholder="Search immunizations..."
                className="h-7 w-full border border-[#B7C2BC] bg-white pl-7 pr-2 text-[10px] outline-none"
              />
            </div>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className="h-7 border border-[#B7C2BC] bg-white px-2 text-[10px]"
            >
              <option>
                All
              </option>

              <option>
                Completed
              </option>

              <option>
                Due
              </option>

              <option>
                Declined
              </option>

              <option>
                Contraindicated
              </option>
            </select>
          </div>


          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              void loadRecords(
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


        <div className="grid border-b border-[#D4DDD8] bg-[#FAFAF7] sm:grid-cols-3">
          <Summary
            label="Completed"
            value={
              completedCount
            }
          />

          <Summary
            label="Due"
            value={
              dueCount
            }
            warning={
              dueCount > 0
            }
          />

          <Summary
            label="Declined / Contraindicated"
            value={
              declinedCount
            }
          />
        </div>


        {error && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}


        {filtered.length >
        0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px] border-collapse">
              <thead>
                <tr className="bg-[#E5EEF4] text-[9px] font-bold text-[#263A31]">
                  <Head>
                    Actions
                  </Head>

                  <Head>
                    Vaccine
                  </Head>

                  <Head>
                    Dose
                  </Head>

                  <Head>
                    Status
                  </Head>

                  <Head>
                    Administered
                  </Head>

                  <Head>
                    Due Date
                  </Head>

                  <Head>
                    Route / Site
                  </Head>

                  <Head>
                    Manufacturer
                  </Head>

                  <Head>
                    Lot #
                  </Head>

                  <Head>
                    Recorded By
                  </Head>
                </tr>
              </thead>


              <tbody>
                {filtered.map(
                  (
                    record,
                    index
                  ) => (
                    <tr
                      key={
                        record.id
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
                      <td className="w-[105px] border-r border-[#D7DEDA] px-1 py-1">
                        <select
                          defaultValue=""
                          onChange={(
                            event
                          ) => {
                            action(
                              record,
                              event.target
                                .value
                            );

                            event.target
                              .value =
                              "";
                          }}
                          className="h-6 w-[94px] border border-[#AEB8B3] bg-white px-1 text-[9px] font-semibold text-[#175D86]"
                        >
                          <option value="">
                            Actions
                          </option>

                          <option value="view">
                            View
                          </option>

                          <option value="edit">
                            Edit / Revise
                          </option>

                          {record.status !==
                            "Completed" && (
                            <option value="administer">
                              Record Administration
                            </option>
                          )}

                          {record.status !==
                            "Due" && (
                            <option value="due">
                              Mark Due
                            </option>
                          )}

                          <option value="decline">
                            Record Declined
                          </option>

                          <option value="contraindicated">
                            Record Contraindication
                          </option>

                          <option value="history">
                            History
                          </option>
                        </select>
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <Syringe
                            size={11}
                            className="shrink-0 text-[#49665A]"
                          />

                          <div>
                            <p className="font-bold text-[#263A31]">
                              {record.vaccine_name}
                            </p>

                            {record.vaccine_code && (
                              <p className="text-[8px] text-[#75827B]">
                                Code:{" "}
                                {record.vaccine_code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        {[
                          record.dose_number,
                          record.dose_amount,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " • "
                          ) ||
                          "—"}
                      </td>


                      <td className={`border-r border-[#D7DEDA] px-2 py-1 ${statusClass(
                        record.status
                      )}`}>
                        {record.status}
                      </td>


                      <td className="whitespace-nowrap border-r border-[#D7DEDA] px-2 py-1">
                        {formatDateTime(
                          record.administered_at
                        )}
                      </td>


                      <td className="whitespace-nowrap border-r border-[#D7DEDA] px-2 py-1">
                        {formatDate(
                          record.due_date
                        )}
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        {[
                          record.route,
                          record.site,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " / "
                          ) ||
                          "—"}
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        {record.manufacturer ||
                          "—"}
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        {record.lot_number ||
                          "—"}
                      </td>


                      <td className="px-2 py-1">
                        {record.created_by}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Syringe
              size={20}
              className="mx-auto text-[#7F8E86]"
            />

            <p className="mt-2 text-[11px] font-semibold text-[#465A50]">
              No immunization records match the selected filters.
            </p>
          </div>
        )}
      </div>


      <ImmunizationModal
        open={
          formOpen
        }
        residentId={
          residentId
        }
        residentName={
          residentName
        }
        initialRecord={
          editing
        }
        presetStatus={
          presetStatus
        }
        onClose={() => {
          setFormOpen(
            false
          );

          setEditing(
            null
          );

          setPresetStatus(
            null
          );
        }}
        onSaved={() =>
          void loadRecords(
            true
          )
        }
      />


      {viewing && (
        <InfoModal
          title="Immunization Details"
          onClose={() =>
            setViewing(
              null
            )
          }
        >
          <div className="grid gap-px bg-[#D8DFDB] sm:grid-cols-3">
            <Detail
              label="Vaccine"
              value={
                viewing.vaccine_name
              }
            />

            <Detail
              label="Status"
              value={
                viewing.status
              }
            />

            <Detail
              label="Dose"
              value={
                [
                  viewing.dose_number,
                  viewing.dose_amount,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " • "
                  )
              }
            />

            <Detail
              label="Administered"
              value={
                formatDateTime(
                  viewing.administered_at
                )
              }
            />

            <Detail
              label="Administered By"
              value={
                viewing.administered_by
              }
            />

            <Detail
              label="Route / Site"
              value={
                [
                  viewing.route,
                  viewing.site,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " / "
                  )
              }
            />

            <Detail
              label="Manufacturer"
              value={
                viewing.manufacturer
              }
            />

            <Detail
              label="Lot Number"
              value={
                viewing.lot_number
              }
            />

            <Detail
              label="Expiration"
              value={
                formatDate(
                  viewing.expiration_date
                )
              }
            />

            <Detail
              label="Due Date"
              value={
                formatDate(
                  viewing.due_date
                )
              }
            />

            <Detail
              label="VIS Date"
              value={
                formatDate(
                  viewing.vis_date
                )
              }
            />

            <Detail
              label="Consent"
              value={
                viewing.consent_status
              }
            />
          </div>


          {(viewing.refusal_reason ||
            viewing.contraindication_reason ||
            viewing.notes) && (
            <div className="border-t border-[#D8DFDB] p-3 text-[10px] leading-5">
              {viewing.refusal_reason && (
                <p>
                  <strong>
                    Refusal Reason:
                  </strong>{" "}
                  {viewing.refusal_reason}
                </p>
              )}

              {viewing.contraindication_reason && (
                <p>
                  <strong>
                    Contraindication:
                  </strong>{" "}
                  {viewing.contraindication_reason}
                </p>
              )}

              {viewing.notes && (
                <p>
                  <strong>
                    Notes:
                  </strong>{" "}
                  {viewing.notes}
                </p>
              )}
            </div>
          )}
        </InfoModal>
      )}


      {historyRecord && (
        <InfoModal
          title={`Immunization History — ${historyRecord.vaccine_name}`}
          onClose={() => {
            setHistoryRecord(
              null
            );

            setHistory([]);
          }}
        >
          {historyLoading ? (
            <div className="flex h-32 items-center justify-center">
              <LoaderCircle
                size={18}
                className="animate-spin text-[#073B2F]"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#E7EDE9] text-[9px] font-bold uppercase text-[#40544B]">
                    <Head>
                      Date / Time
                    </Head>

                    <Head>
                      Action
                    </Head>

                    <Head>
                      Previous
                    </Head>

                    <Head>
                      New
                    </Head>

                    <Head>
                      Staff
                    </Head>
                  </tr>
                </thead>

                <tbody>
                  {history.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-b border-[#DCE3DF] text-[10px]"
                      >
                        <td className="px-2 py-1.5">
                          {formatDateTime(
                            item.changed_at
                          )}
                        </td>

                        <td className="px-2 py-1.5 font-semibold">
                          {item.action}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.previous_status ||
                            "—"}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.new_status ||
                            "—"}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.changed_by}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </InfoModal>
      )}
    </>
  );
}


function ImmunizationModal({
  open,
  residentId,
  residentName,
  initialRecord,
  presetStatus,
  onClose,
  onSaved,
}: {
  open: boolean;

  residentId: number;
  residentName: string;

  initialRecord:
    | ImmunizationRecord
    | null;

  presetStatus:
    | ImmunizationStatus
    | null;

  onClose:
    () => void;

  onSaved:
    () => void;
}) {
  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm()
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
      initialRecord
    ) {
      const administered =
        splitDateTime(
          initialRecord.administered_at
        );


      setForm({
        vaccineName:
          initialRecord.vaccine_name,

        vaccineCode:
          initialRecord.vaccine_code ??
          "",

        doseNumber:
          initialRecord.dose_number ??
          "",

        doseAmount:
          initialRecord.dose_amount ??
          "",

        status:
          presetStatus ??
          initialRecord.status,

        administeredDate:
          presetStatus ===
            "Completed" &&
          !administered.date
            ? dateInput()
            : administered.date,

        administeredTime:
          presetStatus ===
            "Completed" &&
          !administered.time
            ? timeInput()
            : administered.time,

        administeredBy:
          initialRecord.administered_by ??
          "",

        route:
          initialRecord.route ??
          "",

        site:
          initialRecord.site ??
          "",

        manufacturer:
          initialRecord.manufacturer ??
          "",

        lotNumber:
          initialRecord.lot_number ??
          "",

        expirationDate:
          initialRecord.expiration_date ??
          "",

        dueDate:
          initialRecord.due_date ??
          "",

        visDate:
          initialRecord.vis_date ??
          "",

        consentStatus:
          initialRecord.consent_status ??
          "Unknown",

        refusalReason:
          initialRecord.refusal_reason ??
          "",

        contraindicationReason:
          initialRecord.contraindication_reason ??
          "",

        source:
          initialRecord.source ??
          "",

        notes:
          initialRecord.notes ??
          "",
      });
    } else {
      const next =
        emptyForm();

      if (
        presetStatus
      ) {
        next.status =
          presetStatus;
      }

      setForm(next);
    }


    setError("");
  }, [
    open,
    initialRecord,
    presetStatus,
  ]);


  if (!open) {
    return null;
  }


  function setField<
    K extends keyof FormState
  >(
    key: K,
    value:
      FormState[K]
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [key]:
          value,
      })
    );

    setError("");
  }


  async function save() {
    if (
      !form.vaccineName.trim()
    ) {
      setError(
        "Vaccine name is required."
      );

      return;
    }


    if (
      form.status ===
        "Completed" &&
      !form.administeredDate
    ) {
      setError(
        "Administration date is required."
      );

      return;
    }


    if (
      form.status ===
        "Due" &&
      !form.dueDate
    ) {
      setError(
        "Due date is required."
      );

      return;
    }


    if (
      form.status ===
        "Declined" &&
      !form.refusalReason.trim()
    ) {
      setError(
        "Refusal reason is required."
      );

      return;
    }


    if (
      form.status ===
        "Contraindicated" &&
      !form.contraindicationReason.trim()
    ) {
      setError(
        "Contraindication reason is required."
      );

      return;
    }


    setSaving(true);
    setError("");


    const payload = {
      resident_id:
        residentId,

      vaccine_name:
        form.vaccineName.trim(),

      vaccine_code:
        form.vaccineCode.trim(),

      dose_number:
        form.doseNumber.trim(),

      dose_amount:
        form.doseAmount.trim(),

      status:
        form.status,

      administered_at:
        form.status ===
        "Completed"
          ? combineDateTime(
              form.administeredDate,
              form.administeredTime
            )
          : "",

      administered_by:
        form.administeredBy.trim(),

      route:
        form.route.trim(),

      site:
        form.site.trim(),

      manufacturer:
        form.manufacturer.trim(),

      lot_number:
        form.lotNumber.trim(),

      expiration_date:
        form.expirationDate,

      due_date:
        form.dueDate,

      vis_date:
        form.visDate,

      consent_status:
        form.consentStatus,

      refusal_reason:
        form.refusalReason.trim(),

      contraindication_reason:
        form.contraindicationReason.trim(),

      source:
        form.source.trim(),

      notes:
        form.notes.trim(),
    };


    try {
      if (
        initialRecord
      ) {
        const {
          error:
            updateError,
        } =
          await supabase.rpc(
            "la_cura_update_immunization",
            {
              p_immunization_id:
                initialRecord.id,

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
            "la_cura_create_immunization",
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
          caughtError
        )
      );
    } finally {
      setSaving(false);
    }
  }


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
        role="dialog"
        aria-modal="true"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden border border-[#A4B1AA] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between bg-[#073B2F] px-3 py-2 text-white">
          <div>
            <p className="text-[9px] font-semibold uppercase text-[#CAD8D1]">
              Resident:{" "}
              {residentName}
            </p>

            <h2 className="text-[14px] font-bold">
              {initialRecord
                ? "Revise Immunization"
                : "New Immunization"}
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
          <SectionBar>
            Immunization Details
          </SectionBar>


          <div className="grid gap-3 p-3 md:grid-cols-3">
            <Field
              label="Vaccine"
              required
              value={
                form.vaccineName
              }
              onChange={(
                value
              ) =>
                setField(
                  "vaccineName",
                  value
                )
              }
              placeholder="Influenza, COVID-19, Pneumococcal..."
            />

            <Field
              label="Vaccine / CVX Code"
              value={
                form.vaccineCode
              }
              onChange={(
                value
              ) =>
                setField(
                  "vaccineCode",
                  value
                )
              }
            />

            <SelectField
              label="Status"
              value={
                form.status
              }
              options={[
                "Completed",
                "Due",
                "Declined",
                "Contraindicated",
              ]}
              onChange={(
                value
              ) =>
                setField(
                  "status",
                  value as ImmunizationStatus
                )
              }
            />

            <Field
              label="Dose Number"
              value={
                form.doseNumber
              }
              onChange={(
                value
              ) =>
                setField(
                  "doseNumber",
                  value
                )
              }
              placeholder="1, 2, Booster..."
            />

            <Field
              label="Dose Amount"
              value={
                form.doseAmount
              }
              onChange={(
                value
              ) =>
                setField(
                  "doseAmount",
                  value
                )
              }
              placeholder="0.5 mL"
            />

            <Field
              label="Source"
              value={
                form.source
              }
              onChange={(
                value
              ) =>
                setField(
                  "source",
                  value
                )
              }
              placeholder="Facility, hospital record, resident..."
            />
          </div>


          {form.status ===
            "Completed" && (
            <>
              <SectionBar>
                Administration Details
              </SectionBar>

              <div className="grid gap-3 p-3 md:grid-cols-3">
                <DateTimeField
                  label="Administration Date / Time"
                  date={
                    form.administeredDate
                  }
                  time={
                    form.administeredTime
                  }
                  onDate={(
                    value
                  ) =>
                    setField(
                      "administeredDate",
                      value
                    )
                  }
                  onTime={(
                    value
                  ) =>
                    setField(
                      "administeredTime",
                      value
                    )
                  }
                />

                <Field
                  label="Administered By"
                  value={
                    form.administeredBy
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "administeredBy",
                      value
                    )
                  }
                />

                <SelectField
                  label="Route"
                  value={
                    form.route
                  }
                  options={[
                    "",
                    "Intramuscular",
                    "Subcutaneous",
                    "Oral",
                    "Intranasal",
                    "Intradermal",
                    "Other",
                  ]}
                  onChange={(
                    value
                  ) =>
                    setField(
                      "route",
                      value
                    )
                  }
                />

                <SelectField
                  label="Administration Site"
                  value={
                    form.site
                  }
                  options={[
                    "",
                    "Left Deltoid",
                    "Right Deltoid",
                    "Left Thigh",
                    "Right Thigh",
                    "Oral",
                    "Nasal",
                    "Other",
                  ]}
                  onChange={(
                    value
                  ) =>
                    setField(
                      "site",
                      value
                    )
                  }
                />

                <Field
                  label="Manufacturer"
                  value={
                    form.manufacturer
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "manufacturer",
                      value
                    )
                  }
                />

                <Field
                  label="Lot Number"
                  value={
                    form.lotNumber
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "lotNumber",
                      value
                    )
                  }
                />

                <Field
                  label="Expiration Date"
                  type="date"
                  value={
                    form.expirationDate
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "expirationDate",
                      value
                    )
                  }
                />

                <Field
                  label="VIS Date"
                  type="date"
                  value={
                    form.visDate
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "visDate",
                      value
                    )
                  }
                />

                <SelectField
                  label="Consent"
                  value={
                    form.consentStatus
                  }
                  options={[
                    "Unknown",
                    "Obtained",
                    "Not Required",
                  ]}
                  onChange={(
                    value
                  ) =>
                    setField(
                      "consentStatus",
                      value
                    )
                  }
                />
              </div>
            </>
          )}


          {form.status ===
            "Due" && (
            <>
              <SectionBar>
                Due Information
              </SectionBar>

              <div className="p-3">
                <Field
                  label="Due Date"
                  required
                  type="date"
                  value={
                    form.dueDate
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "dueDate",
                      value
                    )
                  }
                />
              </div>
            </>
          )}


          {form.status ===
            "Declined" && (
            <>
              <SectionBar>
                Refusal
              </SectionBar>

              <div className="p-3">
                <label>
                  <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
                    Refusal Reason{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </span>

                  <textarea
                    rows={3}
                    value={
                      form.refusalReason
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "refusalReason",
                        event.target
                          .value
                      )
                    }
                    className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
                  />
                </label>
              </div>
            </>
          )}


          {form.status ===
            "Contraindicated" && (
            <>
              <SectionBar>
                Contraindication
              </SectionBar>

              <div className="p-3">
                <label>
                  <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
                    Contraindication Reason{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </span>

                  <textarea
                    rows={3}
                    value={
                      form.contraindicationReason
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "contraindicationReason",
                        event.target
                          .value
                      )
                    }
                    className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
                  />
                </label>
              </div>
            </>
          )}


          <SectionBar>
            Clinical Notes
          </SectionBar>

          <div className="p-3">
            <textarea
              rows={3}
              value={
                form.notes
              }
              onChange={(
                event
              ) =>
                setField(
                  "notes",
                  event.target
                    .value
                )
              }
              className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
            />


            {error && (
              <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>


        <footer className="flex justify-center gap-1.5 border-t border-[#BEC8C2] bg-[#F3F2ED] px-3 py-2">
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
              ? "Saving..."
              : initialRecord
                ? "Save Revision"
                : "Save Immunization"}
          </button>


          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="h-8 border border-[#8E9D95] bg-white px-4 text-[10px] font-bold text-[#33483F]"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}


function InfoModal({
  title,
  children,
  onClose,
}: {
  title: string;

  children:
    React.ReactNode;

  onClose:
    () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4"
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
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-[#AAB8B1] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between bg-[#073B2F] px-3 py-2 text-white">
          <h2 className="text-[12px] font-bold">
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="h-7 border border-white/25 px-2 text-[10px] font-bold"
          >
            Close
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
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#D7DFDA] px-3 py-2 last:border-b-0 sm:border-b-0 sm:border-r">
      <p className="text-[9px] font-bold uppercase text-[#64736C]">
        {label}
      </p>

      <div className="flex items-center gap-1">
        {warning && (
          <AlertTriangle
            size={11}
            className="text-amber-600"
          />
        )}

        <strong className="text-[13px] text-[#263D33]">
          {value}
        </strong>
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
    <th className="border-r border-[#BFCAD0] px-2 py-1 text-left last:border-r-0">
      {children}
    </th>
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


function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;

  onChange:
    (
      value: string
    ) => void;

  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
        {label}

        {required && (
          <span className="ml-0.5 text-red-600">
            *
          </span>
        )}
      </span>

      <input
        type={
          type
        }
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
        className="h-8 w-full border border-[#B8C3BD] bg-white px-2 text-[10px] outline-none focus:border-[#667F73]"
      />
    </label>
  );
}


function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;

  options:
    string[];

  onChange:
    (
      value: string
    ) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
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
                option ||
                "__empty"
              }
              value={
                option
              }
            >
              {option ||
                "Select..."}
            </option>
          )
        )}
      </select>
    </label>
  );
}


function DateTimeField({
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
      <p className="mb-1 text-[10px] font-bold text-[#33483F]">
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
