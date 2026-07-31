"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  faArrowLeft,
  faArrowRight,
  faBuilding,
  faCalendarDays,
  faClock,
  faEnvelope,
  faIdCard,
  faPhone,
  faSpinner,
  faUser,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type Props = {
  open: boolean;
  onClose: () => void;
};

type StaffForm = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  license_number: string;
  shift: string;
  employment_date: string;
};

const INITIAL_FORM: StaffForm = {
  full_name: "",
  email: "",
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
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");

  const [form, setForm] =
    useState<StaffForm>(INITIAL_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(1);
    setError("");
    setForm(INITIAL_FORM);
  }, [open]);

  function updateForm(
    field: keyof StaffForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleClose() {
    if (!loading) {
      onClose();
    }
  }

  async function createStaff() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/staff/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to create staff member."
        );
      }

      alert("Invitation sent successfully.");
      onClose();
      window.location.reload();
    } catch (caughtError) {
      console.error(
        "Unable to create staff:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create staff member."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
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
        aria-label="Add staff member"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-2xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-r from-green-800 to-green-600 px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <AppIcon
                  icon={faUserPlus}
                  className="text-2xl"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black">
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:opacity-50"
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
                  value={form.full_name}
                  onChange={(event) =>
                    updateForm(
                      "full_name",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Enter full name"
                  className="staff-input"
                />
              </FormField>

              <FormField
                id="add-staff-email"
                label="Email Address"
                icon={faEnvelope}
              >
                <input
                  id="add-staff-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm(
                      "email",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Enter email address"
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
                  placeholder="Enter phone number"
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
                      event.target.value
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
                  value={form.department}
                  onChange={(event) =>
                    updateForm(
                      "department",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Enter department"
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
                  value={form.license_number}
                  onChange={(event) =>
                    updateForm(
                      "license_number",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="Enter license number"
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
                      event.target.value
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
                  value={form.employment_date}
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
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}
        </main>

        <footer className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
          {step === 1 ? (
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <AppIcon icon={faArrowLeft} />

              Back
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={
                loading ||
                !form.full_name.trim() ||
                !form.email.trim()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next

              <AppIcon icon={faArrowRight} />
            </button>
          ) : (
            <button
              type="button"
              onClick={createStaff}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <AppIcon
                  icon={faSpinner}
                  spin
                />
              )}

              {loading
                ? "Creating..."
                : "Create Staff"}
            </button>
          )}
        </footer>
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
  icon: Parameters<typeof AppIcon>[0]["icon"];
  children: React.ReactNode;
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
          className="text-green-700"
        />

        {label}
      </label>

      {children}
    </div>
  );
}