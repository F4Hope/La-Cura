import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import ResidentClinicalTabs, {
  normalizeResidentTab,
  type ResidentTabKey,
} from "@/components/ResidentClinicalTabs";

import ResidentOrdersTab from "@/components/orders/ResidentOrdersTab";

import ResidentAllergiesTab from "@/components/allergies/ResidentAllergiesTab";

import ResidentResultsTab from "@/components/results/ResidentResultsTab";

import ResidentImmunizationsTab from "@/components/immunizations/ResidentImmunizationsTab";

import {
  getMedicationHistory,
} from "@/lib/medicationHistory";

import {
  getResidentTimelineServer,
} from "@/lib/residentTimelineServer";

import {
  getResidentPhotoSignedUrl,
} from "@/lib/residentPhotos";

import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams?: Promise<{
    tab?:
      | string
      | string[];
  }>;
};

type ResidentRecord = {
  id: number;
  full_name?: string | null;
  age?: number | null;
  room?: string | null;
  status?: string | null;
  emergency_contact?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  date_admitted?: string | null;
  diagnosis?: string | null;
  allergies?: string | null;
  blood_group?: string | null;
  primary_doctor?: string | null;
  next_of_kin?: string | null;
  next_of_kin_phone?: string | null;
  notes?: string | null;
  photo_url?: string | null;
};

type TimelineItem = {
  type?: string | null;
  icon?: string | null;
  date?: string | null;
  title?: string | null;
  subtitle?: string | null;
};

type MedicationRelation = {
  medication_name?: string | null;
  dosage?: string | null;
};

type MedicationHistoryRow = {
  id: number;
  status?: string | null;
  administered_at?: string | null;
  administered_by?: string | null;
  reason?: string | null;
  notes?: string | null;

  medications?:
    | MedicationRelation
    | MedicationRelation[]
    | null;
};

type VitalRecord = {
  temperature?:
    | number
    | string
    | null;

  pulse?:
    | number
    | string
    | null;

  systolic?:
    | number
    | string
    | null;

  diastolic?:
    | number
    | string
    | null;

  oxygen_saturation?:
    | number
    | string
    | null;

  pain_score?:
    | number
    | string
    | null;

  recorded_at?:
    | string
    | null;

  recorded_by?:
    | string
    | null;
};


function cleanText(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Not recorded";
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


function formatDateTime(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Not recorded";
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
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function formatAge(
  value:
    | number
    | null
    | undefined
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    return "Not recorded";
  }

  return `${value} years`;
}


function getResidentName(
  resident: ResidentRecord
) {
  return (
    cleanText(
      resident.full_name
    ) ||
    "Unnamed Resident"
  );
}


function getInitials(
  resident: ResidentRecord
) {
  return getResidentName(
    resident
  )
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join("");
}


function isNoKnownAllergy(
  value: string
) {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    "none",
    "nka",
    "nkda",
    "no known allergies",
    "no known allergy",
    "no known drug allergies",
  ].includes(normalized);
}


function displayVital(
  value: unknown,
  suffix = ""
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return `${value}${suffix}`;
}


function getMedicationDetails(
  item: MedicationHistoryRow
) {
  const relation =
    Array.isArray(
      item.medications
    )
      ? item.medications[0]
      : item.medications;

  return {
    name:
      cleanText(
        relation
          ?.medication_name
      ) ||
      "Medication",

    dosage:
      cleanText(
        relation?.dosage
      ) ||
      "Not recorded",
  };
}


