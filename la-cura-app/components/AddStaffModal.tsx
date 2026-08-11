"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import type {
  IconDefinition,
} from "@fortawesome/fontawesome-svg-core";

import {
  faArrowLeft,
  faArrowRight,
  faBuilding,
  faCalendarDays,
  faCheck,
  faClipboard,
  faClock,
  faCopy,
  faEye,
  faEyeSlash,
  faIdCard,
  faKey,
  faPhone,
  faShieldHalved,
  faSpinner,
  faTriangleExclamation,
  faUser,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import { supabase } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

type StaffRole =
  | "Administrator"
  | "Nurse"
  | "Physician";

type StaffShift =
  | "Day"
  | "Night";

type StaffForm = {
  full_name: string;
  phone: string;
  role: StaffRole;
  department: string;
  license_number: string;
  shift: StaffShift;
  employment_date: string;
};

type CreatedCredentials = {
  staffCode: string;
  temporaryPassword: string;
};

type CreateStaffResponse = {
  success?: boolean;
  message?: string;

  credentials?: {
    staffCode?: string;
    temporaryPassword?: string;
  };

  staff?: {
    id?: number;
    fullName?: string;
    role?: string;
    phone?: string | null;
    department?: string | null;
    active?: boolean;
  };

  error?: string;
};

const INITIAL_FORM: StaffForm = {
  full_name: "",
  phone: "",
  role: "Nurse",
  department: "",
  license_number: "",
  shift: "Day",
  employment_date: "",
};

export default function AddStaffModal({
  open,
  onClose,
}: Props) {
  const [step, setStep] = useState(1);

  const [form, setForm] =
    useState<StaffForm>(INITIAL_FORM);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    createdCredentials,
    setCreatedCredentials,
  ] = useState<CreatedCredentials | null>(
    null
  );

  const [
    showTemporaryPassword,
    setShowTemporaryPassword,
  ] = useState(false);

  const [copiedField, setCopiedField] =
    useState<
      "staff-code" | "password" | "both" | null
    >(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(1);
    setForm(INITIAL_FORM);
    setLoading(false);
    setError("");
    setCreatedCredentials(null);
    setShowTemporaryPassword(false);
    setCopiedField(null);
  }, [open]);

  function updateForm<K extends keyof StaffForm>(
    field: K,
    value: StaffForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function copyText(
    text: string,
    field:
      | "staff-code"
      | "password"
      | "both"
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (copyError) {
      console.error(
        "Unable to copy credentials:",
        copyError
      );

      setError(
        "The credentials could not be copied automatically. Select and copy them manually."
      );
    }
  }

  async function createStaff() {
    if (loading) {
      return;
    }

    if (!form.full_name.trim()) {
      setError(
        "Enter the staff member's full name."
      );

      setStep(1);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !sessionData.session?.access_token
      ) {
        throw new Error(
          "Your administrator session has expired. Sign in again."
        );
      }

      const response = await fetch(
        "/api/staff/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${sessionData.session.access_token}`,
          },

          body: JSON.stringify({
            full_name:
              form.full_name.trim(),

            phone:
              form.phone.trim() || null,

            role:
              form.role,

            department:
              form.department.trim() ||
              null,

            license_number:
              form.license_number.trim() ||
              null,

            shift:
              form.shift,

            employment_date:
              form.employment_date || null,
          }),
        }
      );

      const result =
        (await response.json()) as CreateStaffResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to create the staff account."
        );
      }

      const staffCode =
        result.credentials?.staffCode;

      const temporaryPassword =
        result.credentials
          ?.temporaryPassword;

      if (
        !staffCode ||
        !temporaryPassword
      ) {
        throw new Error(
          "The staff account was created, but the credentials were not returned. Reset the password from Staff Management."
        );
      }

      setCreatedCredentials({
        staffCode,
        temporaryPassword,
      });

      setShowTemporaryPassword(true);
      setCopiedField(null);
    } catch (caughtError) {
      console.error(
        "Unable to create staff:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create the staff account."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  const credentialsText =
    createdCredentials
      ? [
          "La-Cura Staff Login",
          "",
          `Staff Code: ${createdCredentials.staffCode}`,
          `Temporary Password: ${createdCredentials.temporaryPassword}`,
          "",
          "The staff member must keep these credentials private.",
        ].join("\n")
      : "";

  return (
    <div
      role="presentation"
      onMouseDown={handleClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={
          createdCredentials
            ? "Staff account credentials"
            : "Add staff member"
        }
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-2xl overflow-hidden rounded-[4px] border border-[#AEBAB4] bg-white shadow-lg"
      >
        {createdCredentials ? (
          <>
            <header className="bg-[#073B2F] px-4 py-3 text-white sm:px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-white/15">
                    <AppIcon
                      icon={faCheck}
                      className="text-2xl"
                    />
                  </div>

                  <div>
                    <h2 className="text-[16px] font-bold">
                      Staff Account Created
                    </h2>

                    <p className="mt-1 text-green-100">
                      Copy these credentials
                      before closing.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close credentials"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-white/15 transition hover:bg-white/25"
                >
                  <AppIcon icon={faXmark} />
                </button>
              </div>
            </header>

            <main className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-start gap-3 rounded-[4px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
                <AppIcon
                  icon={
                    faTriangleExclamation
                  }
                  className="mt-1 shrink-0"
                />

                <p>
                  The temporary password is
                  displayed only now. Give the
                  staff code and password
                  directly to the staff member.
                  Do not send them through an
                  unsecured public message.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <CredentialField
                  label="Staff Code"
                  value={
                    createdCredentials.staffCode
                  }
                  icon={faIdCard}
                  copied={
                    copiedField ===
                    "staff-code"
                  }
                  onCopy={() =>
                    copyText(
                      createdCredentials.staffCode,
                      "staff-code"
                    )
                  }
                />

                <div>
                  <label className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                    <AppIcon
                      icon={faKey}
                      className="text-[#073B2F]"
                    />

                    Temporary Password
                  </label>

                  <div className="flex items-stretch overflow-hidden rounded-[3px] border border-slate-300 bg-slate-50">
                    <div className="min-w-0 flex-1 px-4 py-3.5 font-mono text-sm font-bold tracking-wider text-slate-900 sm:text-base">
                      {showTemporaryPassword
                        ? createdCredentials.temporaryPassword
                        : "••••••••••••••••"}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowTemporaryPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showTemporaryPassword
                          ? "Hide temporary password"
                          : "Show temporary password"
                      }
                      className="border-l border-slate-300 px-4 text-slate-600 transition hover:bg-slate-100 hover:text-[#073B2F]"
                    >
                      <AppIcon
                        icon={
                          showTemporaryPassword
                            ? faEyeSlash
                            : faEye
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          createdCredentials.temporaryPassword,
                          "password"
                        )
                      }
                      className="inline-flex items-center gap-2 border-l border-slate-300 px-4 font-bold text-[#073B2F] transition hover:bg-green-50"
                    >
                      <AppIcon
                        icon={
                          copiedField ===
                          "password"
                            ? faCheck
                            : faCopy
                        }
                      />

                      <span className="hidden sm:inline">
                        {copiedField ===
                        "password"
                          ? "Copied"
                          : "Copy"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[4px] border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <AppIcon
                    icon={faShieldHalved}
                    className="mt-1 shrink-0 text-blue-700"
                  />

                  <div>
                    <p className="font-bold text-blue-900">
                      Staff login instructions
                    </p>

                    <p className="mt-2 text-sm leading-6 text-blue-700">
                      The staff member should
                      open the La-Cura login page,
                      enter the staff code and
                      temporary password, then
                      create a private password
                      when prompted.
                    </p>
                  </div>
                </div>
              </div>
            </main>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() =>
                  copyText(
                    credentialsText,
                    "both"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-green-700 bg-white px-6 py-3 font-bold text-[#073B2F] transition hover:bg-green-50"
              >
                <AppIcon
                  icon={
                    copiedField === "both"
                      ? faCheck
                      : faClipboard
                  }
                />

                {copiedField === "both"
                  ? "Credentials Copied"
                  : "Copy Both Credentials"}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-[#073B2F] px-6 py-3 font-bold text-white transition hover:bg-[#0D4A3A]"
              >
                <AppIcon icon={faCheck} />

                Done
              </button>
            </footer>
          </>
        ) : (
          <>
            <header className="bg-[#073B2F] px-4 py-3 text-white sm:px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-white/15">
                    <AppIcon
                      icon={faUserPlus}
                      className="text-2xl"
                    />
                  </div>

                  <div>
                    <h2 className="text-[16px] font-bold">
                      Add Staff Member
                    </h2>

                    <p className="mt-1 text-green-100">
                      Step {step} of 2
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  aria-label="Close add staff modal"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-white/15 transition hover:bg-white/25 disabled:opacity-50"
                >
                  <AppIcon icon={faXmark} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div
                  className={`h-2 rounded-full ${
                    step >= 1
                      ? "bg-white"
                      : "bg-white/25"
                  }`}
                />

                <div
                  className={`h-2 rounded-full ${
                    step >= 2
                      ? "bg-white"
                      : "bg-white/25"
                  }`}
                />
              </div>
            </header>

            <main className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 sm:p-8">
              {step === 1 ? (
                <div className="space-y-5">
                  <FormField
                    id="add-staff-name"
                    label="Full Name"
                    icon={faUser}
                  >
                    <input
                      id="add-staff-name"
                      type="text"
                      value={
                        form.full_name
                      }
                      onChange={(event) =>
                        updateForm(
                          "full_name",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      placeholder="Enter full name"
                      autoComplete="name"
                      className="staff-input"
                    />
                  </FormField>

                  <FormField
                    id="add-staff-phone"
                    label="Phone Number"
                    icon={faPhone}
                  >
                    <input
                      id="add-staff-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateForm(
                          "phone",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      placeholder="Optional phone number"
                      autoComplete="tel"
                      className="staff-input"
                    />
                  </FormField>

                  <FormField
                    id="add-staff-role"
                    label="Role"
                    icon={faIdCard}
                  >
                    <select
                      id="add-staff-role"
                      value={form.role}
                      onChange={(event) =>
                        updateForm(
                          "role",
                          event.target
                            .value as StaffRole
                        )
                      }
                      disabled={loading}
                      className="staff-input"
                    >
                      <option value="Administrator">
                        Administrator
                      </option>

                      <option value="Nurse">
                        Nurse
                      </option>

                      <option value="Physician">
                        Physician
                      </option>
                    </select>
                  </FormField>

                  <div className="rounded-[4px] border border-green-200 bg-green-50 p-5">
                    <div className="flex items-start gap-3">
                      <AppIcon
                        icon={faShieldHalved}
                        className="mt-1 shrink-0 text-[#073B2F]"
                      />

                      <div>
                        <p className="font-bold text-green-900">
                          No email invitation
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#073B2F]">
                          La-Cura will generate a
                          staff code and temporary
                          password. You will give
                          them directly to the
                          staff member.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <FormField
                    id="add-staff-department"
                    label="Department"
                    icon={faBuilding}
                  >
                    <input
                      id="add-staff-department"
                      type="text"
                      value={
                        form.department
                      }
                      onChange={(event) =>
                        updateForm(
                          "department",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      placeholder="Optional department"
                      className="staff-input"
                    />
                  </FormField>

                  <FormField
                    id="add-staff-license"
                    label="License Number"
                    icon={faIdCard}
                  >
                    <input
                      id="add-staff-license"
                      type="text"
                      value={
                        form.license_number
                      }
                      onChange={(event) =>
                        updateForm(
                          "license_number",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      placeholder="Optional license number"
                      className="staff-input"
                    />
                  </FormField>

                  <FormField
                    id="add-staff-shift"
                    label="Shift"
                    icon={faClock}
                  >
                    <select
                      id="add-staff-shift"
                      value={form.shift}
                      onChange={(event) =>
                        updateForm(
                          "shift",
                          event.target
                            .value as StaffShift
                        )
                      }
                      disabled={loading}
                      className="staff-input"
                    >
                      <option value="Day">
                        Day
                      </option>

                      <option value="Night">
                        Night
                      </option>
                    </select>
                  </FormField>

                  <FormField
                    id="add-staff-date"
                    label="Employment Date"
                    icon={faCalendarDays}
                  >
                    <input
                      id="add-staff-date"
                      type="date"
                      value={
                        form.employment_date
                      }
                      onChange={(event) =>
                        updateForm(
                          "employment_date",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      className="staff-input"
                    />
                  </FormField>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-[4px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
                >
                  <AppIcon
                    icon={
                      faTriangleExclamation
                    }
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}
            </main>

            <footer className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-[3px] border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setStep(1)
                  }
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-[3px] border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  <AppIcon
                    icon={faArrowLeft}
                  />

                  Back
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !form.full_name.trim()
                    ) {
                      setError(
                        "Enter the staff member's full name."
                      );

                      return;
                    }

                    setError("");
                    setStep(2);
                  }}
                  disabled={
                    loading ||
                    !form.full_name.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-[3px] bg-[#073B2F] px-6 py-3 font-bold text-white transition hover:bg-[#0D4A3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next

                  <AppIcon
                    icon={faArrowRight}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={createStaff}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-[3px] bg-[#073B2F] px-6 py-3 font-bold text-white transition hover:bg-[#0D4A3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <AppIcon
                    icon={
                      loading
                        ? faSpinner
                        : faUserPlus
                    }
                    spin={loading}
                  />

                  {loading
                    ? "Creating Account..."
                    : "Create Staff Account"}
                </button>
              )}
            </footer>
          </>
        )}
      </section>

      <style jsx>{`
        .staff-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 0.875rem 1rem;
          color: rgb(15 23 42);
          outline: none;
          transition: 150ms;
        }

        .staff-input:focus {
          border-color: rgb(22 163 74);
          box-shadow: 0 0 0 4px rgb(220 252 231);
        }

        .staff-input:disabled {
          cursor: not-allowed;
          background: rgb(241 245 249);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  icon: IconDefinition;
  children: ReactNode;
};

function FormField({
  id,
  label,
  icon,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 font-bold text-slate-800"
      >
        <AppIcon
          icon={icon}
          className="text-[#073B2F]"
        />

        {label}
      </label>

      {children}
    </div>
  );
}

type CredentialFieldProps = {
  label: string;
  value: string;
  icon: IconDefinition;
  copied: boolean;
  onCopy: () => void;
};

function CredentialField({
  label,
  value,
  icon,
  copied,
  onCopy,
}: CredentialFieldProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 font-bold text-slate-800">
        <AppIcon
          icon={icon}
          className="text-[#073B2F]"
        />

        {label}
      </label>

      <div className="flex items-stretch overflow-hidden rounded-[3px] border border-slate-300 bg-slate-50">
        <div className="min-w-0 flex-1 break-all px-4 py-3.5 font-mono text-sm font-bold tracking-wider text-slate-900 sm:text-base">
          {value}
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 border-l border-slate-300 px-4 font-bold text-[#073B2F] transition hover:bg-green-50"
        >
          <AppIcon
            icon={
              copied ? faCheck : faCopy
            }
          />

          <span className="hidden sm:inline">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>
    </div>
  );
}