"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  AlertTriangle,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  allergyHistoryActionLabel,
  allergyLocale,
  allergySeverityLabel,
  allergyStatusConfirmation,
  allergyStatusLabel,
  allergyText,
  allergyTypeLabel,
  type AllergySeverityValue,
  type AllergyStatusValue,
  type AllergyTypeValue,
} from "@/lib/i18n/allergies";

import {
  supabase,
} from "@/lib/supabase/client";


type AllergyRecord = {
  id: number;

  resident_id:
    number;

  resident_name:
    string;

  allergen:
    string;

  allergy_type:
    AllergyTypeValue;

  reaction:
    | string
    | null;

  severity:
    AllergySeverityValue;

  onset_date:
    | string
    | null;

  source:
    | string
    | null;

  status:
    AllergyStatusValue;

  notes:
    | string
    | null;

  revision_number:
    number;

  revision_date:
    | string
    | null;

  created_by:
    | string
    | null;

  created_at:
    | string
    | null;
};


type AllergyHistory = {
  id:
    number;

  allergy_id:
    number;

  action:
    string;

  previous_status:
    | string
    | null;

  new_status:
    | string
    | null;

  note:
    | string
    | null;

  changed_by:
    string;

  changed_at:
    string;
};


type Props = {
  residentId:
    number;

  residentName:
    string;
};


type FormState = {
  allergen:
    string;

  allergyType:
    AllergyTypeValue;

  reaction:
    string;

  severity:
    AllergySeverityValue;

  onsetDate:
    string;

  source:
    string;

  notes:
    string;
};


const EMPTY_FORM:
  FormState = {
  allergen: "",

  allergyType:
    "Medication",

  reaction: "",

  severity:
    "Unknown",

  onsetDate: "",

  source: "",

  notes: "",
};


