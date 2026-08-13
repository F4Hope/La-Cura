"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  LoaderCircle,
  Save,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase/client";

import type {
  OrderCategory,
  ResidentOrder,
} from "@/lib/orderTypes";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  clinicalText,
  type ClinicalLanguage,
} from "@/lib/i18n/clinicalModules";


type ActiveAllergy = {
  id: number;
  allergen: string;

  reaction:
    | string
    | null;

  severity:
    | string
    | null;
};


type Props = {
  open: boolean;

  category:
    OrderCategory | null;

  residentId: number;
  residentName: string;

  primaryDoctor?: string;

  initialOrder?:
    ResidentOrder | null;

  onClose: () => void;

  onSaved: () => void;
};


type OrderForm = {
  orderDate: string;
  orderTime: string;

  communicationMethod:
    string;

  orderedBy: string;

  orderName: string;

  dosage: string;

  orderType: string;

  route: string;

  scheduleType: string;

  frequency: string;

  administrationTime:
    string;

  indication: string;

  priority: string;

  specimen: string;

  source: string;

  pharmacy: string;

  startDate: string;

  endDate: string;

  reviewDate: string;

  directions: string;

  notes: string;

  daw: boolean;

  bodySite: string;

  fastingRequired:
    boolean;

  texture: string;

  liquidConsistency:
    string;

  restrictions: string;

  amount: string;

  rate: string;

  flush: string;

  holdParameters: string;
};


