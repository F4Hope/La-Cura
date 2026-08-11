"use client";

import type {
  FormEvent,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Save,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";

import ResidentSearch from "@/components/ResidentSearch";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  getCurrentStaff,
} from "@/lib/currentStaff";

import {
  isOnline,
  saveOffline,
} from "@/lib/offline";


type Resident = {
  id: number;
  full_name: string;
  room:
    | string
    | null;
  age:
    | number
    | null;
};


type VitalForm = {
  temperature: string;
  pulse: string;
  systolic: string;
  diastolic: string;
  respiratory_rate: string;
  oxygen_saturation: string;
  weight: string;
  pain_score: string;
  notes: string;
};


type NotificationState =
  | {
      type:
        | "success"
        | "error";

      message: string;
    }
  | null;


const EMPTY_FORM: VitalForm = {
  temperature: "",
  pulse: "",
  systolic: "",
  diastolic: "",
  respiratory_rate: "",
  oxygen_saturation: "",
  weight: "",
  pain_score: "",
  notes: "",
};


function numberOrNull(
  value: string
): number | null {
  if (
    value.trim() === ""
  ) {
    return null;
  }

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}


export default function AddVitalsPage() {
  const [
    resident,
    setResident,
  ] = useState<Resident | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<VitalForm>({
    ...EMPTY_FORM,
  });

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    loadingResident,
    setLoadingResident,
  ] = useState(true);

  const [
    cameFromResidentProfile,
    setCameFromResidentProfile,
  ] = useState(false);

  const [
    changingResident,
    setChangingResident,
  ] = useState(false);

  const [
    online,
    setOnline,
  ] = useState(true);

  const [
    notification,
    setNotification,
  ] =
    useState<NotificationState>(
      null
    );


  useEffect(() => {
    setOnline(
      isOnline()
    );

    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);


  useEffect(() => {
    let active = true;

    async function loadResidentFromUrl() {
      const searchParams =
        new URLSearchParams(
          window.location.search
        );

      const residentIdValue =
        searchParams.get(
          "residentId"
        );

      if (!residentIdValue) {
        if (active) {
          setLoadingResident(
            false
          );
        }

        return;
      }

      const residentId =
        Number(
          residentIdValue
        );

      if (
        !Number.isInteger(
          residentId
        ) ||
        residentId <= 0
      ) {
        if (active) {
          setNotification({
            type: "error",
            message:
              "The resident link is invalid. Select a resident manually.",
          });

          setLoadingResident(
            false
          );
        }

        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("residents")
        .select(
          "id, full_name, room, age"
        )
        .eq(
          "id",
          residentId
        )
        .maybeSingle();

      if (!active) {
        return;
      }

      if (
        error ||
        !data
      ) {
        setNotification({
          type: "error",
          message:
            "La-Cura could not load the resident from the profile. Select the resident manually.",
        });

        setLoadingResident(
          false
        );

        return;
      }

      setResident(
        data as Resident
      );

      setCameFromResidentProfile(
        true
      );

      setChangingResident(
        false
      );

      setLoadingResident(
        false
      );
    }

    void loadResidentFromUrl();

    return () => {
      active = false;
    };
  }, []);


  function updateForm(
    field:
      keyof VitalForm,
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }


  function handleResidentSelected(
    selectedResident:
      Resident
  ) {
    setResident(
      selectedResident
    );

    setChangingResident(
      false
    );

    setNotification(
      null
    );
  }


  function handleChangeResident() {
    setChangingResident(
      true
    );
  }


  function handleCancelResidentChange() {
    setChangingResident(
      false
    );
  }


  async function saveVitals(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!resident) {
      setNotification({
        type: "error",
        message:
          "Select a resident before recording vital signs.",
      });

      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);
    setNotification(null);

    try {
      const staff =
        await getCurrentStaff();

      const now =
        new Date()
          .toISOString();

      const data = {
        resident_id:
          resident.id,

        temperature:
          numberOrNull(
            form.temperature
          ),

        pulse:
          numberOrNull(
            form.pulse
          ),

        systolic:
          numberOrNull(
            form.systolic
          ),

        diastolic:
          numberOrNull(
            form.diastolic
          ),

        respiratory_rate:
          numberOrNull(
            form.respiratory_rate
          ),

        oxygen_saturation:
          numberOrNull(
            form.oxygen_saturation
          ),

        weight:
          numberOrNull(
            form.weight
          ),

        pain_score:
          numberOrNull(
            form.pain_score
          ),

        notes:
          form.notes.trim() ||
          null,

        recorded_by:
          staff?.full_name ||
          "Offline Staff",

        recorded_at:
          now,
      };


      if (!isOnline()) {
        saveOffline(
          "vital_signs",
          data
        );

        setNotification({
          type: "success",
          message:
            `Vital signs for ${resident.full_name} were saved offline and will sync when the connection returns.`,
        });

        setForm({
          ...EMPTY_FORM,
        });

        return;
      }


      const {
        error,
      } = await supabase
        .from(
          "vital_signs"
        )
        .insert(data);

      if (error) {
        throw new Error(
          error.message
        );
      }

      setNotification({
        type: "success",
        message:
          `Vital signs saved successfully for ${resident.full_name}.`,
      });

      setForm({
        ...EMPTY_FORM,
      });

      if (
        !cameFromResidentProfile
      ) {
        setResident(null);
      }
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Vital signs could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE HEADER */}

      <section className="border-b border-[#C9D3CE] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="hover:text-[#073B2F]"
              >
                Home
              </Link>

              <span>/</span>

              {cameFromResidentProfile &&
              resident ? (
                <>
                  <Link
                    href={`/residents/${resident.id}`}
                    className="font-semibold text-[#073B2F] hover:underline"
                  >
                    {resident.full_name}
                  </Link>

                  <span>/</span>
                </>
              ) : null}

              <span className="font-semibold text-[#40524B]">
                WTS/Vitals
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                Record Vital Signs
              </h1>

              <p className="text-xs text-[#718078]">
                Enter current resident observations
              </p>
            </div>
          </div>


          <div className="flex items-center gap-2">
            {cameFromResidentProfile &&
              resident && (
                <Link
                  href={`/residents/${resident.id}?tab=vitals`}
                  className="
                    inline-flex h-8
                    items-center gap-1.5
                    border border-[#B3C1BA]
                    bg-white px-3
                    text-[10px]
                    font-bold
                    text-[#3F534A]
                    hover:border-[#073B2F]
                    hover:text-[#073B2F]
                  "
                >
                  <ArrowLeft
                    size={12}
                  />

                  Resident Vitals
                </Link>
              )}

            <span
              className={`
                inline-flex h-8
                items-center gap-1.5
                border px-3
                text-[10px]
                font-bold

                ${
                  online
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }
              `}
            >
              {online ? (
                <Wifi size={12} />
              ) : (
                <WifiOff
                  size={12}
                />
              )}

              {online
                ? "Online"
                : "Offline Mode"}
            </span>
          </div>
        </div>
      </section>


      <main className="mx-auto max-w-[1500px] p-3 sm:p-4 lg:px-6">
        <form
          onSubmit={
            saveVitals
          }
          className="space-y-3"
        >
          {notification && (
            <div
              className={`
                flex items-center
                gap-2 border
                px-3 py-2.5
                text-[11px]
                font-medium

                ${
                  notification.type ===
                  "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }
              `}
            >
              <CheckCircle2
                size={14}
                className="shrink-0"
              />

              {notification.message}
            </div>
          )}


          {/* RESIDENT CONTEXT */}

          <section className="border border-[#C8D2CD] bg-white">
            <div className="flex items-center justify-between border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
                  Resident Context
                </h2>
              </div>

              {cameFromResidentProfile && (
                <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#8B6E27]">
                  Profile Context
                </span>
              )}
            </div>


            <div className="p-3">
              {loadingResident ? (
                <div className="flex items-center gap-2 border border-[#D4DDD8] bg-[#FBFAF7] px-3 py-3">
                  <LoaderCircle
                    size={15}
                    className="animate-spin text-[#073B2F]"
                  />

                  <span className="text-[11px] text-[#5A6D64]">
                    Loading resident...
                  </span>
                </div>
              ) : resident &&
                !changingResident ? (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_120px]">
                    <ResidentField
                      label="Resident"
                      value={
                        resident.full_name
                      }
                      strong
                    />

                    <ResidentField
                      label="Room / Bed"
                      value={
                        resident.room ||
                        "Unassigned"
                      }
                    />

                    <ResidentField
                      label="Age"
                      value={
                        resident.age !==
                          null &&
                        resident.age !==
                          undefined
                          ? `${resident.age} years`
                          : "Not recorded"
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleChangeResident
                    }
                    className="
                      inline-flex h-8
                      items-center
                      justify-center gap-1.5
                      border
                      border-[#AABAB2]
                      bg-white px-3
                      text-[10px]
                      font-bold
                      text-[#30483E]
                      hover:border-[#073B2F]
                      hover:bg-[#F2F5F3]
                    "
                  >
                    <Search
                      size={12}
                    />

                    Change Resident
                  </button>
                </div>
              ) : (
                <div>
                  <ResidentSearch
                    onResidentSelected={
                      handleResidentSelected
                    }
                  />

                  {resident &&
                    changingResident && (
                      <button
                        type="button"
                        onClick={
                          handleCancelResidentChange
                        }
                        className="mt-2 text-[10px] font-bold text-[#073B2F] hover:underline"
                      >
                        Keep{" "}
                        {
                          resident.full_name
                        }
                      </button>
                    )}
                </div>
              )}
            </div>
          </section>


          {/* VITAL MEASUREMENTS */}

          <section className="border border-[#C8D2CD] bg-white">
            <div className="border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
                  Current Measurements
                </h2>

                <span className="text-[9px] text-[#728078]">
                  Enter only measurements obtained during this observation
                </span>
              </div>
            </div>


            <div className="grid gap-px bg-[#D7DFDB] sm:grid-cols-2 lg:grid-cols-4">
              <VitalField
                label="Temperature"
                unit="°C"
                value={
                  form.temperature
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "temperature",
                    value
                  )
                }
                step="0.1"
                placeholder="36.8"
              />

              <VitalField
                label="Pulse"
                unit="bpm"
                value={
                  form.pulse
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "pulse",
                    value
                  )
                }
                placeholder="72"
              />

              <VitalField
                label="Systolic BP"
                unit="mmHg"
                value={
                  form.systolic
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "systolic",
                    value
                  )
                }
                placeholder="120"
              />

              <VitalField
                label="Diastolic BP"
                unit="mmHg"
                value={
                  form.diastolic
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "diastolic",
                    value
                  )
                }
                placeholder="80"
              />

              <VitalField
                label="Respiratory Rate"
                unit="/min"
                value={
                  form.respiratory_rate
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "respiratory_rate",
                    value
                  )
                }
                placeholder="18"
              />

              <VitalField
                label="Oxygen Saturation"
                unit="%"
                value={
                  form.oxygen_saturation
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "oxygen_saturation",
                    value
                  )
                }
                placeholder="98"
                min="0"
                max="100"
              />

              <VitalField
                label="Weight"
                unit="kg"
                value={
                  form.weight
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "weight",
                    value
                  )
                }
                step="0.1"
                placeholder="70.5"
              />

              <VitalField
                label="Pain Score"
                unit="/10"
                value={
                  form.pain_score
                }
                onChange={(
                  value
                ) =>
                  updateForm(
                    "pain_score",
                    value
                  )
                }
                placeholder="0"
                min="0"
                max="10"
              />
            </div>


            <div className="border-t border-[#D8DFDB] bg-white p-3">
              <label className="block">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.03em] text-[#4D6158]">
                    Clinical Notes
                  </span>

                  <span className="text-[9px] text-[#819088]">
                    Optional
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={
                    form.notes
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "notes",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Clinical observations, symptoms, interventions, or follow-up..."
                  className="
                    w-full resize-y
                    border border-[#BFCAC4]
                    bg-white
                    px-3 py-2.5
                    text-[12px]
                    leading-5
                    text-[#24382F]
                    outline-none
                    placeholder:text-[#8A9791]
                    focus:border-[#6B8377]
                    focus:ring-1
                    focus:ring-[#6B8377]/20
                  "
                />
              </label>
            </div>
          </section>


          {/* SAVE BAR */}

          <section className="flex flex-col gap-3 border border-[#C8D2CD] bg-[#FBFAF7] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#344940]">
                {resident
                  ? `Ready to record vital signs for ${resident.full_name}.`
                  : "Select a resident before saving."}
              </p>

              <p className="mt-0.5 text-[9px] text-[#73817A]">
                {online
                  ? "The record will be saved immediately."
                  : "The record will be stored locally and synchronized when connectivity returns."}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                loadingResident ||
                !resident
              }
              className="
                inline-flex h-9
                min-w-[155px]
                items-center
                justify-center
                gap-2 border
                border-[#063428]
                bg-[#073B2F]
                px-4 text-[11px]
                font-bold text-white
                hover:bg-[#0D4A3A]
                disabled:cursor-not-allowed
                disabled:opacity-45
              "
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={14}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={14}
                  />

                  Save Vital Signs
                </>
              )}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}


function ResidentField({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 border-l-2 border-[#D5A437] pl-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#7B8982]">
        {label}
      </p>

      <p
        className={`
          mt-0.5 truncate
          text-[11px]
          ${
            strong
              ? "font-bold text-[#073B2F]"
              : "font-semibold text-[#40544B]"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}


type VitalFieldProps = {
  label: string;
  unit: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
};


function VitalField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}: VitalFieldProps) {
  return (
    <label className="bg-white px-3 py-3">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.025em] text-[#53675E]">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
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
          className="
            h-9 w-full
            border border-[#BFCAC4]
            bg-white
            px-2.5 pr-14
            text-[12px]
            font-semibold
            text-[#24382F]
            outline-none
            placeholder:font-normal
            placeholder:text-[#9AA49F]
            focus:border-[#667E72]
            focus:ring-1
            focus:ring-[#667E72]/20
          "
        />

        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-[#7A8982]">
          {unit}
        </span>
      </div>
    </label>
  );
}