function cleanText(
  value:
    unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function errorMessage(
  value:
    unknown,

  fallback:
    string
) {
  if (
    value instanceof
    Error
  ) {
    return (
      value.message ||
      fallback
    );
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


    const message =
      cleanText(
        record.message
      );


    const details =
      cleanText(
        record.details
      );


    if (
      message &&
      details &&
      details !==
        message
    ) {
      return `${message} — ${details}`;
    }


    return (
      message ||
      details ||
      fallback
    );
  }


  return fallback;
}


function formatDate(
  value:
    | string
    | null
    | undefined,

  language:
    "en" | "fr"
) {
  if (!value) {
    return "—";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return new Intl.DateTimeFormat(
    allergyLocale(
      language
    ),
    {
      month:
        "numeric",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    date
  );
}


function formatDateTime(
  value:
    | string
    | null
    | undefined,

  language:
    "en" | "fr"
) {
  if (!value) {
    return "—";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return new Intl.DateTimeFormat(
    allergyLocale(
      language
    ),
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  ).format(
    date
  );
}


function severityClass(
  severity:
    AllergySeverityValue
) {
  switch (
    severity
  ) {
    case "Severe":
      return "font-bold text-red-700";

    case "Moderate":
      return "font-semibold text-amber-700";

    case "Mild":
      return "font-semibold text-[#1D6550]";

    default:
      return "text-[#596A62]";
  }
}


export default function ResidentAllergiesTab({
  residentId,
  residentName,
}: Props) {
  const {
    language,
  } =
    useLanguage();


  const [
    allergies,
    setAllergies,
  ] = useState<
    AllergyRecord[]
  >([]);


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  const [
    search,
    setSearch,
  ] = useState(
    ""
  );


  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    AllergyTypeValue
    | "All"
  >(
    "All"
  );


  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    AllergyStatusValue
    | "All"
  >(
    "Active"
  );


  const [
    formOpen,
    setFormOpen,
  ] = useState(
    false
  );


  const [
    editing,
    setEditing,
  ] =
    useState<
      AllergyRecord
      | null
    >(
      null
    );


  const [
    viewing,
    setViewing,
  ] =
    useState<
      AllergyRecord
      | null
    >(
      null
    );


  const [
    historyAllergy,
    setHistoryAllergy,
  ] =
    useState<
      AllergyRecord
      | null
    >(
      null
    );


  const [
    history,
    setHistory,
  ] = useState<
    AllergyHistory[]
  >([]);


  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(
    false
  );


  const loadAllergies =
    useCallback(
      async (
        quiet =
          false
      ) => {
        if (
          quiet
        ) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }


        setError(
          ""
        );


        try {
          const {
            data,
            error:
              loadError,
          } =
            await supabase
              .from(
                "resident_allergies"
              )
              .select(
                "*"
              )
              .eq(
                "resident_id",
                residentId
              )
              .order(
                "status",
                {
                  ascending:
                    true,
                }
              )
              .order(
                "allergen",
                {
                  ascending:
                    true,
                }
              );


          if (
            loadError
          ) {
            throw loadError;
          }


          setAllergies(
            (
              data ??
              []
            ) as AllergyRecord[]
          );
        } catch (
          caughtError
        ) {
          console.error(
            "Unable to load resident allergies:",
            caughtError
          );


          setError(
            errorMessage(
              caughtError,
              allergyText(
                language,
                "loadError"
              )
            )
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        language,
        residentId,
      ]
    );


  useEffect(
    () => {
      void loadAllergies();
    },
    [
      loadAllergies,
    ]
  );


  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return allergies.filter(
          (
            allergy
          ) => {
            const matchesType =
              typeFilter ===
                "All" ||
              allergy
                .allergy_type ===
                typeFilter;


            const matchesStatus =
              statusFilter ===
                "All" ||
              allergy.status ===
                statusFilter;


            const matchesSearch =
              !query ||
              [
                allergy
                  .allergen,

                allergy
                  .allergy_type,

                allergy
                  .reaction,

                allergy
                  .severity,

                allergy
                  .source,

                allergy
                  .notes,
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
              matchesType &&
              matchesStatus &&
              matchesSearch
            );
          }
        );
      },
      [
        allergies,
        search,
        statusFilter,
        typeFilter,
      ]
    );


  const activeCount =
    allergies.filter(
      (
        allergy
      ) =>
        allergy.status ===
        "Active"
    ).length;


  async function changeStatus(
    allergy:
      AllergyRecord,

    status:
      AllergyStatusValue
  ) {
    const confirmed =
      window.confirm(
        allergyStatusConfirmation(
          language,
          status,
          allergy.allergen
        )
      );


    if (
      !confirmed
    ) {
      return;
    }


    const {
      error:
        actionError,
    } =
      await supabase.rpc(
        "la_cura_set_allergy_status",
        {
          p_allergy_id:
            allergy.id,

          p_status:
            status,

          p_note:
            null,
        }
      );


    if (
      actionError
    ) {
      window.alert(
        errorMessage(
          actionError,
          allergyText(
            language,
            "statusError"
          )
        )
      );

      return;
    }


    await loadAllergies(
      true
    );
  }


  async function openHistory(
    allergy:
      AllergyRecord
  ) {
    setHistoryAllergy(
      allergy
    );

    setHistory(
      []
    );

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
          "resident_allergy_history"
        )
        .select(
          "*"
        )
        .eq(
          "allergy_id",
          allergy.id
        )
        .order(
          "changed_at",
          {
            ascending:
              false,
          }
        );


    if (
      !historyError
    ) {
      setHistory(
        (
          data ??
          []
        ) as AllergyHistory[]
      );
    }


    setHistoryLoading(
      false
    );
  }


  function handleAction(
    allergy:
      AllergyRecord,

    action:
      string
  ) {
    switch (
      action
    ) {
      case "view":
        setViewing(
          allergy
        );

        return;


      case "edit":
        setEditing(
          allergy
        );

        setFormOpen(
          true
        );

        return;


      case "inactive":
        void changeStatus(
          allergy,
          "Inactive"
        );

        return;


      case "active":
        void changeStatus(
          allergy,
          "Active"
        );

        return;


      case "history":
        void openHistory(
          allergy
        );

        return;
    }
  }


  if (
    loading
  ) {
    return (
      <div className="flex min-h-[260px] items-center justify-center bg-white">
        <LoaderCircle
          size={
            20
          }
          className="animate-spin text-[#073B2F]"
        />
      </div>
    );
  }


  return (
    <>
      <div className="bg-white">
        {/* TOOLBAR */}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6E815C] bg-[#8FA47A] px-2 py-1">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEditing(
                  null
                );

                setFormOpen(
                  true
                );
              }}
              className="inline-flex h-7 items-center gap-1 border border-[#58694A] bg-white px-2.5 text-[10px] font-bold text-[#243A30]"
            >
              <Plus
                size={
                  11
                }
              />

              {allergyText(
                language,
                "newAllergy"
              )}
            </button>


            <div className="relative min-w-[230px] flex-1 sm:max-w-[420px]">
              <Search
                size={
                  11
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6A776F]"
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
                placeholder={
                  allergyText(
                    language,
                    "searchPlaceholder"
                  )
                }
                className="h-7 w-full border border-[#788A6D] bg-white pl-7 pr-2 text-[10px] outline-none"
              />
            </div>
          </div>


          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              void loadAllergies(
                true
              )
            }
            className="inline-flex h-7 items-center gap-1 border border-[#58694A] bg-white px-2.5 text-[10px] font-bold text-[#243A30] disabled:opacity-50"
          >
            <RefreshCw
              size={
                10
              }
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {allergyText(
              language,
              "refresh"
            )}
          </button>
        </div>


        {/* FILTERS */}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BCC8C1] bg-[#F1F2ED] px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <select
              value={
                typeFilter
              }
              onChange={(
                event
              ) =>
                setTypeFilter(
                  event.target
                    .value as
                    AllergyTypeValue
                    | "All"
                )
              }
              className="h-6 border border-[#AEBAB3] bg-white px-1.5 text-[10px]"
            >
              <option value="All">
                {allergyText(
                  language,
                  "all"
                )}
              </option>

              <option value="Medication">
                {allergyTypeLabel(
                  language,
                  "Medication"
                )}
              </option>

              <option value="Food">
                {allergyTypeLabel(
                  language,
                  "Food"
                )}
              </option>

              <option value="Environmental">
                {allergyTypeLabel(
                  language,
                  "Environmental"
                )}
              </option>

              <option value="Other">
                {allergyTypeLabel(
                  language,
                  "Other"
                )}
              </option>
            </select>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value as
                    AllergyStatusValue
                    | "All"
                )
              }
              className="h-6 border border-[#AEBAB3] bg-white px-1.5 text-[10px]"
            >
              <option value="All">
                {allergyText(
                  language,
                  "all"
                )}
              </option>

              <option value="Active">
                {allergyStatusLabel(
                  language,
                  "Active"
                )}
              </option>

              <option value="Inactive">
                {allergyStatusLabel(
                  language,
                  "Inactive"
                )}
              </option>
            </select>
          </div>


          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#33483F]">
            <AlertTriangle
              size={
                12
              }
              className={
                activeCount >
                0
                  ? "text-red-700"
                  : "text-[#687970]"
              }
            />

            {allergyText(
              language,
              "activeAllergies"
            )}
            :{" "}
            {activeCount}
          </div>
        </div>


        {error && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}


        {/* TABLE */}

        {filtered.length >
        0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="bg-[#E5EEF4] text-[9px] font-bold text-[#233A31]">
                  <Head>
                    {allergyText(
                      language,
                      "actions"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "allergen"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "type"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "reaction"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "severity"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "status"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "onset"
                    )}
                  </Head>

                  <Head>
                    {allergyText(
                      language,
                      "revision"
                    )}
                  </Head>
                </tr>
              </thead>


              <tbody>
                {filtered.map(
                  (
                    allergy,
                    index
                  ) => (
                    <tr
                      key={
                        allergy.id
                      }
                      className={`
                        border-b
                        border-[#D7DEDA]
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
                            handleAction(
                              allergy,
                              event.target
                                .value
                            );

                            event.target
                              .value =
                              "";
                          }}
                          className="h-6 w-[96px] border border-[#AEB8B3] bg-white px-1 text-[9px] font-semibold text-[#174F75]"
                        >
                          <option value="">
                            {allergyText(
                              language,
                              "actions"
                            )}
                          </option>

                          <option value="view">
                            {allergyText(
                              language,
                              "view"
                            )}
                          </option>

                          <option value="edit">
                            {allergyText(
                              language,
                              "editRevise"
                            )}
                          </option>

                          {allergy.status ===
                          "Active" ? (
                            <option value="inactive">
                              {allergyText(
                                language,
                                "inactivate"
                              )}
                            </option>
                          ) : (
                            <option value="active">
                              {allergyText(
                                language,
                                "reactivate"
                              )}
                            </option>
                          )}

                          <option value="history">
                            {allergyText(
                              language,
                              "history"
                            )}
                          </option>
                        </select>
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1 font-bold text-[#26382F]">
                        {allergy.allergen}
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        {allergyTypeLabel(
                          language,
                          allergy.allergy_type
                        )}
                      </td>


                      <td className="max-w-[320px] border-r border-[#D7DEDA] px-2 py-1">
                        {cleanText(
                          allergy.reaction
                        ) ||
                          "—"}
                      </td>


                      <td
                        className={`border-r border-[#D7DEDA] px-2 py-1 ${severityClass(
                          allergy.severity
                        )}`}
                      >
                        {allergySeverityLabel(
                          language,
                          allergy.severity
                        )}
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1 font-semibold">
                        {allergyStatusLabel(
                          language,
                          allergy.status
                        )}
                      </td>


                      <td className="whitespace-nowrap border-r border-[#D7DEDA] px-2 py-1">
                        {formatDate(
                          allergy.onset_date,
                          language
                        )}
                      </td>


                      <td className="whitespace-nowrap px-2 py-1">
                        {formatDate(
                          allergy.revision_date,
                          language
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-[11px] font-semibold text-[#465A50]">
              {allergyText(
                language,
                "noMatchingRecords"
              )}
            </p>

            <p className="mt-1 text-[10px] text-[#75837C]">
              {allergyText(
                language,
                "emptyListWarning"
              )}
            </p>
          </div>
        )}
      </div>


      <AllergyFormModal
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
        onClose={() => {
          setFormOpen(
            false
          );

          setEditing(
            null
          );
        }}
        onSaved={() =>
          void loadAllergies(
            true
          )
        }
      />


      {viewing && (
        <InfoModal
          title={
            allergyText(
              language,
              "allergyDetails"
            )
          }
          onClose={() =>
            setViewing(
              null
            )
          }
        >
          <div className="grid gap-px bg-[#D8DFDB] sm:grid-cols-2">
            <Detail
              label={
                allergyText(
                  language,
                  "allergen"
                )
              }
              value={
                viewing.allergen
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "type"
                )
              }
              value={
                allergyTypeLabel(
                  language,
                  viewing.allergy_type
                )
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "reaction"
                )
              }
              value={
                viewing.reaction
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "severity"
                )
              }
              value={
                allergySeverityLabel(
                  language,
                  viewing.severity
                )
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "status"
                )
              }
              value={
                allergyStatusLabel(
                  language,
                  viewing.status
                )
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "onsetDate"
                )
              }
              value={
                formatDate(
                  viewing.onset_date,
                  language
                )
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "source"
                )
              }
              value={
                viewing.source
              }
            />

            <Detail
              label={
                allergyText(
                  language,
                  "recordedBy"
                )
              }
              value={
                viewing.created_by
              }
            />
          </div>


          <div className="border-t border-[#D7DEDA] p-3">
            <p className="text-[9px] font-bold uppercase text-[#718078]">
              {allergyText(
                language,
                "clinicalNotes"
              )}
            </p>

            <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-[#34483F]">
              {cleanText(
                viewing.notes
              ) ||
                allergyText(
                  language,
                  "noNotes"
                )}
            </p>
          </div>
        </InfoModal>
      )}


      {historyAllergy && (
        <InfoModal
          title={`${allergyText(
            language,
            "allergyHistory"
          )} — ${historyAllergy.allergen}`}
          onClose={() => {
            setHistoryAllergy(
              null
            );

            setHistory(
              []
            );
          }}
        >
          {historyLoading ? (
            <div className="flex h-32 items-center justify-center">
              <LoaderCircle
                size={
                  18
                }
                className="animate-spin text-[#073B2F]"
              />
            </div>
          ) : history.length >
            0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#E7EDE9] text-[9px] font-bold uppercase text-[#40544B]">
                    <Head>
                      {allergyText(
                        language,
                        "dateTime"
                      )}
                    </Head>

                    <Head>
                      {allergyText(
                        language,
                        "action"
                      )}
                    </Head>

                    <Head>
                      {allergyText(
                        language,
                        "previous"
                      )}
                    </Head>

                    <Head>
                      {allergyText(
                        language,
                        "new"
                      )}
                    </Head>

                    <Head>
                      {allergyText(
                        language,
                        "staff"
                      )}
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
                            item.changed_at,
                            language
                          )}
                        </td>

                        <td className="px-2 py-1.5 font-semibold">
                          {allergyHistoryActionLabel(
                            language,
                            item.action
                          )}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.previous_status
                            ? allergyStatusLabel(
                                language,
                                item.previous_status
                              )
                            : "—"}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.new_status
                            ? allergyStatusLabel(
                                language,
                                item.new_status
                              )
                            : "—"}
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
          ) : (
            <div className="p-8 text-center text-[11px] text-[#687970]">
              {allergyText(
                language,
                "noHistory"
              )}
            </div>
          )}
        </InfoModal>
      )}
    </>
  );
}


function AllergyFormModal({
  open,
  residentId,
  residentName,
  initialRecord,
  onClose,
  onSaved,
}: {
  open:
    boolean;

  residentId:
    number;

  residentName:
    string;

  initialRecord:
    | AllergyRecord
    | null;

  onClose:
    () => void;

  onSaved:
    () => void;
}) {
  const {
    language,
  } =
    useLanguage();


  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      EMPTY_FORM
    );


  const [
    saving,
    setSaving,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }


      if (
        initialRecord
      ) {
        setForm({
          allergen:
            initialRecord.allergen,

          allergyType:
            initialRecord.allergy_type,

          reaction:
            initialRecord.reaction ??
            "",

          severity:
            initialRecord.severity,

          onsetDate:
            initialRecord.onset_date ??
            "",

          source:
            initialRecord.source ??
            "",

          notes:
            initialRecord.notes ??
            "",
        });
      } else {
        setForm(
          EMPTY_FORM
        );
      }


      setError(
        ""
      );
    },
    [
      initialRecord,
      open,
    ]
  );


  if (
    !open
  ) {
    return null;
  }


  function update<
    K extends
      keyof FormState
  >(
    key:
      K,

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


    setError(
      ""
    );
  }


  async function save() {
    if (
      !form
        .allergen
        .trim()
    ) {
      setError(
        allergyText(
          language,
          "allergenRequired"
        )
      );

      return;
    }


    setSaving(
      true
    );

    setError(
      ""
    );


    const payload = {
      resident_id:
        residentId,

      allergen:
        form.allergen
          .trim(),

      allergy_type:
        form.allergyType,

      reaction:
        form.reaction
          .trim(),

      severity:
        form.severity,

      onset_date:
        form.onsetDate,

      source:
        form.source
          .trim(),

      notes:
        form.notes
          .trim(),
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
            "la_cura_update_allergy",
            {
              p_allergy_id:
                initialRecord.id,

              p_payload:
                payload,
            }
          );


        if (
          updateError
        ) {
          throw updateError;
        }
      } else {
        const {
          error:
            createError,
        } =
          await supabase.rpc(
            "la_cura_create_allergy",
            {
              p_payload:
                payload,
            }
          );


        if (
          createError
        ) {
          throw createError;
        }
      }


      onSaved();
      onClose();
    } catch (
      caughtError
    ) {
      console.error(
        "Unable to save allergy:",
        caughtError
      );


      setError(
        errorMessage(
          caughtError,
          allergyText(
            language,
            "saveError"
          )
        )
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 p-3"
      onMouseDown={() => {
        if (
          !saving
        ) {
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
        className="w-full max-w-3xl overflow-hidden border border-[#A7B4AD] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-[#617966] bg-[#073B2F] px-3 py-2 text-white">
          <div>
            <p className="text-[9px] font-semibold uppercase text-[#CAD8D1]">
              {allergyText(
                language,
                "resident"
              )}
              :{" "}
              {residentName}
            </p>

            <h2 className="text-[14px] font-bold">
              {initialRecord
                ? allergyText(
                    language,
                    "reviseAllergy"
                  )
                : allergyText(
                    language,
                    "newAllergy"
                  )}
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
            className="flex h-7 w-7 items-center justify-center border border-white/25 bg-white/10"
          >
            <X
              size={
                13
              }
            />
          </button>
        </header>


        <div className="border-b border-[#889B7A] bg-[#91A47E] px-2 py-1 text-[11px] font-bold text-white">
          {allergyText(
            language,
            "allergyDetails"
          )}
        </div>


        <div className="grid gap-3 p-3 md:grid-cols-2">
          <Field
            label={
              allergyText(
                language,
                "allergen"
              )
            }
            required
            value={
              form.allergen
            }
            onChange={(
              value
            ) =>
              update(
                "allergen",
                value
              )
            }
            placeholder={
              allergyText(
                language,
                "allergenPlaceholder"
              )
            }
          />


          <label>
            <FieldLabel
              label={
                allergyText(
                  language,
                  "allergyType"
                )
              }
              required
            />

            <select
              value={
                form.allergyType
              }
              onChange={(
                event
              ) =>
                update(
                  "allergyType",
                  event.target
                    .value as
                    AllergyTypeValue
                )
              }
              className="h-8 w-full border border-[#B8C5BE] bg-white px-2 text-[11px] text-[#253A31] outline-none focus:border-[#667F73]"
            >
              {(
                [
                  "Medication",
                  "Food",
                  "Environmental",
                  "Other",
                ] as
                  AllergyTypeValue[]
              ).map(
                (
                  value
                ) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {allergyTypeLabel(
                      language,
                      value
                    )}
                  </option>
                )
              )}
            </select>
          </label>


          <Field
            label={
              allergyText(
                language,
                "reaction"
              )
            }
            value={
              form.reaction
            }
            onChange={(
              value
            ) =>
              update(
                "reaction",
                value
              )
            }
            placeholder={
              allergyText(
                language,
                "reactionPlaceholder"
              )
            }
          />


          <label>
            <FieldLabel
              label={
                allergyText(
                  language,
                  "severity"
                )
              }
              required
            />

            <select
              value={
                form.severity
              }
              onChange={(
                event
              ) =>
                update(
                  "severity",
                  event.target
                    .value as
                    AllergySeverityValue
                )
              }
              className="h-8 w-full border border-[#B8C5BE] bg-white px-2 text-[11px] text-[#253A31] outline-none focus:border-[#667F73]"
            >
              {(
                [
                  "Unknown",
                  "Mild",
                  "Moderate",
                  "Severe",
                ] as
                  AllergySeverityValue[]
              ).map(
                (
                  value
                ) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {allergySeverityLabel(
                      language,
                      value
                    )}
                  </option>
                )
              )}
            </select>
          </label>


          <Field
            label={
              allergyText(
                language,
                "onsetDate"
              )
            }
            type="date"
            value={
              form.onsetDate
            }
            onChange={(
              value
            ) =>
              update(
                "onsetDate",
                value
              )
            }
          />


          <Field
            label={
              allergyText(
                language,
                "informationSource"
              )
            }
            value={
              form.source
            }
            onChange={(
              value
            ) =>
              update(
                "source",
                value
              )
            }
            placeholder={
              allergyText(
                language,
                "sourcePlaceholder"
              )
            }
          />


          <label className="md:col-span-2">
            <FieldLabel
              label={
                allergyText(
                  language,
                  "clinicalNotes"
                )
              }
            />

            <textarea
              rows={
                4
              }
              value={
                form.notes
              }
              onChange={(
                event
              ) =>
                update(
                  "notes",
                  event.target
                    .value
                )
              }
              className="w-full resize-y border border-[#B8C5BE] px-2.5 py-2 text-[11px] outline-none focus:border-[#667F73]"
            />
          </label>
        </div>


        {error && (
          <div className="mx-3 mb-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}


        <footer className="flex justify-center gap-1.5 border-t border-[#BFC9C3] bg-[#F3F2ED] px-3 py-2">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void save()
            }
            className="inline-flex h-8 items-center gap-1.5 border border-[#073B2F] bg-[#073B2F] px-4 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {saving && (
              <LoaderCircle
                size={
                  11
                }
                className="animate-spin"
              />
            )}

            {initialRecord
              ? allergyText(
                  language,
                  "saveRevision"
                )
              : allergyText(
                  language,
                  "saveAllergy"
                )}
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
            {allergyText(
              language,
              "cancel"
            )}
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
  title:
    string;

  children:
    ReactNode;

  onClose:
    () => void;
}) {
  const {
    language,
  } =
    useLanguage();


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
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#AAB8B1] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-[#8A9E78] bg-[#073B2F] px-3 py-2 text-white">
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
            {allergyText(
              language,
              "close"
            )}
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}


function Head({
  children,
}: {
  children:
    ReactNode;
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
  label:
    string;

  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div className="bg-white px-3 py-2">
      <p className="text-[9px] font-bold uppercase text-[#73817A]">
        {label}
      </p>

      <p className="mt-0.5 text-[11px] font-semibold text-[#33483F]">
        {cleanText(
          value
        ) ||
          "—"}
      </p>
    </div>
  );
}


function FieldLabel({
  label,
  required =
    false,
}: {
  label:
    string;

  required?:
    boolean;
}) {
  return (
    <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
      {label}

      {required && (
        <span className="ml-0.5 text-red-600">
          *
        </span>
      )}
    </span>
  );
}


function Field({
  label,
  value,
  onChange,
  type =
    "text",
  placeholder =
    "",
  required =
    false,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  type?:
    string;

  placeholder?:
    string;

  required?:
    boolean;
}) {
  return (
    <label>
      <FieldLabel
        label={
          label
        }
        required={
          required
        }
      />

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
        className="h-8 w-full border border-[#B8C5BE] bg-white px-2 text-[11px] text-[#253A31] outline-none focus:border-[#667F73]"
      />
    </label>
  );
}
