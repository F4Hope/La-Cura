"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import {
  faBuilding,
  faEnvelope,
  faMagnifyingGlass,
  faPenToSquare,
  faShieldHalved,
  faStethoscope,
  faUserGear,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AddStaffModal from "@/components/AddStaffModal";
import DeactivateStaffButton from "@/components/DeactivateStaffButton";
import EditStaffModal from "@/components/EditStaffModal";
import ResetPasswordButton from "@/components/ResetPasswordButton";
import AppIcon from "@/components/ui/AppIcon";

import { getStaff } from "@/lib/staff";

export type StaffMember = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  department?: string | null;
  license_number?: string | null;
  shift?: string | null;
  employment_date?: string | null;
  active: boolean;
};

function normalize(value: unknown): string {
  return typeof value === "string"
    ? value.toLowerCase().trim()
    : "";
}

export default function StaffPage() {
  const [staff, setStaff] = useState<
    StaffMember[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getStaff();

      setStaff(
        Array.isArray(data)
          ? (data as StaffMember[])
          : []
      );
    } catch (caughtError) {
      console.error(
        "Unable to load staff:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load staff members."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    const query = normalize(search);

    if (!query) {
      return staff;
    }

    return staff.filter((person) => {
      return [
        person.full_name,
        person.email,
        person.role,
        person.department,
        person.phone,
      ].some((value) =>
        normalize(value).includes(query)
      );
    });
  }, [staff, search]);

  const statistics = useMemo(() => {
    return {
      nurses: staff.filter(
        (person) =>
          normalize(person.role) === "nurse"
      ).length,

      physicians: staff.filter(
        (person) =>
          normalize(person.role) ===
          "physician"
      ).length,

      administrators: staff.filter(
        (person) =>
          normalize(person.role) ===
          "administrator"
      ).length,
    };
  }, [staff]);

  function openEditModal(
    person: StaffMember
  ) {
    setSelectedStaff(person);
    setEditOpen(true);
  }

  function closeAddModal() {
    setAddOpen(false);
    void loadStaff();
  }

  function closeEditModal() {
    setEditOpen(false);
    setSelectedStaff(null);
    void loadStaff();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="relative overflow-hidden rounded-b-[40px] bg-gradient-to-r from-green-800 via-green-700 to-green-600 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-24 left-1/2 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-14">
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div>
              <span className="font-semibold uppercase tracking-[5px] text-green-100">
                Staff Management
              </span>

              <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
                Healthcare Team
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-green-100 sm:text-xl sm:leading-9">
                Manage administrators, nurses,
                and physicians responsible for
                delivering exceptional care.
              </p>
            </div>

            <div className="w-full rounded-[30px] bg-white/15 p-7 backdrop-blur-xl lg:min-w-[350px] lg:max-w-md lg:p-8">
              <div className="grid grid-cols-2 gap-7">
                <StaffMetric
                  icon={faUsers}
                  value={staff.length}
                  label="Total Staff"
                />

                <StaffMetric
                  icon={faUserGear}
                  value={
                    statistics.administrators
                  }
                  label="Administrators"
                />

                <StaffMetric
                  icon={faShieldHalved}
                  value={statistics.nurses}
                  label="Nurses"
                />

                <StaffMetric
                  icon={faStethoscope}
                  value={statistics.physicians}
                  label="Physicians"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-10 flex flex-col items-stretch justify-between gap-5 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-[470px]">
            <AppIcon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search staff by name, email, role, or department..."
              className="h-16 w-full rounded-2xl border border-gray-200 bg-white pl-14 pr-6 text-gray-900 shadow-lg outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-green-700 px-8 font-bold text-white shadow-xl transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <AppIcon
              icon={faUserPlus}
              className="text-xl"
            />

            Add Staff
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[30px] bg-white py-24 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <p className="mt-5 font-semibold text-gray-500">
              Loading staff directory...
            </p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="rounded-[30px] bg-white py-24 text-center shadow-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-green-100">
              <AppIcon
                icon={faShieldHalved}
                className="text-5xl text-green-600"
              />
            </div>

            <h2 className="mt-8 text-3xl font-black text-gray-900">
              No Staff Found
            </h2>

            <p className="mt-4 text-lg text-gray-500">
              No staff members match the current
              search.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {filteredStaff.map((person) => (
              <article
                key={person.id}
                className="group overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="h-2 bg-green-600" />

                <div className="p-7">
                  <div className="flex min-w-0 items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-green-500 text-3xl font-black text-white">
                      {person.full_name
                        ?.trim()
                        .charAt(0)
                        .toUpperCase() || "S"}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-2xl font-black text-gray-900">
                        {person.full_name}
                      </h2>

                      <div className="mt-2 flex min-w-0 items-center gap-2 text-gray-500">
                        <AppIcon
                          icon={faEnvelope}
                          className="shrink-0 text-sm"
                        />

                        <span className="truncate">
                          {person.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {person.department && (
                    <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <AppIcon
                        icon={faBuilding}
                        className="text-green-700"
                      />

                      <span>
                        {person.department}
                      </span>
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700">
                      {person.role}
                    </span>

                    <span
                      className={`rounded-full px-4 py-2 font-semibold ${
                        person.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {person.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(person)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    >
                      <AppIcon
                        icon={faPenToSquare}
                      />

                      Edit
                    </button>

                    <ResetPasswordButton
                      email={person.email}
                    />
                  </div>

                  <div className="mt-3">
                    <DeactivateStaffButton
                      id={person.id}
                      active={person.active}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <AddStaffModal
        open={addOpen}
        onClose={closeAddModal}
      />

      <EditStaffModal
        open={editOpen}
        onClose={closeEditModal}
        staff={selectedStaff}
      />
    </div>
  );
}

type StaffMetricProps = {
  icon: IconDefinition;
  value: number;
  label: string;
};

function StaffMetric({
  icon,
  value,
  label,
}: StaffMetricProps) {
  return (
    <div>
      <AppIcon
        icon={icon}
        className="mb-3 text-3xl text-white"
      />

      <p className="text-4xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-green-100">
        {label}
      </p>
    </div>
  );
}