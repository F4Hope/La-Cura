"use client";

import type { ReactNode } from "react";

import {
  useEffect,
  useState,
} from "react";

import type {
  IconDefinition,
} from "@fortawesome/fontawesome-svg-core";

import {
  faBuilding,
  faCalendarDays,
  faClock,
  faFloppyDisk,
  faIdCard,
  faPhone,
  faSpinner,
  faTriangleExclamation,
  faUser,
  faUserPen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import { supabase } from "@/lib/supabase/client";

type StaffRole =
  | "Administrator"
  | "Nurse"
  | "Physician";

type StaffShift =
  | "Day"
  | "Night";

type StaffMember = {
  id: number;
  auth_user_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  role: string;
  active?: boolean | null;
  staff_code?: string | null;
  license_number?: string | null;
  shift?: string | null;
  employment_date?: string | null;
  must_change_password?: boolean;
  credentials_created_at?: string | null;
};

type StaffForm = {
  id: number;
  full_name: string;
  phone: string;
  department: string;
  role: StaffRole;
  license_number: string;
  shift: StaffShift;
  employment_date: string;
  staff_code: string;
};

type UpdateStaffResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  staff?: {
    id?: number;
    fullName?: string;
    phone?: string | null;
    department?: string | null;
    role?: string;
    licenseNumber?: string | null;
    shift?: string | null;
    employmentDate?: string | null;
    active?: boolean | null;
    staffCode?: string;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
};

function normalizeRole(
  value: string
): StaffRole {
  if (value === "Administrator") {
    return "Administrator";
  }

  if (value === "Physician") {
    return "Physician";
  }

  return "Nurse";
}

function normalizeShift(
  value: string | null | undefined
): StaffShift {
  return value === "Night"
    ? "Night"
    : "Day";
}

export default function EditStaffModal({
  open,
  onClose,
  staff,
}: Props) {
  const [form, setForm] =
    useState<StaffForm | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || !staff) {
      setForm(null);
      setError("");
      setLoading(false);
      return;
    }

    setForm({
      id: staff.id,
      full_name:
        staff.full_name ?? "",
      phone:
        staff.phone ?? "",
      department:
        staff.department ?? "",
      role:
        normalizeRole(staff.role),
      license_number:
        staff.license_number ?? "",
      shift:
        normalizeShift(staff.shift),
      employment_date:
        staff.employment_date ?? "",
      staff_code:
        staff.staff_code ?? "",
    });

    setError("");
    setLoading(false);
  }, [open, staff]);

  function updateForm<
    K extends keyof StaffForm,
  >(
    field: K,
    value: StaffForm[K]
  ) {
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function save() {
    if (!form || loading) {
      return;
    }

    if (
      form.full_name.trim().length < 2
    ) {
      setError(
        "Enter the staff member's full name."
      );

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

      const accessToken =
        sessionData.session
          ?.access_token;

      if (
        sessionError ||
        !accessToken
      ) {
        throw new Error(
          "Your administrator session has expired. Sign in again."
        );
      }

      const response = await fetch(
        "/api/staff/update",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            id: form.id,

            full_name:
              form.full_name.trim(),

            phone:
              form.phone.trim() || null,

            department:
              form.department.trim() ||
              null,

            role:
              form.role,

            license_number:
              form.license_number.trim() ||
              null,

            shift:
              form.shift,

            employment_date:
              form.employment_date ||
              null,
          }),
        }
      );

      const result =
        (await response
          .json()
          .catch(
            () =>
              ({}) as UpdateStaffResponse
          )) as UpdateStaffResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update the staff member."
        );
      }

      onClose();
    } catch (caughtError) {
      console.error(
        "Unable to update staff:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update the staff member."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open || !staff || !form) {
    return null;
  }

  return (
    <div
      role="presentation"
      onMouseDown={handleClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-staff-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-2xl overflow-hidden rounded-[4px] border border-[#AEBAB4] bg-white shadow-lg"
      >
        <header className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-3 text-white sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-white/15">
                <AppIcon
                  icon={faUserPen}
                  className="text-2xl"
                />
              </div>

              <div>
                <h2
                  id="edit-staff-title"
                  className="text-[16px] font-bold"
                >
                  Edit Staff Member
                </h2>

                <p className="mt-1 text-blue-100">
                  Update employment and
                  account information.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close edit staff modal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-white/15 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AppIcon icon={faXmark} />
            </button>
          </div>
        </header>

        <main className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <EditField
                id="edit-staff-name"
                label="Full Name"
                icon={faUser}
              >
                <input
                  id="edit-staff-name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    updateForm(
                      "full_name",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="name"
                  className="edit-input"
                />
              </EditField>
            </div>

            <EditField
              id="edit-staff-phone"
              label="Phone Number"
              icon={faPhone}
            >
              <input
                id="edit-staff-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateForm(
                    "phone",
                    event.target.value
                  )
                }
                disabled={loading}
                placeholder="Optional"
                autoComplete="tel"
                className="edit-input"
              />
            </EditField>

            <EditField
              id="edit-staff-role"
              label="Role"
              icon={faIdCard}
            >
              <select
                id="edit-staff-role"
                value={form.role}
                onChange={(event) =>
                  updateForm(
                    "role",
                    event.target
                      .value as StaffRole
                  )
                }
                disabled={loading}
                className="edit-input"
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
            </EditField>

            <EditField
              id="edit-staff-department"
              label="Department"
              icon={faBuilding}
            >
              <input
                id="edit-staff-department"
                type="text"
                value={form.department}
                onChange={(event) =>
                  updateForm(
                    "department",
                    event.target.value
                  )
                }
                disabled={loading}
                placeholder="Optional"
                className="edit-input"
              />
            </EditField>

            <EditField
              id="edit-staff-license"
              label="License Number"
              icon={faIdCard}
            >
              <input
                id="edit-staff-license"
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
                placeholder="Optional"
                className="edit-input"
              />
            </EditField>

            <EditField
              id="edit-staff-shift"
              label="Shift"
              icon={faClock}
            >
              <select
                id="edit-staff-shift"
                value={form.shift}
                onChange={(event) =>
                  updateForm(
                    "shift",
                    event.target
                      .value as StaffShift
                  )
                }
                disabled={loading}
                className="edit-input"
              >
                <option value="Day">
                  Day
                </option>

                <option value="Night">
                  Night
                </option>
              </select>
            </EditField>

            <EditField
              id="edit-staff-date"
              label="Employment Date"
              icon={faCalendarDays}
            >
              <input
                id="edit-staff-date"
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
                className="edit-input"
              />
            </EditField>
          </div>

          {form.staff_code && (
            <div className="mt-6 rounded-[4px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <AppIcon
                  icon={faIdCard}
                  className="mt-1 shrink-0 text-blue-700"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Staff Code
                  </p>

                  <p className="mt-1 font-mono font-bold tracking-wider text-slate-900">
                    {form.staff_code}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Staff codes are permanent
                    and cannot be changed from
                    this form.
                  </p>
                </div>
              </div>
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

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-[3px] border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={save}
            disabled={
              loading ||
              form.full_name.trim()
                .length < 2
            }
            className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AppIcon
              icon={
                loading
                  ? faSpinner
                  : faFloppyDisk
              }
              spin={loading}
            />

            {loading
              ? "Saving Changes..."
              : "Save Changes"}
          </button>
        </footer>
      </section>

      <style jsx>{`
        .edit-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid
            rgb(203 213 225);
          background: white;
          padding: 0.875rem 1rem;
          color: rgb(15 23 42);
          outline: none;
          transition: 150ms;
        }

        .edit-input:focus {
          border-color:
            rgb(37 99 235);
          box-shadow:
            0 0 0 4px
            rgb(219 234 254);
        }

        .edit-input:disabled {
          cursor: not-allowed;
          background:
            rgb(241 245 249);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

type EditFieldProps = {
  id: string;
  label: string;
  icon: IconDefinition;
  children: ReactNode;
};

function EditField({
  id,
  label,
  icon,
  children,
}: EditFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 font-bold text-slate-800"
      >
        <AppIcon
          icon={icon}
          className="text-blue-700"
        />

        {label}
      </label>

      {children}
    </div>
  );
}