function medicationStatusStyle(
  value:
    | string
    | null
    | undefined
) {
  const status =
    cleanText(
      value
    ).toLowerCase();

  if (
    status.includes(
      "administer"
    ) ||
    status.includes(
      "given"
    ) ||
    status.includes(
      "complete"
    )
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (
    status.includes(
      "refus"
    ) ||
    status.includes(
      "miss"
    ) ||
    status.includes(
      "held"
    )
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}


function tabTitle(
  tab: ResidentTabKey
) {
  const titles:
    Record<
      ResidentTabKey,
      string
    > = {
      dash:
        "Resident Dashboard",
      profile:
        "Resident Profile",
      census:
        "Census Information",
      "med-diag":
        "Medical Diagnosis",
      allergies:
        "Allergies",
      immun:
        "Immunizations",
      orders:
        "Orders",
      vitals:
        "Weights / Vitals",
      results:
        "Results",
      mds:
        "MDS",
      assmnts:
        "Assessments",
      therapy:
        "Therapy",
      "prog-notes":
        "Progress Notes",
      "care-plan":
        "Care Plan",
      tasks:
        "Tasks",
      misc:
        "Miscellaneous",
    };

  return titles[tab];
}


export default async function ResidentPage({
  params,
  searchParams,
}: Props) {
  const { id } =
    await params;

  const query =
    searchParams
      ? await searchParams
      : {};

  const activeTab =
    normalizeResidentTab(
      query.tab
    );

  const residentId =
    Number(id);

  if (
    !Number.isInteger(
      residentId
    ) ||
    residentId <= 0
  ) {
    notFound();
  }

  const supabase =
    await createClient();

  const [
    residentResult,
    timelineResult,
    medicationHistoryResult,
    recentVitalsResult,
  ] = await Promise.all([
    supabase
      .from("residents")
      .select("*")
      .eq(
        "id",
        residentId
      )
      .maybeSingle(),

    getResidentTimelineServer(
      residentId
    ),

    getMedicationHistory(
      residentId
    ),

    supabase
      .from("vital_signs")
      .select(
        "temperature, pulse, systolic, diastolic, oxygen_saturation, pain_score, recorded_at, recorded_by"
      )
      .eq(
        "resident_id",
        residentId
      )
      .order(
        "recorded_at",
        {
          ascending: false,
        }
      )
      .limit(20),
  ]);

  if (
    residentResult.error ||
    !residentResult.data
  ) {
    notFound();
  }

  const resident =
    residentResult.data as
      ResidentRecord;

  resident.photo_url =
    await getResidentPhotoSignedUrl(
      supabase,
      resident.photo_url
    );

  const timeline =
    (timelineResult ??
      []) as TimelineItem[];

  const medications =
    (medicationHistoryResult ??
      []) as MedicationHistoryRow[];

  const recentVitals =
    (recentVitalsResult.data ??
      []) as VitalRecord[];

  const latestVital =
    recentVitals[0] ??
    null;

  const residentName =
    getResidentName(
      resident
    );

  const allergies =
    cleanText(
      resident.allergies
    );

  const hasRecordedAllergy =
    !isNoKnownAllergy(
      allergies
    );

  const status =
    cleanText(
      resident.status
    ) ||
    "Not recorded";

  const progressNotes =
    timeline.filter(
      (item) => {
        const type =
          cleanText(
            item.type
          ).toLowerCase();

        return (
          type.includes(
            "note"
          ) ||
          type.includes(
            "nursing"
          ) ||
          type.includes(
            "progress"
          )
        );
      }
    );

  const incidentCount =
    timeline.filter(
      (item) =>
        cleanText(
          item.type
        )
          .toLowerCase()
          .includes(
            "incident"
          )
    ).length;

  const residentQuery =
    `?residentId=${resident.id}`;

  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1A2923]">
      {/* BREADCRUMB / RECORD TOOLBAR */}

      <div className="border-b border-[#C9D3CE] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-3 py-2 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex min-w-0 items-center gap-2 text-[11px]">
            <Link
              href="/residents"
              className="font-semibold text-[#073B2F] hover:underline"
            >
              Residents
            </Link>

            <span className="text-[#94A09A]">
              /
            </span>

            <span className="truncate text-[#53675E]">
              {residentName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <ClinicalAction
              href={`/add-vitals${residentQuery}`}
              label="Record Vitals"
              primary
            />

            <ClinicalAction
              href={`/add-medication${residentQuery}`}
              label="Add Medication"
            />

            <ClinicalAction
              href={`/add-nursing-note${residentQuery}`}
              label="Progress Note"
            />

            <ClinicalAction
              href={`/add-incident-report${residentQuery}`}
              label="Incident"
              danger
            />
          </div>
        </div>
      </div>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-5">
        {/* RESIDENT BANNER */}

        <section className="border border-[#BFCBC5] bg-white">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_560px]">
            {/* RESIDENT IDENTITY */}

            <div className="flex min-w-0 gap-3 border-b border-[#D1DAD5] p-3 lg:border-b-0 lg:border-r">
              {resident.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    resident.photo_url
                  }
                  alt=""
                  className="
                    h-[92px] w-[78px]
                    shrink-0
                    rounded-[4px]
                    border border-[#BFCBC5]
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex h-[92px]
                    w-[78px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    border-[#BFCBC5]
                    bg-[#E6EEE8]
                    text-lg
                    font-bold
                    text-[#073B2F]
                  "
                >
                  {getInitials(
                    resident
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="truncate text-[22px] font-bold tracking-[-0.025em] text-[#073B2F]">
                    {residentName}
                  </h1>

                  <span className="rounded-[3px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {status}
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] font-medium text-[#75847D]">
                  Resident #
                  {resident.id}
                </p>

                <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[11px] sm:grid-cols-2 xl:grid-cols-4">
                  <ResidentBannerField
                    label="DOB / Age"
                    value={`${formatDate(
                      resident.date_of_birth
                    )} • ${formatAge(
                      resident.age
                    )}`}
                  />

                  <ResidentBannerField
                    label="Sex"
                    value={
                      cleanText(
                        resident.gender
                      ) ||
                      "Not recorded"
                    }
                  />

                  <ResidentBannerField
                    label="Room"
                    value={
                      cleanText(
                        resident.room
                      ) ||
                      "Unassigned"
                    }
                  />

                  <ResidentBannerField
                    label="Physician"
                    value={
                      cleanText(
                        resident.primary_doctor
                      ) ||
                      "Not assigned"
                    }
                  />
                </div>
              </div>
            </div>


            {/* LATEST VITALS */}

            <div className="bg-[#FBFAF7]">
              <div className="border-b border-[#D4DDD8] px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#4D6158]">
                    Most Recent Vitals
                  </p>

                  <p className="text-[9px] text-[#839089]">
                    {latestVital
                      ? formatDateTime(
                          latestVital.recorded_at
                        )
                      : "No vitals recorded"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-[#D7DFDB] sm:grid-cols-5">
                <HeaderVital
                  label="BP"
                  value={
                    latestVital
                      ?.systolic !==
                      null &&
                    latestVital
                      ?.systolic !==
                      undefined &&
                    latestVital
                      ?.diastolic !==
                      null &&
                    latestVital
                      ?.diastolic !==
                      undefined
                      ? `${latestVital.systolic}/${latestVital.diastolic}`
                      : "—"
                  }
                />

                <HeaderVital
                  label="Temp"
                  value={displayVital(
                    latestVital
                      ?.temperature,
                    "°C"
                  )}
                />

                <HeaderVital
                  label="Pulse"
                  value={displayVital(
                    latestVital
                      ?.pulse,
                    ""
                  )}
                />

                <HeaderVital
                  label="O₂"
                  value={displayVital(
                    latestVital
                      ?.oxygen_saturation,
                    "%"
                  )}
                />

                <HeaderVital
                  label="Pain"
                  value={displayVital(
                    latestVital
                      ?.pain_score,
                    "/10"
                  )}
                />
              </div>
            </div>
          </div>


          {/* ALLERGY / SPECIAL INSTRUCTIONS */}

          <div
            className={`
              grid border-t
              text-[11px]
              md:grid-cols-2

              ${
                hasRecordedAllergy
                  ? "border-red-200"
                  : "border-[#CBD6D0]"
              }
            `}
          >
            <div
              className={`
                flex min-w-0
                items-start gap-2
                border-b px-3 py-2
                md:border-b-0
                md:border-r

                ${
                  hasRecordedAllergy
                    ? "border-red-200 bg-red-50"
                    : "border-[#D5DDD9] bg-[#F3F7F4]"
                }
              `}
            >
              <span
                className={`
                  shrink-0 font-bold
                  uppercase

                  ${
                    hasRecordedAllergy
                      ? "text-red-700"
                      : "text-[#365C4C]"
                  }
                `}
              >
                Allergies:
              </span>

              <span
                className={`
                  min-w-0 break-words
                  font-semibold

                  ${
                    hasRecordedAllergy
                      ? "text-red-800"
                      : "text-[#40564D]"
                  }
                `}
              >
                {hasRecordedAllergy
                  ? allergies
                  : "No known allergies"}
              </span>
            </div>

            <div className="flex min-w-0 items-start gap-2 bg-[#FFFDF8] px-3 py-2">
              <span className="shrink-0 font-bold uppercase text-[#796429]">
                Special Instructions:
              </span>

              <span className="min-w-0 break-words text-[#4C5E56]">
                {cleanText(
                  resident.notes
                ) ||
                  "No special instructions recorded"}
              </span>
            </div>
          </div>


          {/* PCC SUB-TABS */}

          <ResidentClinicalTabs
            residentId={
              resident.id
            }
            activeTab={
              activeTab
            }
          />
        </section>


        {/* ACTIVE RECORD HEADER */}

        <section className="mt-3 border border-[#C7D1CC] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#D4DDD8] bg-[#E7EDE9] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-[#1E352C]">
                {tabTitle(
                  activeTab
                )}
              </h2>

              <p className="mt-0.5 text-[10px] text-[#6B7B74]">
                {residentName} • Resident #
                {resident.id}
              </p>
            </div>

            <div className="text-[10px] text-[#728179]">
              Admission:{" "}
              <strong className="font-semibold text-[#42564D]">
                {formatDate(
                  resident.date_admitted
                )}
              </strong>
            </div>
          </div>

          <ResidentTabContent
            tab={activeTab}
            resident={
              resident
            }
            latestVital={
              latestVital
            }
            recentVitals={
              recentVitals
            }
            medications={
              medications
            }
            timeline={timeline}
            progressNotes={
              progressNotes
            }
            hasRecordedAllergy={
              hasRecordedAllergy
            }
            allergies={
              allergies
            }
            incidentCount={
              incidentCount
            }
          />
        </section>
      </main>
    </div>
  );
}


function ResidentTabContent({
  tab,
  resident,
  latestVital,
  recentVitals,
  medications,
  timeline,
  progressNotes,
  hasRecordedAllergy,
  allergies,
  incidentCount,
}: {
  tab: ResidentTabKey;
  resident: ResidentRecord;
  latestVital:
    | VitalRecord
    | null;
  recentVitals: VitalRecord[];
  medications:
    MedicationHistoryRow[];
  timeline: TimelineItem[];
  progressNotes:
    TimelineItem[];
  hasRecordedAllergy: boolean;
  allergies: string;
  incidentCount: number;
}) {
  if (tab === "profile") {
    return (
      <TwoColumnRecord>
        <RecordPanel title="Demographics">
          <RecordRows
            rows={[
              [
                "Resident Name",
                getResidentName(
                  resident
                ),
              ],
              [
                "Resident ID",
                String(
                  resident.id
                ),
              ],
              [
                "Date of Birth",
                formatDate(
                  resident.date_of_birth
                ),
              ],
              [
                "Age",
                formatAge(
                  resident.age
                ),
              ],
              [
                "Sex",
                cleanText(
                  resident.gender
                ) ||
                  "Not recorded",
              ],
              [
                "Blood Group",
                cleanText(
                  resident.blood_group
                ) ||
                  "Not recorded",
              ],
            ]}
          />
        </RecordPanel>

        <RecordPanel title="Contact / Care Team">
          <RecordRows
            rows={[
              [
                "Primary Physician",
                cleanText(
                  resident.primary_doctor
                ) ||
                  "Not assigned",
              ],
              [
                "Next of Kin",
                cleanText(
                  resident.next_of_kin
                ) ||
                  "Not recorded",
              ],
              [
                "Next of Kin Phone",
                cleanText(
                  resident.next_of_kin_phone
                ) ||
                  "Not recorded",
              ],
              [
                "Emergency Contact",
                cleanText(
                  resident.emergency_contact
                ) ||
                  "Not recorded",
              ],
              [
                "Room",
                cleanText(
                  resident.room
                ) ||
                  "Unassigned",
              ],
              [
                "Status",
                cleanText(
                  resident.status
                ) ||
                  "Not recorded",
              ],
            ]}
          />
        </RecordPanel>
      </TwoColumnRecord>
    );
  }


  if (tab === "census") {
    return (
      <RecordPanel title="Census / Admission">
        <RecordRows
          rows={[
            [
              "Current Status",
              cleanText(
                resident.status
              ) ||
                "Not recorded",
            ],
            [
              "Room / Bed",
              cleanText(
                resident.room
              ) ||
                "Unassigned",
            ],
            [
              "Admission Date",
              formatDate(
                resident.date_admitted
              ),
            ],
            [
              "Primary Physician",
              cleanText(
                resident.primary_doctor
              ) ||
                "Not assigned",
            ],
          ]}
        />
      </RecordPanel>
    );
  }


  if (
    tab === "med-diag"
  ) {
    return (
      <RecordPanel title="Medical Diagnoses">
        <div className="p-3">
          <div className="border border-[#D4DDD8] bg-[#FBFAF7] p-3">
            <p className="text-[10px] font-bold uppercase text-[#64756D]">
              Current Diagnosis
            </p>

            <p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-[#293E35]">
              {cleanText(
                resident.diagnosis
              ) ||
                "No diagnosis recorded."}
            </p>
          </div>
        </div>
      </RecordPanel>
    );
  }


  if (
    tab === "allergies"
  ) {
    return (
      <ResidentAllergiesTab
        residentId={
          resident.id
        }
        residentName={
          getResidentName(
            resident
          )
        }
      />
    );
  }
  if (
    tab === "vitals"
  ) {
    return (
      <VitalsTable
        vitals={
          recentVitals
        }
      />
    );
  }


  if (
    tab === "prog-notes"
  ) {
    return (
      <ProgressNotesTable
        items={
          progressNotes
        }
      />
    );
  }


  if (
    tab === "care-plan"
  ) {
    return (
      <div className="p-4">
        <div className="border border-[#D2DBD6] bg-[#FBFAF7] p-4">
          <p className="text-sm font-semibold text-[#263A32]">
            Resident Care Plan
          </p>

          <p className="mt-1 text-xs leading-5 text-[#617169]">
            Review problems, goals, interventions, and care-plan follow-up for this resident.
          </p>

          <Link
            href="/care-plans"
            className="mt-3 inline-flex h-8 items-center rounded-[4px] border border-[#073B2F] bg-[#073B2F] px-3 text-xs font-bold text-white hover:bg-[#0D4A3A]"
          >
            Open Care Plans
          </Link>
        </div>
      </div>
    );
  }


  if (
    tab === "misc"
  ) {
    return (
      <RecordPanel title="Resident Notes / Miscellaneous">
        <div className="p-3">
          <p className="whitespace-pre-wrap text-xs leading-5 text-[#40544B]">
            {cleanText(
              resident.notes
            ) ||
              "No miscellaneous resident notes recorded."}
          </p>
        </div>
      </RecordPanel>
    );
  }


  if (
    tab === "orders"
  ) {
    return (
      <ResidentOrdersTab
        residentId={
          resident.id
        }
        residentName={
          getResidentName(
            resident
          )
        }
        primaryDoctor={
          cleanText(
            resident.primary_doctor
          )
        }
      />
    );
  }


  if (
    tab === "immun"
  ) {
    return (
      <ResidentImmunizationsTab
        residentId={
          resident.id
        }
        residentName={
          getResidentName(
            resident
          )
        }
      />
    );
  }
  if (
    tab === "results"
  ) {
    return (
      <ResidentResultsTab
        residentId={
          resident.id
        }
        residentName={
          getResidentName(
            resident
          )
        }
      />
    );
  }
  if (
    tab === "assmnts"
  ) {
    return (
      <EmptyModule
        title="Assessments"
        description="Resident assessments will appear here as assessment modules are added."
      />
    );
  }


  if (
    tab === "therapy"
  ) {
    return (
      <EmptyModule
        title="Therapy"
        description="Therapy documentation and treatment records will appear here."
      />
    );
  }


  if (
    tab === "tasks"
  ) {
    return (
      <EmptyModule
        title="Tasks"
        description="Resident-specific clinical tasks will appear here."
      />
    );
  }


  return (
    <DashboardTab
      resident={
        resident
      }
      latestVital={
        latestVital
      }
      medications={
        medications
      }
      timeline={
        timeline
      }
      progressNotes={
        progressNotes
      }
      incidentCount={
        incidentCount
      }
    />
  );
}


function DashboardTab({
  resident,
  latestVital,
  medications,
  timeline,
  progressNotes,
  incidentCount,
}: {
  resident: ResidentRecord;
  latestVital:
    | VitalRecord
    | null;
  medications:
    MedicationHistoryRow[];
  timeline:
    TimelineItem[];
  progressNotes:
    TimelineItem[];
  incidentCount: number;
}) {
  const latestMeds =
    medications.slice(0, 6);

  const latestActivity =
    timeline.slice(0, 6);

  return (
    <div className="grid gap-3 bg-[#F3F2ED] p-3 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="min-w-0 space-y-3">
        <RecordPanel title="Recent Medication Administration">
          <MedicationTable
            medications={
              latestMeds
            }
            residentId={
              resident.id
            }
          />
        </RecordPanel>

        <RecordPanel title="Recent Clinical Activity">
          <TimelineTable
            items={
              latestActivity
            }
          />
        </RecordPanel>
      </div>


      <div className="space-y-3">
        <RecordPanel title="Current Clinical Snapshot">
          <div className="grid grid-cols-2 gap-px bg-[#D8DFDB]">
            <SnapshotCell
              label="Blood Pressure"
              value={
                latestVital
                  ?.systolic !==
                  null &&
                latestVital
                  ?.systolic !==
                  undefined &&
                latestVital
                  ?.diastolic !==
                  null &&
                latestVital
                  ?.diastolic !==
                  undefined
                  ? `${latestVital.systolic}/${latestVital.diastolic}`
                  : "—"
              }
            />

            <SnapshotCell
              label="Temperature"
              value={displayVital(
                latestVital
                  ?.temperature,
                "°C"
              )}
            />

            <SnapshotCell
              label="Pulse"
              value={displayVital(
                latestVital
                  ?.pulse,
                " bpm"
              )}
            />

            <SnapshotCell
              label="Oxygen"
              value={displayVital(
                latestVital
                  ?.oxygen_saturation,
                "%"
              )}
            />
          </div>
        </RecordPanel>


        <RecordPanel title="Clinical Record Summary">
          <div className="grid grid-cols-2 gap-px bg-[#D8DFDB]">
            <SummaryMetric
              label="Medication Records"
              value={
                medications.length
              }
            />

            <SummaryMetric
              label="Clinical Events"
              value={
                timeline.length
              }
            />

            <SummaryMetric
              label="Progress Notes"
              value={
                progressNotes.length
              }
            />

            <SummaryMetric
              label="Incidents"
              value={
                incidentCount
              }
              warning={
                incidentCount > 0
              }
            />
          </div>
        </RecordPanel>


        <RecordPanel title="Resident Summary">
          <RecordRows
            rows={[
              [
                "Diagnosis",
                cleanText(
                  resident.diagnosis
                ) ||
                  "Not recorded",
              ],
              [
                "Room",
                cleanText(
                  resident.room
                ) ||
                  "Unassigned",
              ],
              [
                "Physician",
                cleanText(
                  resident.primary_doctor
                ) ||
                  "Not assigned",
              ],
              [
                "Blood Group",
                cleanText(
                  resident.blood_group
                ) ||
                  "Not recorded",
              ],
            ]}
          />
        </RecordPanel>
      </div>
    </div>
  );
}


function MedicationTable({
  medications,
  residentId,
}: {
  medications:
    MedicationHistoryRow[];
  residentId: number;
}) {
  if (
    medications.length ===
    0
  ) {
    return (
      <TableEmpty message="No medication administration records." />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse">
          <thead>
            <tr className="bg-[#EEF2EF] text-[10px] font-bold uppercase text-[#40544B]">
              <ClinicalHead>
                Medication
              </ClinicalHead>

              <ClinicalHead>
                Dosage
              </ClinicalHead>

              <ClinicalHead>
                Status
              </ClinicalHead>

              <ClinicalHead>
                Date / Time
              </ClinicalHead>

              <ClinicalHead>
                Staff
              </ClinicalHead>

              <ClinicalHead>
                Notes
              </ClinicalHead>
            </tr>
          </thead>

          <tbody>
            {medications.map(
              (
                item,
                index
              ) => {
                const med =
                  getMedicationDetails(
                    item
                  );

                return (
                  <tr
                    key={item.id}
                    className={`
                      border-b
                      border-[#E0E6E3]
                      text-[11px]
                      ${
                        index %
                          2 ===
                        0
                          ? "bg-white"
                          : "bg-[#FBFAF7]"
                      }
                    `}
                  >
                    <td className="px-3 py-2 font-semibold text-[#263B32]">
                      {med.name}
                    </td>

                    <td className="px-3 py-2 text-[#4B5F56]">
                      {
                        med.dosage
                      }
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`
                          rounded-[3px]
                          border
                          px-1.5 py-0.5
                          text-[10px]
                          font-semibold
                          ${medicationStatusStyle(
                            item.status
                          )}
                        `}
                      >
                        {cleanText(
                          item.status
                        ) ||
                          "Not recorded"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[#4B5F56]">
                      {formatDateTime(
                        item.administered_at
                      )}
                    </td>

                    <td className="px-3 py-2 text-[#4B5F56]">
                      {cleanText(
                        item.administered_by
                      ) ||
                        "—"}
                    </td>

                    <td className="max-w-[240px] px-3 py-2 text-[#617169]">
                      <span className="block truncate">
                        {cleanText(
                          item.notes
                        ) ||
                          cleanText(
                            item.reason
                          ) ||
                          "—"}
                      </span>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#D8DFDB] bg-[#FBFAF7] px-3 py-2 text-right">
        <Link
          href={`/residents/${residentId}/medication-history`}
          className="text-[11px] font-bold text-[#073B2F] hover:underline"
        >
          Complete medication history
        </Link>
      </div>
    </>
  );
}


function TimelineTable({
  items,
}: {
  items: TimelineItem[];
}) {
  if (items.length === 0) {
    return (
      <TableEmpty message="No clinical activity recorded." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse">
        <thead>
          <tr className="bg-[#EEF2EF] text-[10px] font-bold uppercase text-[#40544B]">
            <ClinicalHead>
              Date / Time
            </ClinicalHead>

            <ClinicalHead>
              Type
            </ClinicalHead>

            <ClinicalHead>
              Entry
            </ClinicalHead>

            <ClinicalHead>
              Detail
            </ClinicalHead>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (
              item,
              index
            ) => (
              <tr
                key={`${item.type}-${item.date}-${index}`}
                className={`
                  border-b
                  border-[#E0E6E3]
                  text-[11px]

                  ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-[#FBFAF7]"
                  }
                `}
              >
                <td className="whitespace-nowrap px-3 py-2 text-[#52645C]">
                  {formatDateTime(
                    item.date
                  )}
                </td>

                <td className="px-3 py-2 font-semibold text-[#274036]">
                  {cleanText(
                    item.type
                  ) ||
                    "Clinical Record"}
                </td>

                <td className="max-w-[260px] px-3 py-2 text-[#40544B]">
                  {cleanText(
                    item.title
                  ) || "—"}
                </td>

                <td className="max-w-[360px] px-3 py-2 text-[#617169]">
                  <span className="block truncate">
                    {cleanText(
                      item.subtitle
                    ) || "—"}
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function ProgressNotesTable({
  items,
}: {
  items: TimelineItem[];
}) {
  if (items.length === 0) {
    return (
      <TableEmpty message="No progress notes recorded for this resident." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase text-[#40544B]">
            <ClinicalHead>
              Date / Time
            </ClinicalHead>

            <ClinicalHead>
              Type
            </ClinicalHead>

            <ClinicalHead>
              Note
            </ClinicalHead>

            <ClinicalHead>
              Detail
            </ClinicalHead>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (
              item,
              index
            ) => (
              <tr
                key={`${item.type}-${item.date}-${index}`}
                className={`
                  border-b
                  border-[#E0E6E3]
                  align-top
                  text-[11px]

                  ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-[#FBFAF7]"
                  }
                `}
              >
                <td className="whitespace-nowrap px-3 py-2 text-[#52645C]">
                  {formatDateTime(
                    item.date
                  )}
                </td>

                <td className="px-3 py-2 font-semibold text-[#274036]">
                  {cleanText(
                    item.type
                  ) ||
                    "Progress Note"}
                </td>

                <td className="px-3 py-2 text-[#2E443A]">
                  {cleanText(
                    item.title
                  ) || "—"}
                </td>

                <td className="px-3 py-2 leading-5 text-[#5B6D65]">
                  {cleanText(
                    item.subtitle
                  ) || "—"}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function VitalsTable({
  vitals,
}: {
  vitals: VitalRecord[];
}) {
  if (vitals.length === 0) {
    return (
      <TableEmpty message="No vital signs recorded for this resident." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase text-[#40544B]">
            <ClinicalHead>
              Date / Time
            </ClinicalHead>

            <ClinicalHead>
              BP
            </ClinicalHead>

            <ClinicalHead>
              Temp
            </ClinicalHead>

            <ClinicalHead>
              Pulse
            </ClinicalHead>

            <ClinicalHead>
              O₂
            </ClinicalHead>

            <ClinicalHead>
              Pain
            </ClinicalHead>

            <ClinicalHead>
              Recorded By
            </ClinicalHead>
          </tr>
        </thead>

        <tbody>
          {vitals.map(
            (
              vital,
              index
            ) => (
              <tr
                key={`${vital.recorded_at}-${index}`}
                className={`
                  border-b
                  border-[#E0E6E3]
                  text-[11px]

                  ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-[#FBFAF7]"
                  }
                `}
              >
                <td className="whitespace-nowrap px-3 py-2 text-[#52645C]">
                  {formatDateTime(
                    vital.recorded_at
                  )}
                </td>

                <td className="px-3 py-2 font-semibold text-[#263B32]">
                  {vital.systolic !==
                    null &&
                  vital.systolic !==
                    undefined &&
                  vital.diastolic !==
                    null &&
                  vital.diastolic !==
                    undefined
                    ? `${vital.systolic}/${vital.diastolic}`
                    : "—"}
                </td>

                <td className="px-3 py-2 text-[#40544B]">
                  {displayVital(
                    vital.temperature,
                    "°C"
                  )}
                </td>

                <td className="px-3 py-2 text-[#40544B]">
                  {displayVital(
                    vital.pulse,
                    ""
                  )}
                </td>

                <td className="px-3 py-2 text-[#40544B]">
                  {displayVital(
                    vital.oxygen_saturation,
                    "%"
                  )}
                </td>

                <td className="px-3 py-2 text-[#40544B]">
                  {displayVital(
                    vital.pain_score,
                    "/10"
                  )}
                </td>

                <td className="px-3 py-2 text-[#52645C]">
                  {cleanText(
                    vital.recorded_by
                  ) || "—"}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function TwoColumnRecord({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 bg-[#F3F2ED] p-3 lg:grid-cols-2">
      {children}
    </div>
  );
}


function RecordPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-[#C9D3CE] bg-white">
      <div className="border-b border-[#D3DCD7] bg-[#EDF1EE] px-3 py-1.5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.025em] text-[#30463C]">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}


function RecordRows({
  rows,
}: {
  rows: [string, string][];
}) {
  return (
    <dl>
      {rows.map(
        ([label, value]) => (
          <div
            key={label}
            className="grid border-b border-[#E1E6E3] last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]"
          >
            <dt className="bg-[#F8F7F2] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.025em] text-[#66766F]">
              {label}
            </dt>

            <dd className="px-3 py-2 text-[11px] font-medium text-[#30443B]">
              {value}
            </dd>
          </div>
        )
      )}
    </dl>
  );
}


function ResidentBannerField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <span className="font-bold uppercase text-[#7A8982]">
        {label}:{" "}
      </span>

      <span className="font-semibold text-[#354A41]">
        {value}
      </span>
    </div>
  );
}


function HeaderVital({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-[58px] bg-white px-2 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.035em] text-[#72817A]">
        {label}
      </p>

      <p className="mt-1 text-[16px] font-bold leading-none text-[#14382B]">
        {value}
      </p>
    </div>
  );
}


function ClinicalAction({
  href,
  label,
  primary = false,
  danger = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        inline-flex h-7
        items-center
        rounded-[4px]
        border px-2.5
        text-[10px]
        font-bold
        transition

        ${
          primary
            ? "border-[#073B2F] bg-[#073B2F] text-white hover:bg-[#0D4A3A]"
            : danger
              ? "border-red-300 bg-white text-red-700 hover:bg-red-50"
              : "border-[#AABAB2] bg-white text-[#30483E] hover:bg-[#F3F5F3]"
        }
      `}
    >
      {label}
    </Link>
  );
}


function ClinicalHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="border-r border-[#D2DBD6] px-3 py-2 text-left last:border-r-0">
      {children}
    </th>
  );
}


function SnapshotCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white px-3 py-3">
      <p className="text-[9px] font-bold uppercase text-[#71817A]">
        {label}
      </p>

      <p className="mt-1 text-[17px] font-bold text-[#153B2C]">
        {value}
      </p>
    </div>
  );
}


function SummaryMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="bg-white px-3 py-3">
      <p className="text-[9px] font-bold uppercase text-[#71817A]">
        {label}
      </p>

      <p
        className={`
          mt-1 text-[17px]
          font-bold
          ${
            warning
              ? "text-red-700"
              : "text-[#153B2C]"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}


function TableEmpty({
  message,
}: {
  message: string;
}) {
  return (
    <div className="px-4 py-10 text-center text-xs text-[#6B7A73]">
      {message}
    </div>
  );
}


function EmptyModule({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-4">
      <div className="border border-[#D3DCD7] bg-[#FBFAF7] px-4 py-8 text-center">
        <p className="text-sm font-bold text-[#30443B]">
          {title}
        </p>

        <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-[#6A7972]">
          {description}
        </p>
      </div>
    </div>
  );
}
