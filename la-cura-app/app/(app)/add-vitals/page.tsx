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
  Activity,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  HeartPulse,
  LoaderCircle,
  Save,
  Search,
  UserRound,
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
  room: string;
  age: number;
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
      type: "success" | "error";
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
  if (value.trim() === "") {
    return null;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
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
    setOnline(isOnline());

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
        Number(residentIdValue);

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
        .eq("id", residentId)
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
    field: keyof VitalForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleResidentSelected(
    selectedResident: Resident
  ) {
    setResident(
      selectedResident
    );

    setChangingResident(false);

    setNotification(null);
  }

  function handleChangeResident() {
    setChangingResident(true);
  }

  function handleCancelResidentChange() {
    setChangingResident(false);
  }

  async function saveVitals(
    event: FormEvent<HTMLFormElement>
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
        new Date().toISOString();

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

        recorded_at: now,
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
        .from("vital_signs")
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

      /*
       * When launched from a resident
       * profile, keep that resident
       * selected.
       *
       * When launched generally, clear
       * the selection after saving.
       */
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border border-white/10" />

        <div className="absolute -bottom-32 left-1/2 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative px-5 py-7 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              {cameFromResidentProfile &&
                resident && (
                  <Link
                    href={`/residents/${resident.id}`}
                    className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-green-100 transition hover:text-white"
                  >
                    <ArrowLeft
                      size={16}
                    />

                    Back to{" "}
                    {
                      resident.full_name
                    }
                  </Link>
                )}

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-100">
                <HeartPulse
                  size={15}
                />

                Clinical Documentation
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Record Vital Signs
              </h1>

              <p className="mt-2 text-sm text-green-100">
                Record resident
                observations securely
                online or offline.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-sm lg:self-auto ${
                online
                  ? "border-white/15 bg-white/10 text-green-50"
                  : "border-amber-200/30 bg-amber-400/20 text-amber-50"
              }`}
            >
              {online ? (
                <Wifi size={17} />
              ) : (
                <WifiOff
                  size={17}
                />
              )}

              {online
                ? "Online"
                : "Offline mode"}
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <form
          onSubmit={saveVitals}
          className="mx-auto max-w-6xl space-y-6"
        >
          {notification && (
            <div
              className={`flex items-start gap-3 rounded-xl border px-4 py-4 text-sm ${
                notification.type ===
                "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {notification.type ===
              "success" ? (
                <CheckCircle2
                  className="mt-0.5 shrink-0"
                  size={18}
                />
              ) : (
                <Activity
                  className="mt-0.5 shrink-0"
                  size={18}
                />
              )}

              <p>
                {
                  notification.message
                }
              </p>
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <UserRound
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Resident
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Confirm the resident
                    before documenting
                    vital signs.
                  </p>
                </div>
              </div>
            </header>

            <div className="p-5">
              {loadingResident ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-green-700"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    Loading resident...
                  </p>
                </div>
              ) : resident &&
                !changingResident ? (
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white">
                      <UserRound
                        size={22}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {
                            resident.full_name
                          }
                        </p>

                        {cameFromResidentProfile && (
                          <span className="rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-semibold text-white">
                            From resident
                            profile
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble
                            size={15}
                          />

                          Room{" "}
                          {resident.room ||
                            "Unassigned"}
                        </span>

                        {resident.age !==
                          null &&
                          resident.age !==
                            undefined && (
                            <span>
                              {
                                resident.age
                              }{" "}
                              years
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleChangeResident
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-4 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                  >
                    <Search
                      size={16}
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
                        className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
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

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <HeartPulse
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Measurements
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Enter the resident's
                    current observations.
                  </p>
                </div>
              </div>
            </header>

            <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
              <VitalField
                label="Temperature"
                unit="°C"
                value={
                  form.temperature
                }
                onChange={(value) =>
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
                value={form.pulse}
                onChange={(value) =>
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
                onChange={(value) =>
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
                onChange={(value) =>
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
                onChange={(value) =>
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
                onChange={(value) =>
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
                value={form.weight}
                onChange={(value) =>
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
                onChange={(value) =>
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

            <div className="border-t border-slate-200 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Clinical Notes
                </span>

                <textarea
                  rows={5}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Add observations, symptoms, interventions, or other relevant notes..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {resident
                  ? `Ready to record vitals for ${resident.full_name}.`
                  : "Select a resident before saving."}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {online
                  ? "Changes will be saved to La-Cura immediately."
                  : "Changes will be stored offline and synchronized later."}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                loadingResident ||
                !resident
              }
              className="inline-flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-green-700 px-6 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Vital Signs
                </>
              )}
            </button>
          </div>
        </form>
      </main>
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
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
        />

        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
          {unit}
        </span>
      </div>
    </label>
  );
}