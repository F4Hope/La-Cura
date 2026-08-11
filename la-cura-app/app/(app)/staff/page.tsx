"use client";

import type {
  ReactNode,
} from "react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";

import AddStaffModal from "@/components/AddStaffModal";
import DeactivateStaffButton from "@/components/DeactivateStaffButton";
import EditStaffModal from "@/components/EditStaffModal";
import ResetPasswordButton from "@/components/ResetPasswordButton";

import {
  getStaff,
} from "@/lib/staff";


export type StaffMember = {
  id: number;

  auth_user_id?:
    | string
    | null;

  full_name: string;

  email?:
    | string
    | null;

  phone?:
    | string
    | null;

  role: string;

  department?:
    | string
    | null;

  license_number?:
    | string
    | null;

  shift?:
    | string
    | null;

  employment_date?:
    | string
    | null;

  active?:
    | boolean
    | null;

  staff_code: string;

  must_change_password?:
    | boolean;

  credentials_created_at?:
    | string
    | null;
};


function cleanText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function normalize(
  value: unknown
) {
  return cleanText(
    value
  ).toLowerCase();
}


function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
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


export default function StaffPage() {
  const [
    staff,
    setStaff,
  ] = useState<
    StaffMember[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    addOpen,
    setAddOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    selectedStaff,
    setSelectedStaff,
  ] =
    useState<StaffMember | null>(
      null
    );


  const loadStaff =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getStaff();

        const rows =
          Array.isArray(data)
            ? (data as
                StaffMember[])
            : [];

        setStaff(
          [...rows].sort(
            (a, b) =>
              cleanText(
                a.full_name
              ).localeCompare(
                cleanText(
                  b.full_name
                ),
                undefined,
                {
                  sensitivity:
                    "base",
                  numeric: true,
                }
              )
          )
        );
      } catch (
        caughtError
      ) {
        console.error(
          "Unable to load staff:",
          caughtError
        );

        setError(
          caughtError instanceof
          Error
            ? caughtError.message
            : "Unable to load staff members."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    void loadStaff();
  }, [
    loadStaff,
  ]);


  const roles =
    useMemo(() => {
      return [
        ...new Set(
          staff
            .map(
              (person) =>
                cleanText(
                  person.role
                )
            )
            .filter(Boolean)
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            undefined,
            {
              sensitivity:
                "base",
            }
          )
      );
    }, [
      staff,
    ]);


  const filteredStaff =
    useMemo(() => {
      const query =
        normalize(search);

      return staff.filter(
        (person) => {
          const matchesSearch =
            !query ||
            [
              person.full_name,
              person.staff_code,
              person.email,
              person.phone,
              person.role,
              person.department,
              person.license_number,
              person.shift,
            ].some(
              (value) =>
                normalize(
                  value
                ).includes(
                  query
                )
            );


          const matchesRole =
            roleFilter ===
              "all" ||
            normalize(
              person.role
            ) ===
              normalize(
                roleFilter
              );


          const active =
            person.active ===
            true;


          const matchesStatus =
            statusFilter ===
              "all" ||
            (statusFilter ===
              "active" &&
              active) ||
            (statusFilter ===
              "inactive" &&
              !active);


          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );
    }, [
      roleFilter,
      search,
      staff,
      statusFilter,
    ]);


  const statistics =
    useMemo(() => {
      const active =
        staff.filter(
          (person) =>
            person.active ===
            true
        );

      return {
        total:
          staff.length,

        active:
          active.length,

        nurses:
          active.filter(
            (person) =>
              normalize(
                person.role
              ) === "nurse"
          ).length,

        physicians:
          active.filter(
            (person) =>
              normalize(
                person.role
              ) ===
              "physician"
          ).length,

        administrators:
          active.filter(
            (person) =>
              normalize(
                person.role
              ) ===
              "administrator"
          ).length,
      };
    }, [
      staff,
    ]);


  function openEditModal(
    person:
      StaffMember
  ) {
    setSelectedStaff(
      person
    );

    setEditOpen(true);
  }


  function closeAddModal() {
    setAddOpen(false);

    void loadStaff();
  }


  function closeEditModal() {
    setEditOpen(false);

    setSelectedStaff(
      null
    );

    void loadStaff();
  }


  function resetFilters() {
    setSearch("");
    setRoleFilter(
      "all"
    );
    setStatusFilter(
      "all"
    );
  }


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* HEADER */}

      <section className="border-b border-[#CCD5D0] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="hover:text-[#073B2F]"
              >
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-[#40524B]">
                Staff
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                Staff Management
              </h1>

              <p className="text-xs text-[#718078]">
                Accounts, roles, credentials, and access
              </p>
            </div>
          </div>


          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                void loadStaff()
              }
              disabled={
                loading
              }
              className="
                inline-flex h-8
                items-center gap-1.5
                border
                border-[#AAB8B1]
                bg-white px-3
                text-[10px]
                font-bold
                text-[#40544B]
                hover:border-[#073B2F]
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={11}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              href="/settings"
              className="
                inline-flex h-8
                items-center gap-1.5
                border
                border-[#AAB8B1]
                bg-white px-3
                text-[10px]
                font-bold
                text-[#40544B]
                hover:border-[#073B2F]
              "
            >
              <Settings
                size={11}
              />

              Settings
            </Link>

            <button
              type="button"
              onClick={() =>
                setAddOpen(
                  true
                )
              }
              className="
                inline-flex h-8
                items-center gap-1.5
                border
                border-[#063428]
                bg-[#073B2F]
                px-3
                text-[10px]
                font-bold
                text-white
                hover:bg-[#0D4A3A]
              "
            >
              <Plus
                size={12}
              />

              Create Staff Account
            </button>
          </div>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* SUMMARY */}

        <section className="mb-3 grid border border-[#CBD4D0] bg-white sm:grid-cols-5">
          <SummaryCell
            label="Staff Accounts"
            value={
              statistics.total
            }
          />

          <SummaryCell
            label="Active"
            value={
              statistics.active
            }
          />

          <SummaryCell
            label="Nurses"
            value={
              statistics.nurses
            }
          />

          <SummaryCell
            label="Physicians"
            value={
              statistics.physicians
            }
          />

          <SummaryCell
            label="Administrators"
            value={
              statistics.administrators
            }
          />
        </section>


        <section className="border border-[#C8D2CD] bg-white">
          {/* TOOLBAR */}

          <div className="border-b border-[#D8DFDB] bg-[#F8F7F2] p-2.5">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6D7D76]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search name, staff code, role, department, phone, email..."
                  className="
                    h-8 w-full
                    border
                    border-[#BCC9C3]
                    bg-white
                    pl-8 pr-3
                    text-xs
                    text-[#1D2F28]
                    outline-none
                    placeholder:text-[#8B9892]
                    focus:border-[#59766B]
                    focus:ring-1
                    focus:ring-[#59766B]/20
                  "
                />
              </div>


              <select
                value={
                  roleFilter
                }
                onChange={(
                  event
                ) =>
                  setRoleFilter(
                    event.target
                      .value
                  )
                }
                className="
                  h-8 min-w-[155px]
                  border
                  border-[#BCC9C3]
                  bg-white
                  px-2.5
                  text-[10px]
                  font-semibold
                  text-[#40544B]
                  outline-none
                  focus:border-[#59766B]
                "
              >
                <option value="all">
                  All Roles
                </option>

                {roles.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  )
                )}
              </select>


              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value
                  )
                }
                className="
                  h-8 min-w-[145px]
                  border
                  border-[#BCC9C3]
                  bg-white
                  px-2.5
                  text-[10px]
                  font-semibold
                  text-[#40544B]
                  outline-none
                  focus:border-[#59766B]
                "
              >
                <option value="all">
                  All Accounts
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>


              {(search ||
                roleFilter !==
                  "all" ||
                statusFilter !==
                  "all") && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="
                    h-8 border
                    border-[#BCC9C3]
                    bg-white px-3
                    text-[10px]
                    font-bold
                    text-[#52645C]
                    hover:bg-[#F2F4F2]
                  "
                >
                  Reset
                </button>
              )}
            </div>
          </div>


          <div className="flex items-center justify-between border-b border-[#D8DFDB] bg-[#FBFAF7] px-3 py-1.5 text-[10px]">
            <span className="text-[#607169]">
              Showing{" "}
              <strong className="text-[#263A32]">
                {
                  filteredStaff.length
                }
              </strong>{" "}
              staff account
              {filteredStaff.length ===
              1
                ? ""
                : "s"}
            </span>

            <span className="font-semibold text-[#7D6A35]">
              A–Z Staff Directory
            </span>
          </div>


          {error && (
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
              {error}
            </div>
          )}


          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="text-center">
                <LoaderCircle
                  size={22}
                  className="mx-auto animate-spin text-[#073B2F]"
                />

                <p className="mt-2 text-[10px] font-semibold text-[#65756D]">
                  Loading staff directory...
                </p>
              </div>
            </div>
          ) : filteredStaff.length >
            0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1550px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase tracking-[0.035em] text-[#354A41]">
                    <ClinicalHead>
                      Staff Member
                    </ClinicalHead>

                    <ClinicalHead>
                      Staff Code
                    </ClinicalHead>

                    <ClinicalHead>
                      Role
                    </ClinicalHead>

                    <ClinicalHead>
                      Department
                    </ClinicalHead>

                    <ClinicalHead>
                      Contact
                    </ClinicalHead>

                    <ClinicalHead>
                      Shift
                    </ClinicalHead>

                    <ClinicalHead>
                      License
                    </ClinicalHead>

                    <ClinicalHead>
                      Employment
                    </ClinicalHead>

                    <ClinicalHead>
                      Credentials
                    </ClinicalHead>

                    <ClinicalHead>
                      Status
                    </ClinicalHead>

                    <ClinicalHead>
                      Actions
                    </ClinicalHead>
                  </tr>
                </thead>


                <tbody>
                  {filteredStaff.map(
                    (
                      person,
                      index
                    ) => {
                      const active =
                        person.active ===
                        true;

                      return (
                        <tr
                          key={
                            person.id
                          }
                          className={`
                            border-b
                            border-[#E1E6E3]
                            align-top
                            text-[11px]

                            ${
                              index %
                                2 ===
                              0
                                ? "bg-white"
                                : "bg-[#FAFAF7]"
                            }

                            hover:bg-[#FFFDF7]
                          `}
                        >
                          <td className="min-w-[210px] px-3 py-2">
                            <p className="font-bold text-[#263A32]">
                              {cleanText(
                                person.full_name
                              ) ||
                                "Staff Member"}
                            </p>

                            {person.email && (
                              <p className="mt-0.5 truncate text-[9px] text-[#74837C]">
                                {
                                  person.email
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-3 py-2 font-mono text-[10px] font-bold text-[#073B2F]">
                            {cleanText(
                              person.staff_code
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2">
                            <span className="inline-flex border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                              {cleanText(
                                person.role
                              ) ||
                                "Staff"}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-[#506159]">
                            {cleanText(
                              person.department
                            ) ||
                              "—"}
                          </td>

                          <td className="min-w-[180px] px-3 py-2 text-[#506159]">
                            <p>
                              {cleanText(
                                person.phone
                              ) ||
                                "—"}
                            </p>

                            {person.phone &&
                              person.email && (
                                <p className="mt-0.5 truncate text-[9px] text-[#7A8982]">
                                  {
                                    person.email
                                  }
                                </p>
                              )}
                          </td>

                          <td className="px-3 py-2 text-[#506159]">
                            {cleanText(
                              person.shift
                            ) ||
                              "—"}
                          </td>

                          <td className="px-3 py-2 text-[#506159]">
                            {cleanText(
                              person.license_number
                            ) ||
                              "—"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2 text-[#607169]">
                            {formatDate(
                              person.employment_date
                            )}
                          </td>

                          <td className="px-3 py-2">
                            {person.must_change_password ? (
                              <span className="inline-flex border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                                Password Change Required
                              </span>
                            ) : (
                              <span className="inline-flex border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                Credentials Current
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`
                                inline-flex border
                                px-1.5 py-0.5
                                text-[9px]
                                font-bold

                                ${
                                  active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }
                              `}
                            >
                              {active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="min-w-[340px] px-3 py-1.5">
                            <div
                              className="
                                flex flex-wrap
                                items-center
                                gap-1

                                [&_button]:!min-h-7
                                [&_button]:!rounded-[3px]
                                [&_button]:!px-2.5
                                [&_button]:!py-1
                                [&_button]:!text-[10px]
                                [&_button]:!font-bold
                                [&_button]:!shadow-none
                              "
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    person
                                  )
                                }
                                className="
                                  border
                                  border-blue-200
                                  bg-blue-50
                                  text-blue-700
                                  hover:bg-blue-100
                                "
                              >
                                Edit
                              </button>

                              <ResetPasswordButton
                                staffId={
                                  person.id
                                }
                                fullName={
                                  person.full_name
                                }
                                staffCode={
                                  person.staff_code
                                }
                              />

                              <DeactivateStaffButton
                                id={
                                  person.id
                                }
                                active={
                                  active
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-[12px] font-semibold text-[#30443B]">
                No staff accounts match the selected filters.
              </p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-2 text-[10px] font-bold text-[#073B2F] underline"
              >
                Reset filters
              </button>
            </div>
          )}


          <div className="border-t border-[#D1D9D5] bg-[#F8F7F2] px-3 py-2 text-[10px] text-[#607169]">
            Staff accounts are displayed alphabetically by staff member name.
          </div>
        </section>
      </main>


      <AddStaffModal
        open={addOpen}
        onClose={
          closeAddModal
        }
      />

      <EditStaffModal
        open={editOpen}
        onClose={
          closeEditModal
        }
        staff={
          selectedStaff
        }
      />
    </div>
  );
}


function SummaryCell({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8DFDB] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="text-[20px] font-bold text-[#073B2F]">
        {value}
      </span>

      <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#6D7D76]">
        {label}
      </span>
    </div>
  );
}


function ClinicalHead({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <th className="border-r border-[#D2DBD6] px-3 py-2 last:border-r-0">
      {children}
    </th>
  );
}
