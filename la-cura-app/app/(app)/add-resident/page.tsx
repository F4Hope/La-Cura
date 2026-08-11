"use client";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Camera,
  ClipboardPlus,
  Contact,
  Droplets,
  FileText,
  HeartPulse,
  LoaderCircle,
  Phone,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Upload,
  UserRound,
  Users,
} from "lucide-react";

import Notification from "@/components/Notification";

import { supabase } from "@/lib/supabase/client";

const PHOTO_BUCKET =
  "resident-photos";

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type ResidentForm = {
  full_name: string;
  age: string;
  gender: string;
  room: string;
  date_of_birth: string;
  date_admitted: string;
  diagnosis: string;
  allergies: string;
  blood_group: string;
  primary_doctor: string;
  status: string;
  emergency_contact: string;
  next_of_kin: string;
  next_of_kin_phone: string;
  notes: string;
};

type FormErrors = {
  full_name: boolean;
  age: boolean;
  gender: boolean;
  room: boolean;
  date_admitted: boolean;
};

type NotificationState = {
  message: string;
  type: "success" | "error";
} | null;

function getTodayForInput(): string {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialForm(): ResidentForm {
  return {
    full_name: "",
    age: "",
    gender: "",
    room: "",
    date_of_birth: "",
    date_admitted:
      getTodayForInput(),
    diagnosis: "",
    allergies: "",
    blood_group: "",
    primary_doctor: "",
    status: "Stable",
    emergency_contact: "",
    next_of_kin: "",
    next_of_kin_phone: "",
    notes: "",
  };
}

function createInitialErrors(): FormErrors {
  return {
    full_name: false,
    age: false,
    gender: false,
    room: false,
    date_admitted: false,
  };
}

function calculateAge(
  dateOfBirth: string
): string {
  if (!dateOfBirth) {
    return "";
  }

  const birthDate = new Date(
    `${dateOfBirth}T00:00:00`
  );

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return "";
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  const birthdayHasNotOccurred =
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate());

  if (birthdayHasNotOccurred) {
    age -= 1;
  }

  return age >= 0
    ? String(age)
    : "";
}

function getPhotoExtension(
  file: File
): string {
  const typeExtensions: Record<
    string,
    string
  > = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return (
    typeExtensions[file.type] ||
    "jpg"
  );
}

function getResidentInitials(
  fullName: string
): string {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) =>
      name.charAt(0).toUpperCase()
    )
    .join("");

  return initials || "NR";
}