function dateInputValue(
  date = new Date()
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function timeInputValue(
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


function cleanText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function getSupabaseErrorMessage(
  value: unknown,
  language: ClinicalLanguage
): string {
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

    const message =
      cleanText(
        record.message
      );

    const details =
      cleanText(
        record.details
      );

    const hint =
      cleanText(
        record.hint
      );

    const code =
      cleanText(
        record.code
      );


    const parts = [
      message,
      details &&
        details !== message
        ? details
        : "",
      hint
        ? `Hint: ${hint}`
        : "",
      code
        ? `Code: ${code}`
        : "",
    ].filter(Boolean);


    if (
      parts.length >
      0
    ) {
      return parts.join(
        " — "
      );
    }
  }


  return clinicalText(
    language,
    "The order could not be saved."
  );
}


function sourceForCategory(
  category:
    OrderCategory
) {
  if (
    category ===
    "Pharmacy"
  ) {
    return "Pharmacy";
  }

  if (
    category ===
    "Diagnostic"
  ) {
    return "Diagnostic";
  }

  if (
    category ===
    "Laboratory"
  ) {
    return "Laboratory";
  }

  if (
    category === "Diet"
  ) {
    return "Dietary";
  }

  if (
    category ===
    "Supplement" ||
    category ===
      "Enteral Feed"
  ) {
    return "Nutrition";
  }

  return "Facility";
}


function createInitialForm(
  category:
    OrderCategory,
  primaryDoctor = "",
  initialOrder?:
    ResidentOrder | null
): OrderForm {
  const metadata =
    initialOrder
      ?.metadata ??
    {};


  let orderDate =
    dateInputValue();

  let orderTime =
    timeInputValue();


  if (
    initialOrder
      ?.order_date
  ) {
    const date =
      new Date(
        initialOrder.order_date
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      orderDate =
        dateInputValue(
          date
        );

      orderTime =
        timeInputValue(
          date
        );
    }
  }


  return {
    orderDate,
    orderTime,

    communicationMethod:
      initialOrder
        ?.communication_method ??
      "Prescriber Entered",

    orderedBy:
      initialOrder
        ?.ordered_by ??
      primaryDoctor,

    orderName:
      initialOrder
        ?.order_name ??
      "",

    dosage:
      initialOrder
        ?.dosage ??
      "",

    orderType:
      initialOrder
        ?.order_type ??
      "",

    route:
      initialOrder
        ?.route ??
      "",

    scheduleType:
      initialOrder
        ?.schedule_type ??
      "Routine",

    frequency:
      initialOrder
        ?.frequency ??
      "",

    administrationTime:
      initialOrder
        ?.administration_time ??
      "",

    indication:
      initialOrder
        ?.indication ??
      "",

    priority:
      initialOrder
        ?.priority ??
      "Routine",

    specimen:
      initialOrder
        ?.specimen ??
      "",

    source:
      initialOrder
        ?.source ??
      sourceForCategory(
        category
      ),

    pharmacy:
      initialOrder
        ?.pharmacy ??
      "",

    startDate:
      initialOrder
        ?.start_date ??
      dateInputValue(),

    endDate:
      initialOrder
        ?.end_date ??
      "",

    reviewDate:
      initialOrder
        ?.review_date ??
      "",

    directions:
      initialOrder
        ?.directions ??
      "",

    notes:
      initialOrder
        ?.notes ??
      "",

    daw:
      Boolean(
        metadata.daw
      ),

    bodySite:
      cleanText(
        metadata.body_site
      ),

    fastingRequired:
      Boolean(
        metadata.fasting_required
      ),

    texture:
      cleanText(
        metadata.texture
      ),

    liquidConsistency:
      cleanText(
        metadata.liquid_consistency
      ),

    restrictions:
      cleanText(
        metadata.restrictions
      ),

    amount:
      cleanText(
        metadata.amount
      ),

    rate:
      cleanText(
        metadata.rate
      ),

    flush:
      cleanText(
        metadata.flush
      ),

    holdParameters:
      cleanText(
        metadata.hold_parameters
      ),
  };
}


function labelForOrder(
  category:
    OrderCategory
) {
  switch (category) {
    case "Pharmacy":
      return "Medication";

    case "Diagnostic":
      return "Diagnostic / Procedure";

    case "Laboratory":
      return "Laboratory Test / Panel";

    case "Diet":
      return "Diet Order";

    case "Supplement":
      return "Supplement";

    case "Enteral Feed":
      return "Formula / Enteral Order";

    default:
      return "Order";
  }
}


export default function OrderEntryModal({
  open,
  category,
  residentId,
  residentName,
  primaryDoctor = "",
  initialOrder = null,
  onClose,
  onSaved,
}: Props) {
  const { language } = useLanguage();

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    form,
    setForm,
  ] =
    useState<OrderForm | null>(
      null
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeAllergies,
    setActiveAllergies,
  ] = useState<
    ActiveAllergy[]
  >([]);

  const [
    allergyLoading,
    setAllergyLoading,
  ] = useState(false);

  const editing =
    Boolean(
      initialOrder
    );


  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);


  useEffect(() => {
    if (
      !open ||
      !category
    ) {
      return;
    }

    setForm(
      createInitialForm(
        category,
        primaryDoctor,
        initialOrder
      )
    );

    setError("");
  }, [
    open,
    category,
    primaryDoctor,
    initialOrder,
  ]);


  useEffect(() => {
    if (
      !open ||
      category !==
        "Pharmacy"
    ) {
      setActiveAllergies(
        []
      );

      setAllergyLoading(
        false
      );

      return;
    }


    let cancelled =
      false;


    async function loadActiveAllergies() {
      setAllergyLoading(
        true
      );


      const {
        data,
        error:
          allergyError,
      } =
        await supabase
          .from(
            "resident_allergies"
          )
          .select(
            "id, allergen, reaction, severity"
          )
          .eq(
            "resident_id",
            residentId
          )
          .eq(
            "status",
            "Active"
          )
          .order(
            "allergen",
            {
              ascending:
                true,
            }
          );


      if (cancelled) {
        return;
      }


      if (
        allergyError
      ) {
        console.error(
          "Unable to load active resident allergies:",
          allergyError
        );

        setActiveAllergies(
          []
        );
      } else {
        const records =
          (data ??
            []) as ActiveAllergy[];


        const severityRank:
          Record<
            string,
            number
          > = {
            Severe: 0,
            Moderate: 1,
            Mild: 2,
            Unknown: 3,
          };


        records.sort(
          (
            a,
            b
          ) =>
            (
              severityRank[
                a.severity ??
                  "Unknown"
              ] ?? 4
            ) -
              (
                severityRank[
                  b.severity ??
                    "Unknown"
                ] ?? 4
              ) ||
            a.allergen.localeCompare(
              b.allergen
            )
        );


        setActiveAllergies(
          records
        );
      }


      setAllergyLoading(
        false
      );
    }


    void loadActiveAllergies();


    return () => {
      cancelled = true;
    };
  }, [
    open,
    category,
    residentId,
  ]);


  useEffect(() => {
    if (!open) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    function handleEscape(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
          "Escape" &&
        !saving
      ) {
        onClose();
      }
    }

    document.body.style
      .overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style
        .overflow =
        previous;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    open,
    saving,
    onClose,
  ]);


  const summaryDirections =
    useMemo(() => {
      if (!form) {
        return "";
      }

      if (
        form.directions.trim()
      ) {
        return form.directions
          .trim();
      }

      return [
        form.dosage,
        form.route,
        form.frequency,
        form.administrationTime,
      ]
        .filter(
          (value) =>
            value.trim()
        )
        .join(" • ");
    }, [
      form,
    ]);


  if (
    !mounted ||
    !open ||
    !category ||
    !form
  ) {
    return null;
  }


  function update(
    field:
      keyof OrderForm,
    value:
      string | boolean
  ) {
    setForm(
      (current) =>
        current
          ? {
              ...current,
              [field]:
                value,
            }
          : current
    );

    setError("");
  }


  function chooseSchedule(
    schedule:
      string
  ) {
    const now =
      new Date();

    setForm(
      (current) => {
        if (!current) {
          return current;
        }

        const next = {
          ...current,
          scheduleType:
            schedule,
        };


        if (
          schedule ===
          "One Time Only"
        ) {
          next.frequency =
            "One Time";

          next.administrationTime =
            next.administrationTime ||
            timeInputValue(
              now
            );
        }


        if (
          schedule ===
          "STAT"
        ) {
          next.frequency =
            "STAT";

          next.administrationTime =
            timeInputValue(
              now
            );
        }


        return next;
      }
    );
  }


  function validate() {
    if (
      !form ||
      !category
    ) {
      return clinicalText(
        language,
        clinicalText(
          language,
          "The order form is not ready."
        )
      );
    }

    if (
      !form.orderName.trim()
    ) {
      return clinicalText(
        language,
        `${labelForOrder(
          category
        )} is required.`
      );
    }


    if (
      !form.orderedBy.trim()
    ) {
      return clinicalText(
        language,
        "Ordered By is required."
      );
    }


    if (
      category ===
        "Pharmacy" &&
      !form.dosage.trim()
    ) {
      return clinicalText(
        language,
        "Medication dosage is required."
      );
    }


    if (
      category ===
        "Pharmacy" &&
      !form.route.trim()
    ) {
      return clinicalText(
        language,
        "Route of administration is required."
      );
    }


    if (
      category ===
        "Enteral Feed" &&
      !form.rate.trim()
    ) {
      return clinicalText(
        language,
        "Enteral feeding rate is required."
      );
    }


    return "";
  }


  async function saveOrder(
    queueNew:
      boolean
  ) {
    if (saving) {
      return;
    }

    if (
      !form ||
      !category
    ) {
      setError(
        clinicalText(
          language,
          "The order form is not ready."
        )
      );

      return;
    }

    const validation =
      validate();

    if (validation) {
      setError(
        validation
      );

      return;
    }


    setSaving(true);
    setError("");


    try {
      const localDate =
        new Date(
          `${form.orderDate}T${
            form.orderTime ||
            "00:00"
          }`
        );


      const metadata = {
        daw:
          form.daw,

        body_site:
          form.bodySite,

        fasting_required:
          form.fastingRequired,

        texture:
          form.texture,

        liquid_consistency:
          form.liquidConsistency,

        restrictions:
          form.restrictions,

        amount:
          form.amount,

        rate:
          form.rate,

        flush:
          form.flush,

        hold_parameters:
          form.holdParameters,
      };


      const payload = {
        resident_id:
          residentId,

        category,

        order_name:
          form.orderName.trim(),

        order_date:
          Number.isNaN(
            localDate.getTime()
          )
            ? new Date()
                .toISOString()
            : localDate
                .toISOString(),

        dosage:
          form.dosage.trim(),

        directions:
          form.directions.trim(),

        order_type:
          form.orderType.trim(),

        route:
          form.route.trim(),

        communication_method:
          form.communicationMethod,

        ordered_by:
          form.orderedBy.trim(),

        schedule_type:
          form.scheduleType,

        frequency:
          form.frequency.trim(),

        administration_time:
          form.administrationTime,

        indication:
          form.indication.trim(),

        priority:
          form.priority,

        specimen:
          form.specimen.trim(),

        source:
          form.source.trim(),

        pharmacy:
          form.pharmacy.trim(),

        start_date:
          form.startDate,

        end_date:
          form.endDate,

        review_date:
          form.reviewDate,

        notes:
          form.notes.trim(),

        metadata,
      };


      if (
        editing &&
        initialOrder
      ) {
        const {
          error:
            updateError,
        } =
          await supabase.rpc(
            "la_cura_update_order",
            {
              p_order_id:
                initialOrder.id,

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
            "la_cura_create_order",
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


      if (
        queueNew &&
        !editing
      ) {
        setForm(
          createInitialForm(
            category,
            primaryDoctor
          )
        );

        return;
      }


      onClose();
    } catch (
      caughtError
    ) {
      console.error(
        "Unable to save order:",
        caughtError
      );

      setError(
        getSupabaseErrorMessage(
          caughtError,
          language
        )
      );
    } finally {
      setSaving(false);
    }
  }


  return createPortal(
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
        className="
          flex max-h-[95vh]
          w-full max-w-[1320px]
          flex-col
          overflow-hidden
          border
          border-[#9FAC9F]
          bg-white
          shadow-xl
        "
      >
        {/* TITLE */}

        <header className="flex items-center justify-between gap-3 border-b border-[#85957E] bg-[#073B2F] px-3 py-2 text-white">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#CAD8D1]">
              {clinicalText(
                language,
                "Resident"
              )}:{" "}
              {residentName}
            </p>

            <h2 className="text-[15px] font-bold">
              {editing
                ? `${clinicalText(
                    language,
                    "Revise"
                  )} ${clinicalText(
                    language,
                    category
                  )} ${clinicalText(
                    language,
                    "Order"
                  )}`
                : `${clinicalText(
                    language,
                    category
                  )} ${clinicalText(
                    language,
                    "Order Entry"
                  )}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="flex h-7 w-7 items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20"
          >
            <X size={13} />
          </button>
        </header>


        {category ===
          "Pharmacy" && (
          <div
            className={`
              flex gap-2 border-b px-3 py-2

              ${
                activeAllergies.length >
                0
                  ? "border-red-300 bg-red-50"
                  : "border-[#D7DEDA] bg-[#F5F6F2]"
              }
            `}
          >
            <TriangleAlert
              size={16}
              className={
                activeAllergies.length >
                0
                  ? "mt-0.5 shrink-0 text-red-700"
                  : "mt-0.5 shrink-0 text-[#687970]"
              }
            />

            <div className="min-w-0">
              <p
                className={`
                  text-[10px] font-extrabold uppercase tracking-[0.03em]

                  ${
                    activeAllergies.length >
                    0
                      ? "text-red-800"
                      : "text-[#40534B]"
                  }
                `}
              >
                {clinicalText(language, "Active Allergies")}
              </p>


              {allergyLoading ? (
                <p className="mt-0.5 text-[10px] text-[#687970]">
                  {clinicalText(language, "Checking resident allergy record...")}
                </p>
              ) : activeAllergies.length >
                0 ? (
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {activeAllergies.map(
                    (
                      allergy
                    ) => (
                      <p
                        key={
                          allergy.id
                        }
                        className="text-[10px] font-semibold text-red-800"
                      >
                        {allergy.allergen}

                        {allergy.severity && (
                          <>
                            {" "}
                            —{" "}
                            {clinicalText(
                              language,
                              allergy.severity
                            )}
                          </>
                        )}

                        {allergy.reaction && (
                          <>
                            {" "}
                            —{" "}
                            {allergy.reaction}
                          </>
                        )}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-0.5 text-[10px] text-[#687970]">
                  {clinicalText(language, "No active structured allergy records were found for this resident.")}
                </p>
              )}
            </div>
          </div>
        )}


        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid min-h-full xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* MAIN FORM */}

            <div className="min-w-0 border-r border-[#C6D0C1]">
              <FormSection title={clinicalText(language, "Order Details")}>
                <div className="grid gap-x-4 gap-y-2 p-3 md:grid-cols-2">
                  <div className="grid grid-cols-[minmax(0,1fr)_95px] gap-1">
                    <TextField
                      label={clinicalText(language, "Order Date")}
                      required
                      type="date"
                      value={
                        form.orderDate
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "orderDate",
                          value
                        )
                      }
                    />

                    <TextField
                      label={clinicalText(language, "Time")}
                      required
                      type="time"
                      value={
                        form.orderTime
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "orderTime",
                          value
                        )
                      }
                    />
                  </div>


                  <SelectField
                    label={clinicalText(language, "Order Category")}
                    required
                    value={
                      clinicalText(
                        language,
                        category
                      )
                    }
                    disabled
                    options={[
                      category,
                    ]}
                    onChange={() => {}}
                  />


                  <div className="md:col-span-2">
                    <p className="mb-1 text-[10px] font-bold text-[#33483F]">
                      Communication Method{" "}
                      <span className="text-red-600">
                        *
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#40534B]">
                      {[
                        "Phone",
                        "Verbal",
                        "Prescriber Written",
                        "Prescriber Entered",
                      ].map(
                        (
                          method
                        ) => (
                          <label
                            key={
                              method
                            }
                            className="inline-flex items-center gap-1"
                          >
                            <input
                              type="radio"
                              name="communication-method"
                              checked={
                                form.communicationMethod ===
                                method
                              }
                              onChange={() =>
                                update(
                                  "communicationMethod",
                                  method
                                )
                              }
                            />

                            {clinicalText(
                              language,
                              method
                            )}
                          </label>
                        )
                      )}
                    </div>
                  </div>


                  <TextField
                    label={clinicalText(language, "Ordered By")}
                    required
                    value={
                      form.orderedBy
                    }
                    onChange={(
                      value
                    ) =>
                      update(
                        "orderedBy",
                        value
                      )
                    }
                    placeholder={clinicalText(language, "Ordering provider")}
                  />


                  <div className="hidden md:block" />


                  <div className="md:col-span-2">
                    <CategoryFields
                      category={
                        category
                      }
                      form={form}
                      update={
                        update
                      }
                    />
                  </div>
                </div>
              </FormSection>


              {/* SCHEDULING */}

              <FormSection title={clinicalText(language, "Scheduling Details")}>
                <div className="p-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="mr-1 text-[10px] font-bold text-[#33483F]">
                      {clinicalText(language, "Add Schedule:")}
                    </span>

                    {[
                      "Routine",
                      "PRN",
                      "One Time Only",
                      "Titration",
                      "STAT",
                    ].map(
                      (
                        schedule
                      ) => (
                        <button
                          key={
                            schedule
                          }
                          type="button"
                          onClick={() =>
                            chooseSchedule(
                              schedule
                            )
                          }
                          className={`
                            h-7 border
                            px-2.5
                            text-[10px]
                            font-bold

                            ${
                              form.scheduleType ===
                              schedule
                                ? "border-[#073B2F] bg-[#073B2F] text-white"
                                : "border-[#AEBBB3] bg-white text-[#3F534A] hover:bg-[#EEF2EF]"
                            }
                          `}
                        >
                          {clinicalText(
                            language,
                            schedule
                          )}
                        </button>
                      )
                    )}
                  </div>


                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <TextField
                      label={clinicalText(language, "Frequency")}
                      value={
                        form.frequency
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "frequency",
                          value
                        )
                      }
                      placeholder={clinicalText(language, "BID, Daily, q6h, q4h PRN...")}
                    />

                    <TextField
                      label={clinicalText(language, "Administration Time")}
                      type="time"
                      value={
                        form.administrationTime
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "administrationTime",
                          value
                        )
                      }
                    />

                    <TextField
                      label={clinicalText(language, "Indication")}
                      value={
                        form.indication
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "indication",
                          value
                        )
                      }
                      placeholder={
                        form.scheduleType ===
                        "PRN"
                          ? clinicalText(
                              language,
                              "Required for PRN orders"
                            )
                          : clinicalText(
                              language,
                              "Clinical indication"
                            )
                      }
                    />
                  </div>


                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <TextField
                      label={clinicalText(language, "Start Date")}
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "startDate",
                          value
                        )
                      }
                    />

                    <TextField
                      label={clinicalText(language, "End Date")}
                      type="date"
                      value={
                        form.endDate
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "endDate",
                          value
                        )
                      }
                    />

                    <TextField
                      label={clinicalText(language, "Next Review Date")}
                      type="date"
                      value={
                        form.reviewDate
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "reviewDate",
                          value
                        )
                      }
                    />
                  </div>


                  <label className="mt-3 block">
                    <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
                      {clinicalText(language, "Directions")}
                    </span>

                    <textarea
                      rows={3}
                      value={
                        form.directions
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          "directions",
                          event.target
                            .value
                        )
                      }
                      placeholder={clinicalText(language, "Complete order directions...")}
                      className="w-full resize-y border border-[#B8C5BE] px-2.5 py-2 text-[11px] outline-none focus:border-[#667F73]"
                    />
                  </label>
                </div>
              </FormSection>


              {/* SOURCE */}

              <FormSection title={clinicalText(language, "Source Details")}>
                <div className="grid gap-3 p-3 md:grid-cols-2">
                  <TextField
                    label={clinicalText(language, "Order Source")}
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
                  />


                  {category ===
                    "Pharmacy" && (
                    <TextField
                      label={clinicalText(language, "Pharmacy")}
                      value={
                        form.pharmacy
                      }
                      onChange={(
                        value
                      ) =>
                        update(
                          "pharmacy",
                          value
                        )
                      }
                      placeholder={clinicalText(language, "Pharmacy name")}
                    />
                  )}


                  <label className="md:col-span-2">
                    <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
                      {category ===
                      "Pharmacy"
                        ? clinicalText(
                            language,
                            "Pharmacy Notes"
                          )
                        : clinicalText(
                            language,
                            "Order Notes"
                          )}
                    </span>

                    <textarea
                      rows={2}
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
              </FormSection>


              {error && (
                <div className="m-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
                  {error}
                </div>
              )}
            </div>


            {/* ORDER SUMMARY */}

            <aside className="bg-[#F5F4DF] p-3">
              <div className="border border-[#AAA982] bg-[#FFFEEB]">
                <div className="border-b border-[#C8C6A1] px-2.5 py-1.5">
                  <p className="text-[11px] font-bold italic text-[#273C33]">
                    {clinicalText(language, "Order Summary:")}
                  </p>
                </div>

                <div className="min-h-[250px] p-3 text-[10px] leading-5 text-[#3F5049]">
                  <SummaryLine
                    label={clinicalText(language, "Resident")}
                    value={
                      residentName
                    }
                  />

                  <SummaryLine
                    label={clinicalText(language, "Category")}
                    value={
                      category
                    }
                  />

                  <SummaryLine
                    label={
                      clinicalText(
                        language,
                        labelForOrder(
                          category
                        )
                      )
                    }
                    value={
                      form.orderName
                    }
                  />

                  {form.dosage && (
                    <SummaryLine
                      label={clinicalText(language, "Dose")}
                      value={
                        form.dosage
                      }
                    />
                  )}

                  {form.route && (
                    <SummaryLine
                      label={clinicalText(language, "Route")}
                      value={
                        form.route
                      }
                    />
                  )}

                  <SummaryLine
                    label={clinicalText(language, "Schedule")}
                    value={
                      [
                        clinicalText(
                          language,
                          form.scheduleType
                        ),
                        form.frequency,
                        form.administrationTime,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " • "
                        )
                    }
                  />

                  <SummaryLine
                    label={clinicalText(language, "Directions")}
                    value={
                      summaryDirections
                    }
                  />

                  <SummaryLine
                    label={clinicalText(language, "Ordered By")}
                    value={
                      form.orderedBy
                    }
                  />
                </div>
              </div>


              <div className="mt-2 border border-[#AAA982] bg-[#FFFEEB] px-2.5 py-2">
                <p className="text-[10px] font-bold text-[#33483F]">
                  {clinicalText(language, "Additional Information")}
                </p>

                <p className="mt-1 text-[9px] leading-4 text-[#68766F]">
                  {clinicalText(
                    language,
                    "This order will be added to the resident's permanent Orders record."
                  )}
                  {category ===
                  "Pharmacy"
                    ? ` ${clinicalText(
                        language,
                        "A synchronized medication order will also be created for Medications and MAR."
                      )}`
                    : ""}
                </p>
              </div>
            </aside>
          </div>
        </div>


        {/* FOOTER */}

        <footer className="flex justify-center gap-1.5 border-t border-[#BFC9C3] bg-[#F3F2ED] px-3 py-2">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void saveOrder(
                false
              )
            }
            className="inline-flex h-8 items-center gap-1.5 border border-[#073B2F] bg-[#073B2F] px-3 text-[10px] font-bold text-white hover:bg-[#0D4A3A] disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle
                size={11}
                className="animate-spin"
              />
            ) : (
              <Save size={11} />
            )}

            {editing
              ? clinicalText(language, "Save Revision")
              : clinicalText(language, "Save")}
          </button>


          {!editing && (
            <button
              type="button"
              disabled={
                saving
              }
              onClick={() =>
                void saveOrder(
                  true
                )
              }
              className="h-8 border border-[#8E9D95] bg-white px-3 text-[10px] font-bold text-[#33483F] hover:bg-[#EDF1EE] disabled:opacity-50"
            >
              {clinicalText(
                language,
                "Queue & New"
              )}
            </button>
          )}


          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="h-8 border border-[#8E9D95] bg-white px-3 text-[10px] font-bold text-[#33483F] hover:bg-[#EDF1EE] disabled:opacity-50"
          >
            {clinicalText(language, "Cancel")}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}


function CategoryFields({
  category,
  form,
  update,
}: {
  category:
    OrderCategory;

  form: OrderForm;

  update: (
    field:
      keyof OrderForm,
    value:
      string | boolean
  ) => void;
}) {
  const { language } = useLanguage();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField
        label={
          clinicalText(
            language,
            labelForOrder(
              category
            )
          )
        }
        required
        value={
          form.orderName
        }
        onChange={(
          value
        ) =>
          update(
            "orderName",
            value
          )
        }
      />


      {category ===
        "Pharmacy" && (
        <>
          <TextField
            label={clinicalText(language, "Dosage")}
            required
            value={
              form.dosage
            }
            onChange={(
              value
            ) =>
              update(
                "dosage",
                value
              )
            }
            placeholder={clinicalText(language, "10 mg, 1 tablet, 5 mL...")}
          />

          <SelectField
            label={clinicalText(language, "Order Type")}
            value={
              form.orderType
            }
            onChange={(
              value
            ) =>
              update(
                "orderType",
                value
              )
            }
            options={[
              "",
              "Medication",
              "Treatment",
              "Controlled Medication",
            ]}
          />

          <SelectField
            label={clinicalText(language, "Route of Administration")}
            required
            value={
              form.route
            }
            onChange={(
              value
            ) =>
              update(
                "route",
                value
              )
            }
            options={[
              "",
              "Oral",
              "G-Tube",
              "PEG-Tube",
              "Sublingual",
              "Topical",
              "Inhalation",
              "Subcutaneous",
              "Intramuscular",
              "Intravenous",
              "Rectal",
              "Ophthalmic",
              "Otic",
              "Transdermal",
              "Other",
            ]}
          />

          <label className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#40534B]">
            <input
              type="checkbox"
              checked={
                form.daw
              }
              onChange={(
                event
              ) =>
                update(
                  "daw",
                  event.target
                    .checked
                )
              }
            />

            {clinicalText(language, "Dispense as Written (DAW)")}
          </label>
        </>
      )}


      {category ===
        "Diagnostic" && (
        <>
          <TextField
            label={clinicalText(language, "Body Site")}
            value={
              form.bodySite
            }
            onChange={(
              value
            ) =>
              update(
                "bodySite",
                value
              )
            }
            placeholder={clinicalText(language, "Chest, left hip, abdomen...")}
          />

          <SelectField
            label={clinicalText(language, "Priority")}
            value={
              form.priority
            }
            onChange={(
              value
            ) =>
              update(
                "priority",
                value
              )
            }
            options={[
              "Routine",
              "Urgent",
              "STAT",
            ]}
          />
        </>
      )}


      {category ===
        "Laboratory" && (
        <>
          <TextField
            label={clinicalText(language, "Specimen")}
            value={
              form.specimen
            }
            onChange={(
              value
            ) =>
              update(
                "specimen",
                value
              )
            }
            placeholder={clinicalText(language, "Blood, urine, stool...")}
          />

          <SelectField
            label={clinicalText(language, "Priority")}
            value={
              form.priority
            }
            onChange={(
              value
            ) =>
              update(
                "priority",
                value
              )
            }
            options={[
              "Routine",
              "Urgent",
              "STAT",
            ]}
          />

          <label className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#40534B]">
            <input
              type="checkbox"
              checked={
                form.fastingRequired
              }
              onChange={(
                event
              ) =>
                update(
                  "fastingRequired",
                  event.target
                    .checked
                )
              }
            />

            {clinicalText(language, "Fasting Required")}
          </label>
        </>
      )}


      {category ===
        "Diet" && (
        <>
          <TextField
            label={clinicalText(language, "Texture")}
            value={
              form.texture
            }
            onChange={(
              value
            ) =>
              update(
                "texture",
                value
              )
            }
            placeholder={clinicalText(language, "Regular, mechanical soft, pureed...")}
          />

          <TextField
            label={clinicalText(language, "Liquid Consistency")}
            value={
              form.liquidConsistency
            }
            onChange={(
              value
            ) =>
              update(
                "liquidConsistency",
                value
              )
            }
            placeholder={clinicalText(language, "Thin, nectar thick, honey thick...")}
          />

          <TextField
            label={clinicalText(language, "Restrictions")}
            value={
              form.restrictions
            }
            onChange={(
              value
            ) =>
              update(
                "restrictions",
                value
              )
            }
            placeholder={clinicalText(language, "Low sodium, diabetic, renal...")}
          />
        </>
      )}


      {category ===
        "Supplement" && (
        <>
          <TextField
            label={clinicalText(language, "Amount / Dose")}
            value={
              form.amount
            }
            onChange={(
              value
            ) =>
              update(
                "amount",
                value
              )
            }
            placeholder={clinicalText(language, "30 mL, 1 packet...")}
          />

          <SelectField
            label={clinicalText(language, "Route")}
            value={
              form.route
            }
            onChange={(
              value
            ) =>
              update(
                "route",
                value
              )
            }
            options={[
              "",
              "Oral",
              "G-Tube",
              "PEG-Tube",
            ]}
          />
        </>
      )}


      {category ===
        "Enteral Feed" && (
        <>
          <SelectField
            label={clinicalText(language, "Enteral Route")}
            required
            value={
              form.route
            }
            onChange={(
              value
            ) =>
              update(
                "route",
                value
              )
            }
            options={[
              "",
              "G-Tube",
              "PEG-Tube",
              "J-Tube",
              "NG Tube",
              "NJ Tube",
              "Other",
            ]}
          />

          <TextField
            label={clinicalText(language, "Rate")}
            required
            value={
              form.rate
            }
            onChange={(
              value
            ) =>
              update(
                "rate",
                value
              )
            }
            placeholder="35 mL/hr"
          />

          <TextField
            label={clinicalText(language, "Free-Water Flush")}
            value={
              form.flush
            }
            onChange={(
              value
            ) =>
              update(
                "flush",
                value
              )
            }
            placeholder="60 mL every 4 hours"
          />

          <TextField
            label={clinicalText(language, "Hold Parameters")}
            value={
              form.holdParameters
            }
            onChange={(
              value
            ) =>
              update(
                "holdParameters",
                value
              )
            }
            placeholder={clinicalText(language, "Hold for residual >...")}
          />
        </>
      )}


      {category ===
        "Other" && (
        <>
          <TextField
            label={clinicalText(language, "Order Type")}
            value={
              form.orderType
            }
            onChange={(
              value
            ) =>
              update(
                "orderType",
                value
              )
            }
            placeholder={clinicalText(language, "Wound care, oxygen, monitoring...")}
          />

          <TextField
            label={clinicalText(language, "Route / Delivery Method")}
            value={
              form.route
            }
            onChange={(
              value
            ) =>
              update(
                "route",
                value
              )
            }
          />
        </>
      )}
    </div>
  );
}


function FormSection({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section>
      <div className="border-y border-[#889B7A] bg-[#91A47E] px-2 py-1 first:border-t-0">
        <h3 className="text-[11px] font-bold text-white">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}


function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
        {label}

        {required && (
          <span className="ml-0.5 text-red-600">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
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


function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;

  options: string[];

  onChange: (
    value: string
  ) => void;

  required?: boolean;
  disabled?: boolean;
}) {
  const { language } = useLanguage();

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
        {label}

        {required && (
          <span className="ml-0.5 text-red-600">
            *
          </span>
        )}
      </span>

      <select
        value={value}
        disabled={
          disabled
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        className="h-8 w-full border border-[#B8C5BE] bg-white px-2 text-[11px] text-[#253A31] outline-none focus:border-[#667F73] disabled:bg-[#F3F3EF]"
      >
        {options.map(
          (option) => (
            <option
              key={
                option ||
                "__blank"
              }
              value={option}
            >
              {clinicalText(
                language,
                option || "Select..."
              )}
            </option>
          )
        )}
      </select>
    </label>
  );
}


function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <p>
      <strong>
        {label}:
      </strong>{" "}
      {value}
    </p>
  );
}
