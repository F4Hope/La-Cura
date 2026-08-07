"use client";

import type {
  FormEvent,
} from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  Pill,
  Save,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";

import Notification from "@/components/Notification";

import {
  supabase,
} from "@/lib/supabase/client";

type Resident = {
  id: number;
  full_name: string;
  room?: string | null;
  age?: number | null;
};

type MedicationForm = {
  resident_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date: string;
  time_to_take: string;
  prescribed_by: string;
  notes: string;
};

type NotificationState =
  | {
      message: string;
      type: "success" | "error";
    }
  | null;

const EMPTY_FORM: MedicationForm = {
  resident_id: "",
  medication_name: "",
  dosage: "",
  frequency: "",
  route: "",
  start_date: "",
  end_date: "",
  time_to_take: "",
  prescribed_by: "",
  notes: "",
};

export default function AddMedicationPage() {
  const [
    residents,
    setResidents,
  ] = useState<Resident[]>([]);

  const [
    form,
    setForm,
  ] = useState<MedicationForm>({
    ...EMPTY_FORM,
  });

  const [
    notification,
    setNotification,
  ] =
    useState<NotificationState>(
      null
    );

  const [
    loadingResidents,
    setLoadingResidents,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    cameFromResidentProfile,
    setCameFromResidentProfile,
  ] = useState(false);

  const [
    changingResident,
    setChangingResident,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    async function initializePage() {
      setLoadingResidents(true);

      const {
        data,
        error,
      } = await supabase
        .from("residents")
        .select(
          "id, full_name, room, age"
        )
        .order("full_name", {
          ascending: true,
        });

      if (!active) {
        return;
      }

      if (error) {
        setNotification({
          type: "error",
          message:
            "La-Cura could not load the resident list.",
        });

        setResidents([]);
        setLoadingResidents(false);

        return;
      }

      const loadedResidents =
        (data ?? []) as Resident[];

      setResidents(
        loadedResidents
      );

      const searchParams =
        new URLSearchParams(
          window.location.search
        );

      const residentIdValue =
        searchParams.get(
          "residentId"
        );

      if (!residentIdValue) {
        setLoadingResidents(false);

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
        setNotification({
          type: "error",
          message:
            "The resident link is invalid. Select a resident manually.",
        });

        setLoadingResidents(false);

        return;
      }

      const matchedResident =
        loadedResidents.find(
          (resident) =>
            resident.id ===
            residentId
        );

      if (!matchedResident) {
        setNotification({
          type: "error",
          message:
            "The resident from the profile could not be found. Select a resident manually.",
        });

        setLoadingResidents(false);

        return;
      }

      setForm((current) => ({
        ...current,
        resident_id:
          String(
            matchedResident.id
          ),
      }));

      setCameFromResidentProfile(
        true
      );

      setChangingResident(
        false
      );

      setLoadingResidents(
        false
      );
    }

    void initializePage();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setNotification(null);
        },
        4000
      );

    return () =>
      window.clearTimeout(timer);
  }, [notification]);

  const selectedResident =
    useMemo(() => {
      if (!form.resident_id) {
        return null;
      }

      return (
        residents.find(
          (resident) =>
            String(
              resident.id
            ) ===
            form.resident_id
        ) ?? null
      );
    }, [
      form.resident_id,
      residents,
    ]);

  function updateForm(
    field:
      keyof MedicationForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleResidentChange(
    residentId: string
  ) {
    updateForm(
      "resident_id",
      residentId
    );

    setChangingResident(false);

    setNotification(null);
  }

  function startChangingResident() {
    setChangingResident(true);
  }

  function cancelResidentChange() {
    setChangingResident(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (
      !form.resident_id ||
      !form.medication_name.trim() ||
      !form.dosage.trim() ||
      !form.frequency.trim()
    ) {
      setNotification({
        type: "error",
        message:
          "Please complete all required fields.",
      });

      return;
    }

    const residentId =
      Number(form.resident_id);

    if (
      !Number.isInteger(
        residentId
      ) ||
      residentId <= 0
    ) {
      setNotification({
        type: "error",
        message:
          "Select a valid resident.",
      });

      return;
    }

    setSaving(true);
    setNotification(null);

    try {
      const {
        error,
      } = await supabase
        .from("medications")
        .insert([
          {
            resident_id:
              residentId,

            medication_name:
              form.medication_name.trim(),

            dosage:
              form.dosage.trim(),

            frequency:
              form.frequency.trim(),

            route:
              form.route.trim() ||
              null,

            start_date:
              form.start_date ||
              null,

            end_date:
              form.end_date ||
              null,

            time_to_take:
              form.time_to_take ||
              null,

            prescribed_by:
              form.prescribed_by.trim() ||
              null,

            notes:
              form.notes.trim() ||
              null,
          },
        ]);

      if (error) {
        throw new Error(
          error.message
        );
      }

      const residentName =
        selectedResident?.full_name ||
        "the resident";

      setNotification({
        type: "success",
        message:
          `Medication added successfully for ${residentName}.`,
      });

      if (
        cameFromResidentProfile
      ) {
        setForm({
          ...EMPTY_FORM,
          resident_id:
            String(
              residentId
            ),
        });
      } else {
        setForm({
          ...EMPTY_FORM,
        });
      }

      setChangingResident(false);
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "The medication could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {notification && (
        <Notification
          message={
            notification.message
          }
          type={
            notification.type
          }
        />
      )}

      <header className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
        <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full border border-white/10" />

        <div className="absolute -bottom-36 left-1/2 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative px-5 py-7 lg:px-8">
          {cameFromResidentProfile &&
            selectedResident && (
              <Link
                href={`/residents/${selectedResident.id}`}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-green-100 transition hover:text-white"
              >
                <ArrowLeft
                  size={16}
                />

                Back to{" "}
                {
                  selectedResident.full_name
                }
              </Link>
            )}

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-100">
                <Pill size={15} />

                Medication Management
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Add Medication
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
                Register a medication
                order for the selected
                resident.
              </p>
            </div>

            {selectedResident && (
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-green-100">
                  Current resident
                </p>

                <p className="mt-1 font-semibold text-white">
                  {
                    selectedResident.full_name
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <form
          onSubmit={
            handleSubmit
          }
          className="mx-auto max-w-6xl space-y-6"
        >
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
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
                    Confirm who this
                    medication order is
                    for.
                  </p>
                </div>
              </div>
            </header>

            <div className="p-5">
              {loadingResidents ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-green-700"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    Loading residents...
                  </p>
                </div>
              ) : selectedResident &&
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
                            selectedResident.full_name
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
                          {selectedResident.room ||
                            "Unassigned"}
                        </span>

                        {selectedResident.age !==
                          null &&
                          selectedResident.age !==
                            undefined && (
                            <span>
                              {
                                selectedResident.age
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
                      startChangingResident
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
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Select Resident{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </span>

                    <select
                      value={
                        form.resident_id
                      }
                      onChange={(
                        event
                      ) =>
                        handleResidentChange(
                          event.target
                            .value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                    >
                      <option value="">
                        Choose a resident
                      </option>

                      {residents.map(
                        (
                          resident
                        ) => (
                          <option
                            key={
                              resident.id
                            }
                            value={
                              resident.id
                            }
                          >
                            {
                              resident.full_name
                            }
                            {resident.room
                              ? ` — Room ${resident.room}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  {selectedResident &&
                    changingResident && (
                      <button
                        type="button"
                        onClick={
                          cancelResidentChange
                        }
                        className="mt-3 text-sm font-semibold text-green-700 hover:text-green-800"
                      >
                        Keep{" "}
                        {
                          selectedResident.full_name
                        }
                      </button>
                    )}
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Pill size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Medication Details
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Enter the prescribed
                    medication and dosing
                    instructions.
                  </p>
                </div>
              </div>
            </header>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <FormField
                label="Medication Name"
                required
              >
                <input
                  type="text"
                  value={
                    form.medication_name
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "medication_name",
                      event.target
                        .value
                    )
                  }
                  placeholder="Example: Lisinopril"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Dosage"
                required
              >
                <input
                  type="text"
                  value={
                    form.dosage
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "dosage",
                      event.target
                        .value
                    )
                  }
                  placeholder="Example: 10 mg"
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Frequency"
                required
              >
                <input
                  type="text"
                  value={
                    form.frequency
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "frequency",
                      event.target
                        .value
                    )
                  }
                  placeholder="Example: Once daily"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Route">
                <select
                  value={form.route}
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "route",
                      event.target
                        .value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select route
                  </option>

                  <option value="Oral">
                    Oral
                  </option>

                  <option value="G-Tube">
                    G-Tube
                  </option>

                  <option value="PEG-Tube">
                    PEG-Tube
                  </option>

                  <option value="IV">
                    IV
                  </option>

                  <option value="IM">
                    IM
                  </option>

                  <option value="Subcutaneous">
                    Subcutaneous
                  </option>

                  <option value="Topical">
                    Topical
                  </option>

                  <option value="Inhalation">
                    Inhalation
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </FormField>

              <FormField label="Administration Time">
                <div className="relative">
                  <Clock3
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="time"
                    value={
                      form.time_to_take
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "time_to_take",
                        event.target
                          .value
                      )
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </FormField>

              <FormField label="Prescribed By">
                <div className="relative">
                  <Stethoscope
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      form.prescribed_by
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "prescribed_by",
                        event.target
                          .value
                      )
                    }
                    placeholder="Prescribing provider"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </FormField>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarDays
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Schedule
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Define the treatment
                    period where
                    applicable.
                  </p>
                </div>
              </div>
            </header>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <FormField label="Start Date">
                <input
                  type="date"
                  value={
                    form.start_date
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "start_date",
                      event.target
                        .value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="End Date">
                <input
                  type="date"
                  value={
                    form.end_date
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "end_date",
                      event.target
                        .value
                    )
                  }
                  className={inputClass}
                />
              </FormField>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <FileText
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Order Notes
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Add instructions or
                    relevant medication
                    information.
                  </p>
                </div>
              </div>
            </header>

            <div className="p-5">
              <textarea
                rows={5}
                value={form.notes}
                onChange={(
                  event
                ) =>
                  updateForm(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Enter administration instructions, precautions, or other relevant notes..."
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                {selectedResident
                  ? `Ready to add medication for ${selectedResident.full_name}.`
                  : "Select a resident before saving."}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Medication name,
                dosage, and frequency
                are required.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                loadingResidents ||
                !selectedResident
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

                  Save Medication
                </>
              )}
            </button>
          </section>

          {notification?.type ===
            "success" &&
            selectedResident && (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <CheckCircle2
                  size={18}
                  className="shrink-0"
                />

                Medication workflow
                completed for{" "}
                {
                  selectedResident.full_name
                }
                .
              </div>
            )}
        </form>
      </main>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
};

function FormField({
  label,
  children,
  required = false,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";