export default function AddResidentPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [form, setForm] =
    useState<ResidentForm>(
      createInitialForm
    );

  const [errors, setErrors] =
    useState<FormErrors>(
      createInitialErrors
    );

  const [
    notification,
    setNotification,
  ] = useState<NotificationState>(
    null
  );

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState<File | null>(null);

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState<string | null>(
    null
  );

  const [
    photoError,
    setPhotoError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setNotification(null);
      },
      4000
    );

    return () =>
      window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreview(null);
      return;
    }

    const previewUrl =
      URL.createObjectURL(
        selectedPhoto
      );

    setPhotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(
        previewUrl
      );
    };
  }, [selectedPhoto]);

  function updateForm<
    Key extends keyof ResidentForm
  >(
    key: Key,
    value: ResidentForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (
      key in errors &&
      value.trim() !== ""
    ) {
      setErrors((current) => ({
        ...current,
        [key]: false,
      }));
    }
  }

  function handleDateOfBirthChange(
    value: string
  ) {
    setForm((current) => ({
      ...current,
      date_of_birth: value,
      age: calculateAge(value),
    }));

    if (value) {
      setErrors((current) => ({
        ...current,
        age: false,
      }));
    }
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    setPhotoError("");

    if (!file) {
      return;
    }

    if (
      !ALLOWED_PHOTO_TYPES.includes(
        file.type
      )
    ) {
      setSelectedPhoto(null);

      setPhotoError(
        "Choose a JPG, PNG, or WebP image."
      );

      event.target.value = "";

      return;
    }

    if (
      file.size > MAX_PHOTO_SIZE
    ) {
      setSelectedPhoto(null);

      setPhotoError(
        "The selected photo is larger than 5 MB."
      );

      event.target.value = "";

      return;
    }

    setSelectedPhoto(file);
  }

  function removeSelectedPhoto() {
    setSelectedPhoto(null);
    setPhotoError("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  function validateForm(): FormErrors {
    const ageNumber =
      Number(form.age);

    const newErrors: FormErrors = {
      full_name:
        form.full_name.trim() === "",

      age:
        form.age.trim() === "" ||
        !Number.isFinite(ageNumber) ||
        ageNumber < 0 ||
        ageNumber > 130,

      gender:
        form.gender === "",

      room:
        form.room.trim() === "",

      date_admitted:
        form.date_admitted === "",
    };

    setErrors(newErrors);

    return newErrors;
  }

  async function uploadPhoto(): Promise<{
    publicUrl: string;
    storagePath: string;
  } | null> {
    if (!selectedPhoto) {
      return null;
    }

    const extension =
      getPhotoExtension(
        selectedPhoto
      );

    const storagePath =
      `residents/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(
          storagePath,
          selectedPhoto,
          {
            cacheControl: "3600",
            contentType:
              selectedPhoto.type,
            upsert: false,
          }
        );

    if (uploadError) {
      throw new Error(
        `Photo upload failed: ${uploadError.message}`
      );
    }

    const { data } =
      supabase.storage
        .from(PHOTO_BUCKET)
        .getPublicUrl(storagePath);

    if (!data.publicUrl) {
      throw new Error(
        "The photo was uploaded, but its URL could not be created."
      );
    }

    return {
      publicUrl: data.publicUrl,
      storagePath,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validation =
      validateForm();

    if (
      Object.values(
        validation
      ).some(Boolean)
    ) {
      setNotification({
        type: "error",
        message:
          "Complete all required fields before saving.",
      });

      return;
    }

    if (photoError) {
      setNotification({
        type: "error",
        message:
          "Correct the resident photo before saving.",
      });

      return;
    }

    setIsSubmitting(true);

    let uploadedPhoto:
      | {
          publicUrl: string;
          storagePath: string;
        }
      | null = null;

    try {
      uploadedPhoto =
        await uploadPhoto();

      const {
        data: createdResident,
        error: insertError,
      } = await supabase
        .from("residents")
        .insert([
          {
            full_name:
              form.full_name.trim(),

            age: Number(form.age),

            gender: form.gender,

            room:
              form.room.trim(),

            date_of_birth:
              form.date_of_birth ||
              null,

            date_admitted:
              form.date_admitted,

            diagnosis:
              form.diagnosis.trim() ||
              null,

            allergies:
              form.allergies.trim() ||
              null,

            blood_group:
              form.blood_group.trim() ||
              null,

            primary_doctor:
              form.primary_doctor.trim() ||
              null,

            status: form.status,

            emergency_contact:
              form.emergency_contact.trim() ||
              null,

            next_of_kin:
              form.next_of_kin.trim() ||
              null,

            next_of_kin_phone:
              form.next_of_kin_phone.trim() ||
              null,

            notes:
              form.notes.trim() ||
              null,

            photo_url:
              uploadedPhoto?.publicUrl ||
              null,
          },
        ])
        .select("id")
        .single();

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      setNotification({
        type: "success",
        message:
          createdResident?.id
            ? `Resident #${createdResident.id} was added successfully.`
            : "Resident was added successfully.",
      });

      setForm(
        createInitialForm()
      );

      setErrors(
        createInitialErrors()
      );

      removeSelectedPhoto();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The resident could not be saved.";

      setNotification({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-slate-900">
      {notification && (
        <Notification
          message={
            notification.message
          }
          type={notification.type}
        />
      )}

      <header className="relative overflow-hidden bg-[#073B2F] text-white">
        <div className="absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

        <div className="absolute -bottom-36 left-1/2 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative px-5 py-7 lg:px-8">
          <Link
            href="/residents"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-100 transition hover:text-white"
          >
            <ArrowLeft size={17} />

            Back to Residents
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-100">
                <ClipboardPlus
                  size={15}
                />

                Resident Registration
              </div>

              <h1 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">
                Add Resident
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">
                Create a complete resident
                profile and add an optional
                profile photograph.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-[3px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-green-50 backdrop-blur-sm">
              <ShieldCheck
                size={18}
              />

              Required fields are marked
              with *
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-[1400px] items-start gap-6 xl:grid-cols-[330px_minmax(0,1fr)]"
        >
          <aside className="overflow-hidden rounded-[4px] border border-slate-200 bg-white xl:sticky xl:top-6">
            <div className="border-b border-slate-200 bg-green-50 px-5 py-4">
              <h2 className="font-semibold text-green-900">
                Resident Photo
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#073B2F]">
                JPG, PNG, or WebP. Maximum
                file size 5 MB.
              </p>
            </div>

            <div className="p-6">
              <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-[4px] border-4 border-white bg-[#E6EEE8] shadow-lg ring-1 ring-slate-200">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Selected resident"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-[#073B2F]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 text-2xl font-semibold">
                      {getResidentInitials(
                        form.full_name
                      )}
                    </div>

                    <Camera
                      className="mt-5"
                      size={26}
                    />

                    <p className="mt-2 text-sm font-medium">
                      No photo selected
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handlePhotoChange
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isSubmitting}
                className="mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[3px] bg-[#073B2F] px-3 text-[11px] font-bold text-white transition hover:bg-[#0D4A3A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={17} />

                {selectedPhoto
                  ? "Change Photo"
                  : "Choose Photo"}
              </button>

              {selectedPhoto && (
                <button
                  type="button"
                  onClick={
                    removeSelectedPhoto
                  }
                  disabled={isSubmitting}
                  className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[3px] border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={17} />

                  Remove Photo
                </button>
              )}

              {photoError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {photoError}
                </p>
              )}

              {selectedPhoto && (
                <div className="mt-4 rounded-[3px] bg-slate-50 p-3">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {selectedPhoto.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {(
                      selectedPhoto.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <FormSection
              icon={<UserRound size={19} />}
              title="Resident Identity"
              description="Basic demographic and accommodation information."
            >
              <FormField
                label="Full Name"
                required
                error={errors.full_name}
              >
                <input
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(event) =>
                    updateForm(
                      "full_name",
                      event.target.value
                    )
                  }
                  placeholder="Enter resident's full name"
                  className={getInputClass(
                    errors.full_name
                  )}
                />
              </FormField>

              <FormField
                label="Gender"
                required
                error={errors.gender}
              >
                <select
                  value={form.gender}
                  onChange={(event) =>
                    updateForm(
                      "gender",
                      event.target.value
                    )
                  }
                  className={getInputClass(
                    errors.gender
                  )}
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Other">
                    Other
                  </option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </FormField>

              <FormField label="Date of Birth">
                <input
                  type="date"
                  value={
                    form.date_of_birth
                  }
                  onChange={(event) =>
                    handleDateOfBirthChange(
                      event.target.value
                    )
                  }
                  className={getInputClass()}
                />
              </FormField>

              <FormField
                label="Age"
                required
                error={errors.age}
                hint="Automatically calculated when a date of birth is entered."
              >
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={form.age}
                  onChange={(event) =>
                    updateForm(
                      "age",
                      event.target.value
                    )
                  }
                  placeholder="Age"
                  className={getInputClass(
                    errors.age
                  )}
                />
              </FormField>

              <FormField
                label="Room Number"
                required
                error={errors.room}
              >
                <div className="relative">
                  <BedDouble
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={form.room}
                    onChange={(event) =>
                      updateForm(
                        "room",
                        event.target.value
                      )
                    }
                    placeholder="Example: 204-B"
                    className={`${getInputClass(
                      errors.room
                    )} pl-10`}
                  />
                </div>
              </FormField>

              <FormField
                label="Admission Date"
                required
                error={
                  errors.date_admitted
                }
              >
                <input
                  type="date"
                  value={
                    form.date_admitted
                  }
                  onChange={(event) =>
                    updateForm(
                      "date_admitted",
                      event.target.value
                    )
                  }
                  className={getInputClass(
                    errors.date_admitted
                  )}
                />
              </FormField>

              <FormField label="Resident Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value
                    )
                  }
                  className={getInputClass()}
                >
                  <option value="Stable">
                    Stable
                  </option>

                  <option value="Observation">
                    Observation
                  </option>

                  <option value="Critical">
                    Critical
                  </option>
                </select>
              </FormField>

              <FormField label="Blood Group">
                <div className="relative">
                  <Droplets
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      form.blood_group
                    }
                    onChange={(event) =>
                      updateForm(
                        "blood_group",
                        event.target.value
                      )
                    }
                    placeholder="Example: O+"
                    className={`${getInputClass()} pl-10`}
                  />
                </div>
              </FormField>
            </FormSection>

            <FormSection
              icon={
                <HeartPulse size={19} />
              }
              title="Clinical Information"
              description="Primary diagnosis, allergies, and medical oversight."
            >
              <FormField label="Primary Diagnosis">
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(event) =>
                    updateForm(
                      "diagnosis",
                      event.target.value
                    )
                  }
                  placeholder="Enter primary diagnosis"
                  className={getInputClass()}
                />
              </FormField>

              <FormField label="Allergies">
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(event) =>
                    updateForm(
                      "allergies",
                      event.target.value
                    )
                  }
                  placeholder="Enter allergies or NKA"
                  className={getInputClass()}
                />
              </FormField>

              <FormField
                label="Primary Doctor"
                wide
              >
                <div className="relative">
                  <Stethoscope
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      form.primary_doctor
                    }
                    onChange={(event) =>
                      updateForm(
                        "primary_doctor",
                        event.target.value
                      )
                    }
                    placeholder="Enter physician or provider name"
                    className={`${getInputClass()} pl-10`}
                  />
                </div>
              </FormField>
            </FormSection>

            <FormSection
              icon={<Users size={19} />}
              title="Contacts"
              description="Emergency and next-of-kin information."
            >
              <FormField label="Emergency Contact">
                <div className="relative">
                  <Phone
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      form.emergency_contact
                    }
                    onChange={(event) =>
                      updateForm(
                        "emergency_contact",
                        event.target.value
                      )
                    }
                    placeholder="Emergency contact details"
                    className={`${getInputClass()} pl-10`}
                  />
                </div>
              </FormField>

              <FormField label="Next of Kin">
                <div className="relative">
                  <Contact
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      form.next_of_kin
                    }
                    onChange={(event) =>
                      updateForm(
                        "next_of_kin",
                        event.target.value
                      )
                    }
                    placeholder="Next-of-kin name"
                    className={`${getInputClass()} pl-10`}
                  />
                </div>
              </FormField>

              <FormField
                label="Next-of-Kin Phone"
                wide
              >
                <div className="relative">
                  <Phone
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    value={
                      form.next_of_kin_phone
                    }
                    onChange={(event) =>
                      updateForm(
                        "next_of_kin_phone",
                        event.target.value
                      )
                    }
                    placeholder="Phone number"
                    className={`${getInputClass()} pl-10`}
                  />
                </div>
              </FormField>
            </FormSection>

            <FormSection
              icon={<FileText size={19} />}
              title="Additional Notes"
              description="Optional information relevant to the resident's care."
            >
              <FormField
                label="Resident Notes"
                wide
              >
                <textarea
                  rows={6}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Enter additional resident information"
                  className={`${getInputClass()} min-h-36 resize-y py-3`}
                />
              </FormField>
            </FormSection>

            <div className="flex flex-col-reverse gap-3 rounded-[4px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Review the resident information
                before saving.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[3px] bg-[#073B2F] px-4 text-[11px] font-bold text-white transition hover:bg-[#0D4A3A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Saving Resident...
                  </>
                ) : (
                  <>
                    <Save size={18} />

                    Save Resident
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

type FormSectionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

function FormSection({
  icon,
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="overflow-hidden rounded-[4px] border border-slate-200 bg-white">
      <header className="flex items-start gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-green-50 text-[#073B2F]">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </header>

      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        {children}
      </div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
  hint?: string;
  wide?: boolean;
};

function FormField({
  label,
  children,
  required = false,
  error = false,
  hint,
  wide = false,
}: FormFieldProps) {
  return (
    <label
      className={
        wide
          ? "block md:col-span-2"
          : "block"
      }
    >
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <span className="mt-1.5 block text-xs font-medium text-red-600">
          This field is required or invalid.
        </span>
      )}

      {!error && hint && (
        <span className="mt-1.5 block text-xs text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function getInputClass(
  hasError = false
): string {
  return [
    "h-12 w-full rounded-[3px] border bg-white px-3.5 text-sm text-slate-900 outline-none transition",
    "placeholder:text-slate-400",
    "focus:ring-4",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-[#667E72] focus:ring-[#073B2F]/10",
  ].join(" ");
}