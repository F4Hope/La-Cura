"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  faBuilding,
  faFloppyDisk,
  faIdCard,
  faPhone,
  faSpinner,
  faUser,
  faUserPen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type StaffMember = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  role: string;
  active: boolean;
};

type StaffForm = StaffMember & {
  phone: string;
  department: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
};

export default function EditStaffModal({
  open,
  onClose,
  staff,
}: Props) {
  const [form, setForm] =
    useState<StaffForm | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!staff) {
      setForm(null);
      return;
    }

    setForm({
      ...staff,
      phone: staff.phone ?? "",
      department: staff.department ?? "",
    });

    setError("");
  }, [staff, open]);

  function updateForm(
    field: keyof StaffForm,
    value: string
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
    if (!loading) {
      onClose();
    }
  }

  async function save() {
    if (!form || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/staff/update",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = (await response
        .json()
        .catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update staff member."
        );
      }

      onClose();
      window.location.reload();
    } catch (caughtError) {
      console.error(
        "Unable to update staff:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update staff member."
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
        aria-label="Edit staff member"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-auto w-full max-w-xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <AppIcon
                  icon={faUserPen}
                  className="text-2xl"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Edit Staff
                </h2>

                <p className="mt-1 text-blue-100">
                  Update staff information and
                  role.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close edit staff modal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:opacity-50"
            >
              <AppIcon icon={faXmark} />
            </button>
          </div>
        </header>

        <main className="space-y-5 p-6 sm:p-8">
          <EditField
            id="edit-staff-name"
            label="Full Name"
            icon={faUser}
          >
            <input
              id="edit-staff-name"
              value={form.full_name}
              onChange={(event) =>
                updateForm(
                  "full_name",
                  event.target.value
                )
              }
              disabled={loading}
              className="edit-input"
            />
          </EditField>

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
              className="edit-input"
            />
          </EditField>

          <EditField
            id="edit-staff-department"
            label="Department"
            icon={faBuilding}
          >
            <input
              id="edit-staff-department"
              value={form.department}
              onChange={(event) =>
                updateForm(
                  "department",
                  event.target.value
                )
              }
              disabled={loading}
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
                  event.target.value
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

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}
        </main>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={save}
            disabled={
              loading ||
              !form.full_name.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              ? "Saving..."
              : "Save Changes"}
          </button>
        </footer>
      </section>

      <style jsx>{`
        .edit-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 0.875rem 1rem;
          color: rgb(15 23 42);
          outline: none;
          transition: 150ms;
        }

        .edit-input:focus {
          border-color: rgb(37 99 235);
          box-shadow: 0 0 0 4px rgb(219 234 254);
        }

        .edit-input:disabled {
          cursor: not-allowed;
          background: rgb(241 245 249);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

type EditFieldProps = {
  id: string;
  label: string;
  icon: Parameters<typeof AppIcon>[0]["icon"];
  children: React.ReactNode;
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