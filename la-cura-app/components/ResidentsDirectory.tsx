"use client";

import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  IconDefinition,
} from "@fortawesome/fontawesome-svg-core";

import {
  faArrowRight,
  faBed,
  faBuilding,
  faCalendarDays,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
  faNotesMedical,
  faPhone,
  faPlus,
  faRotateLeft,
  faShieldHeart,
  faStethoscope,
  faUser,
  faUserPlus,
  faUsers,
  faVenusMars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

export type ResidentRecord = {
  id: number;
  full_name?: string | null;
  age?: number | null;
  room?: string | null;
  status?: string | null;
  emergency_contact?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  date_admitted?: string | null;
  diagnosis?: string | null;
  allergies?: string | null;
  blood_group?: string | null;
  primary_doctor?: string | null;
  next_of_kin?: string | null;
  next_of_kin_phone?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  created_at?: string | null;
};

type Props = {
  residents: ResidentRecord[];
};

type StatusTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "gray";

const PAGE_SIZE = 10;

function cleanText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeSearch(
  value: unknown
): string {
  return cleanText(value).toLowerCase();
}

function getResidentName(
  resident: ResidentRecord
): string {
  return (
    cleanText(resident.full_name) ||
    "Unnamed Resident"
  );
}

function compareResidents(
  first: ResidentRecord,
  second: ResidentRecord
): number {
  return getResidentName(first).localeCompare(
    getResidentName(second),
    undefined,
    {
      sensitivity: "base",
      numeric: true,
    }
  );
}

function getInitials(
  resident: ResidentRecord
): string {
  const name = getResidentName(resident);

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function getAvatarClass(
  resident: ResidentRecord
): string {
  const options = [
    "bg-green-700",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-blue-600",
    "bg-violet-600",
    "bg-amber-600",
  ];

  const total = getResidentName(
    resident
  )
    .split("")
    .reduce(
      (sum, character) =>
        sum + character.charCodeAt(0),
      0
    );

  return options[
    total % options.length
  ];
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

function formatAge(
  age: number | null | undefined
): string {
  if (
    typeof age !== "number" ||
    !Number.isFinite(age) ||
    age < 0
  ) {
    return "—";
  }

  return String(age);
}

function isNewThisMonth(
  resident: ResidentRecord
): boolean {
  const sourceDate =
    resident.date_admitted ??
    resident.created_at;

  if (!sourceDate) {
    return false;
  }

  const date = new Date(sourceDate);
  const today = new Date();

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth()
  );
}

function requiresAttention(
  status: string | null | undefined
): boolean {
  const normalized =
    normalizeSearch(status);

  return [
    "critical",
    "observation",
    "unstable",
    "urgent",
    "high risk",
    "attention",
    "monitor",
  ].some((term) =>
    normalized.includes(term)
  );
}

function getStatusTone(
  status: string | null | undefined
): StatusTone {
  const normalized =
    normalizeSearch(status);

  if (
    normalized.includes("critical") ||
    normalized.includes("unstable") ||
    normalized.includes("urgent")
  ) {
    return "red";
  }

  if (
    normalized.includes("observation") ||
    normalized.includes("attention") ||
    normalized.includes("monitor")
  ) {
    return "amber";
  }

  if (
    normalized.includes("stable") ||
    normalized.includes("active")
  ) {
    return "green";
  }

  if (
    normalized.includes("admitted") ||
    normalized.includes("new")
  ) {
    return "blue";
  }

  return "gray";
}

function getStatusClasses(
  tone: StatusTone
): string {
  switch (tone) {
    case "green":
      return "border-green-200 bg-green-50 text-green-700";

    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "red":
      return "border-red-200 bg-red-50 text-red-700";

    case "blue":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default function ResidentsDirectory({
  residents,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [roomFilter, setRoomFilter] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [
    selectedResidentId,
    setSelectedResidentId,
  ] = useState<number | null>(
    residents[0]?.id ?? null
  );

  const sortedResidents = useMemo(
    () =>
      [...residents].sort(
        compareResidents
      ),
    [residents]
  );

  const statuses = useMemo(() => {
    return [
      ...new Set(
        sortedResidents
          .map((resident) =>
            cleanText(resident.status)
          )
          .filter(Boolean)
      ),
    ].sort((first, second) =>
      first.localeCompare(
        second,
        undefined,
        {
          sensitivity: "base",
        }
      )
    );
  }, [sortedResidents]);

  const rooms = useMemo(() => {
    return [
      ...new Set(
        sortedResidents
          .map((resident) =>
            cleanText(resident.room)
          )
          .filter(Boolean)
      ),
    ].sort((first, second) =>
      first.localeCompare(
        second,
        undefined,
        {
          sensitivity: "base",
          numeric: true,
        }
      )
    );
  }, [sortedResidents]);

  const filteredResidents =
    useMemo(() => {
      const query =
        normalizeSearch(search);

      return sortedResidents.filter(
        (resident) => {
          const matchesSearch =
            !query ||
            [
              resident.full_name,
              resident.room,
              resident.status,
              resident.emergency_contact,
              resident.next_of_kin,
              resident.next_of_kin_phone,
              resident.primary_doctor,
              resident.diagnosis,
            ].some((value) =>
              normalizeSearch(
                value
              ).includes(query)
            );

          const matchesStatus =
            statusFilter === "all" ||
            cleanText(
              resident.status
            ) === statusFilter;

          const matchesRoom =
            roomFilter === "all" ||
            cleanText(
              resident.room
            ) === roomFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesRoom
          );
        }
      );
    }, [
      roomFilter,
      search,
      sortedResidents,
      statusFilter,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredResidents.length /
        PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const pageStart =
    (currentPage - 1) *
    PAGE_SIZE;

  const visibleResidents =
    filteredResidents.slice(
      pageStart,
      pageStart + PAGE_SIZE
    );

  const selectedResident =
    sortedResidents.find(
      (resident) =>
        resident.id ===
        selectedResidentId
    ) ?? null;

  const statistics = useMemo(() => {
    const occupiedRooms = new Set(
      sortedResidents
        .map((resident) =>
          cleanText(resident.room)
        )
        .filter(Boolean)
    );

    return {
      total:
        sortedResidents.length,

      newThisMonth:
        sortedResidents.filter(
          isNewThisMonth
        ).length,

      attention:
        sortedResidents.filter(
          (resident) =>
            requiresAttention(
              resident.status
            )
        ).length,

      rooms:
        occupiedRooms.size,
    };
  }, [sortedResidents]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    roomFilter,
  ]);

  useEffect(() => {
    const selectedStillVisible =
      filteredResidents.some(
        (resident) =>
          resident.id ===
          selectedResidentId
      );

    if (selectedStillVisible) {
      return;
    }

    setSelectedResidentId(
      filteredResidents[0]?.id ?? null
    );
  }, [
    filteredResidents,
    selectedResidentId,
  ]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoomFilter("all");
    setPage(1);
  }

  const filtersActive =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    roomFilter !== "all";

  const firstRecord =
    filteredResidents.length === 0
      ? 0
      : pageStart + 1;

  const lastRecord = Math.min(
    pageStart + PAGE_SIZE,
    filteredResidents.length
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
        <div className="absolute inset-0">
          <div className="absolute -right-32 -top-48 h-[520px] w-[520px] rounded-full border border-white/10" />

          <div className="absolute -right-4 top-4 h-72 w-72 rounded-full bg-green-300/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/2 h-80 w-80 rounded-full bg-white/5" />

          <div className="absolute bottom-0 left-1/3 h-px w-96 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-6 pb-16 pt-10 lg:px-8 lg:pb-20">
          <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-green-100">
                <span className="h-px w-8 bg-green-200" />

                Resident Management
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Residents
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-green-50/85">
                A complete view of resident
                profiles, admissions, rooms,
                contacts, and care status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-200 opacity-50" />

                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-200" />
                </span>

                <div>
                  <p className="text-xs text-green-100/70">
                    System status
                  </p>

                  <p className="text-sm font-medium text-white">
                    Online
                  </p>
                </div>
              </div>

              <Link
                href="/add-resident"
                className="inline-flex h-[58px] items-center justify-center gap-3 rounded-xl bg-white px-6 text-sm font-semibold text-green-700 shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-green-50"
              >
                <AppIcon icon={faPlus} />

                Add Resident
              </Link>
            </div>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-2 xl:grid-cols-4">
            <HeroMetric
              icon={faUsers}
              label="Total residents"
              value={statistics.total}
              detail="Registered profiles"
            />

            <HeroMetric
              icon={faUserPlus}
              label="New this month"
              value={
                statistics.newThisMonth
              }
              detail="Recent admissions"
            />

            <HeroMetric
              icon={faShieldHeart}
              label="Need attention"
              value={
                statistics.attention
              }
              detail="Clinical monitoring"
              warning={
                statistics.attention > 0
              }
            />

            <HeroMetric
              icon={faBed}
              label="Rooms in use"
              value={statistics.rooms}
              detail="Current assignments"
            />
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-9 max-w-[1500px] px-6 pb-12 lg:px-8">
        <section className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(22,101,52,0.10)]">
            <div className="border-b border-slate-200 bg-white px-5 py-5 lg:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <AppIcon
                    icon={
                      faMagnifyingGlass
                    }
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search residents by name, room, contact, diagnosis, or physician"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    aria-label="Filter residents by status"
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="all">
                      All statuses
                    </option>

                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={roomFilter}
                    onChange={(event) =>
                      setRoomFilter(
                        event.target.value
                      )
                    }
                    aria-label="Filter residents by room"
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="all">
                      All rooms
                    </option>

                    {rooms.map((room) => (
                      <option
                        key={room}
                        value={room}
                      >
                        Room {room}
                      </option>
                    ))}
                  </select>

                  {filtersActive && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <AppIcon
                        icon={faRotateLeft}
                      />

                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {
                      filteredResidents.length
                    }
                  </span>{" "}
                  resident
                  {filteredResidents.length === 1
                    ? ""
                    : "s"}{" "}
                  found
                </p>

                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  A–Z alphabetical order
                </div>
              </div>
            </div>

            {filteredResidents.length ===
            0 ? (
              <EmptyState
                filtered={filtersActive}
                onClear={clearFilters}
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[940px] border-collapse">
                    <thead>
                      <tr className="border-b border-green-100 bg-green-50/70">
                        <TableHeading>
                          Resident
                        </TableHeading>

                        <TableHeading>
                          Age
                        </TableHeading>

                        <TableHeading>
                          Room
                        </TableHeading>

                        <TableHeading>
                          Status
                        </TableHeading>

                        <TableHeading>
                          Care summary
                        </TableHeading>

                        <TableHeading>
                          Contact
                        </TableHeading>

                        <TableHeading>
                          Action
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleResidents.map(
                        (resident) => {
                          const status =
                            cleanText(
                              resident.status
                            ) ||
                            "Not recorded";

                          const selected =
                            selectedResidentId ===
                            resident.id;

                          return (
                            <tr
                              key={resident.id}
                              onClick={() =>
                                setSelectedResidentId(
                                  resident.id
                                )
                              }
                              className={`group cursor-pointer border-b border-slate-100 text-sm transition last:border-b-0 ${
                                selected
                                  ? "bg-green-50/70"
                                  : "bg-white hover:bg-slate-50"
                              }`}
                            >
                              <td className="relative px-5 py-4">
                                {selected && (
                                  <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-green-600" />
                                )}

                                <div className="flex min-w-0 items-center gap-3.5">
                                  <ResidentAvatar
                                    resident={
                                      resident
                                    }
                                  />

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-900">
                                      {getResidentName(
                                        resident
                                      )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Resident #
                                      {
                                        resident.id
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {formatAge(
                                  resident.age
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                                  <AppIcon
                                    icon={
                                      faBuilding
                                    }
                                    className="text-xs text-slate-400"
                                  />

                                  {cleanText(
                                    resident.room
                                  ) ||
                                    "Unassigned"}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                <StatusBadge
                                  status={
                                    status
                                  }
                                  tone={getStatusTone(
                                    resident.status
                                  )}
                                />
                              </td>

                              <td className="max-w-[210px] px-4 py-4">
                                <p className="truncate font-medium text-slate-700">
                                  {cleanText(
                                    resident.diagnosis
                                  ) ||
                                    "No diagnosis recorded"}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {cleanText(
                                    resident.primary_doctor
                                  ) ||
                                    "Doctor not assigned"}
                                </p>
                              </td>

                              <td className="max-w-[190px] px-4 py-4">
                                <p className="truncate font-medium text-slate-700">
                                  {cleanText(
                                    resident.next_of_kin
                                  ) ||
                                    "Primary contact"}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {cleanText(
                                    resident.next_of_kin_phone
                                  ) ||
                                    cleanText(
                                      resident.emergency_contact
                                    ) ||
                                    "Not recorded"}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <Link
                                  href={`/residents/${resident.id}`}
                                  onClick={(
                                    event
                                  ) =>
                                    event.stopPropagation()
                                  }
                                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                                >
                                  View

                                  <AppIcon
                                    icon={
                                      faArrowRight
                                    }
                                    className="text-xs"
                                  />
                                </Link>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 lg:hidden">
                  {visibleResidents.map(
                    (resident) => (
                      <article
                        key={resident.id}
                        className="p-5"
                      >
                        <div className="flex items-start gap-3.5">
                          <ResidentAvatar
                            resident={
                              resident
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h2 className="font-semibold text-slate-900">
                                  {getResidentName(
                                    resident
                                  )}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                  Resident #
                                  {
                                    resident.id
                                  }
                                </p>
                              </div>

                              <StatusBadge
                                status={
                                  cleanText(
                                    resident.status
                                  ) ||
                                  "Not recorded"
                                }
                                tone={getStatusTone(
                                  resident.status
                                )}
                              />
                            </div>

                            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                              <MobileDetail
                                label="Age"
                                value={formatAge(
                                  resident.age
                                )}
                              />

                              <MobileDetail
                                label="Room"
                                value={
                                  cleanText(
                                    resident.room
                                  ) ||
                                  "Unassigned"
                                }
                              />

                              <div className="col-span-2">
                                <MobileDetail
                                  label="Diagnosis"
                                  value={
                                    cleanText(
                                      resident.diagnosis
                                    ) ||
                                    "Not recorded"
                                  }
                                />
                              </div>
                            </dl>

                            <Link
                              href={`/residents/${resident.id}`}
                              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                              View profile

                              <AppIcon
                                icon={
                                  faArrowRight
                                }
                                className="text-xs"
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {firstRecord}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-700">
                      {lastRecord}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        filteredResidents.length
                      }
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage(
                          Math.max(
                            1,
                            currentPage - 1
                          )
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                      aria-label="Previous page"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-green-300 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <AppIcon
                        icon={faChevronLeft}
                      />
                    </button>

                    <span className="min-w-24 text-center text-sm font-medium text-slate-600">
                      Page {currentPage} of{" "}
                      {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPage(
                          Math.min(
                            totalPages,
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      aria-label="Next page"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-green-300 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <AppIcon
                        icon={
                          faChevronRight
                        }
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <ResidentPreview
            resident={selectedResident}
            onClose={() =>
              setSelectedResidentId(null)
            }
          />
        </section>
      </main>
    </div>
  );
}

type HeroMetricProps = {
  icon: IconDefinition;
  label: string;
  value: number;
  detail: string;
  warning?: boolean;
};

function HeroMetric({
  icon,
  label,
  value,
  detail,
  warning = false,
}: HeroMetricProps) {
  return (
    <article className="border-b border-white/15 px-5 py-5 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.13em] text-green-100/75">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-green-100/65">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            warning
              ? "bg-red-400/20 text-red-100"
              : "bg-white/15 text-white"
          }`}
        >
          <AppIcon icon={icon} />
        </div>
      </div>
    </article>
  );
}

type TableHeadingProps = {
  children: ReactNode;
};

function TableHeading({
  children,
}: TableHeadingProps) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-green-800 first:px-5 last:px-5">
      {children}
    </th>
  );
}

type ResidentAvatarProps = {
  resident: ResidentRecord;
};

function ResidentAvatar({
  resident,
}: ResidentAvatarProps) {
  if (resident.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resident.photo_url}
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm"
      />
    );
  }

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tracking-wide text-white shadow-sm ${getAvatarClass(
        resident
      )}`}
    >
      {getInitials(resident)}
    </div>
  );
}

type StatusBadgeProps = {
  status: string;
  tone: StatusTone;
};

function StatusBadge({
  status,
  tone,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
        tone
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />

      {status}
    </span>
  );
}

type MobileDetailProps = {
  label: string;
  value: string;
};

function MobileDetail({
  label,
  value,
}: MobileDetailProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </dd>
    </div>
  );
}

type EmptyStateProps = {
  filtered: boolean;
  onClear: () => void;
};

function EmptyState({
  filtered,
  onClear,
}: EmptyStateProps) {
  return (
    <div className="px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
        <AppIcon
          icon={
            filtered
              ? faMagnifyingGlass
              : faUsers
          }
          className="text-xl"
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-slate-900">
        {filtered
          ? "No matching residents"
          : "No residents yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {filtered
          ? "No resident records match the current search and filters."
          : "Add the first resident to begin building the resident directory."}
      </p>

      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700"
        >
          <AppIcon
            icon={faRotateLeft}
          />

          Clear filters
        </button>
      ) : (
        <Link
          href="/add-resident"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <AppIcon icon={faPlus} />

          Add resident
        </Link>
      )}
    </div>
  );
}

type ResidentPreviewProps = {
  resident: ResidentRecord | null;
  onClose: () => void;
};

function ResidentPreview({
  resident,
  onClose,
}: ResidentPreviewProps) {
  if (!resident) {
    return null;
  }

  return (
    <aside className="hidden self-start overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(22,101,52,0.10)] 2xl:block">
      <div className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-green-600 px-6 pb-6 pt-7 text-white">
        <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border border-white/15" />

        <div className="absolute -right-4 top-0 h-28 w-28 rounded-full bg-green-300/20 blur-2xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close resident preview"
          className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-green-50 transition hover:bg-white/25"
        >
          <AppIcon icon={faXmark} />
        </button>

        <ResidentAvatar
          resident={resident}
        />

        <h2 className="mt-4 pr-10 text-xl font-semibold tracking-tight">
          {getResidentName(resident)}
        </h2>

        <p className="mt-1 text-xs text-green-100/75">
          Resident #{resident.id}
        </p>

        <div className="mt-4">
          <StatusBadge
            status={
              cleanText(
                resident.status
              ) || "Not recorded"
            }
            tone={getStatusTone(
              resident.status
            )}
          />
        </div>
      </div>

      <div className="p-6">
        <PreviewSection title="Resident details">
          <PreviewDetail
            icon={faBuilding}
            label="Room"
            value={
              cleanText(
                resident.room
              ) || "Unassigned"
            }
          />

          <PreviewDetail
            icon={faCalendarDays}
            label="Age / Date of birth"
            value={`${formatAge(
              resident.age
            )} years / ${formatDate(
              resident.date_of_birth
            )}`}
          />

          <PreviewDetail
            icon={faVenusMars}
            label="Gender"
            value={
              cleanText(
                resident.gender
              ) || "Not recorded"
            }
          />
        </PreviewSection>

        <PreviewSection title="Care information">
          <PreviewDetail
            icon={faNotesMedical}
            label="Diagnosis"
            value={
              cleanText(
                resident.diagnosis
              ) || "Not recorded"
            }
          />

          <PreviewDetail
            icon={faStethoscope}
            label="Primary doctor"
            value={
              cleanText(
                resident.primary_doctor
              ) || "Not recorded"
            }
          />

          <PreviewDetail
            icon={faCalendarDays}
            label="Admission date"
            value={formatDate(
              resident.date_admitted
            )}
          />
        </PreviewSection>

        <PreviewSection title="Contact">
          <PreviewDetail
            icon={faUser}
            label="Next of kin"
            value={
              cleanText(
                resident.next_of_kin
              ) || "Not recorded"
            }
          />

          <PreviewDetail
            icon={faPhone}
            label="Phone"
            value={
              cleanText(
                resident.next_of_kin_phone
              ) ||
              cleanText(
                resident.emergency_contact
              ) ||
              "Not recorded"
            }
          />
        </PreviewSection>

        <Link
          href={`/residents/${resident.id}`}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-700 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          View full profile

          <AppIcon
            icon={faArrowRight}
            className="text-xs"
          />
        </Link>
      </div>
    </aside>
  );
}

type PreviewSectionProps = {
  title: string;
  children: ReactNode;
};

function PreviewSection({
  title,
  children,
}: PreviewSectionProps) {
  return (
    <section className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </h3>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

type PreviewDetailProps = {
  icon: IconDefinition;
  label: string;
  value: string;
};

function PreviewDetail({
  icon,
  label,
  value,
}: PreviewDetailProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
        <AppIcon icon={icon} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}