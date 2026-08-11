"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

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

const PAGE_SIZE = 15;

const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function cleanText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeSearch(
  value: unknown
) {
  return cleanText(
    value
  ).toLowerCase();
}

function getResidentName(
  resident: ResidentRecord
) {
  return (
    cleanText(
      resident.full_name
    ) ||
    "Unnamed Resident"
  );
}

function compareResidents(
  first: ResidentRecord,
  second: ResidentRecord
) {
  return getResidentName(
    first
  ).localeCompare(
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
) {
  return getResidentName(
    resident
  )
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join("");
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
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    }
  ).format(date);
}

function formatAge(
  value:
    | number
    | null
    | undefined
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return String(value);
}

function requiresAttention(
  status:
    | string
    | null
    | undefined
) {
  const normalized =
    cleanText(
      status
    ).toLowerCase();

  return [
    "critical",
    "attention",
    "hospital",
    "hospitalized",
    "acute",
    "unstable",
  ].some((keyword) =>
    normalized.includes(keyword)
  );
}

function hasAllergy(
  value:
    | string
    | null
    | undefined
) {
  const allergy =
    cleanText(
      value
    ).toLowerCase();

  if (!allergy) {
    return false;
  }

  return ![
    "none",
    "nka",
    "nkda",
    "no known allergies",
    "no known allergy",
    "no known drug allergies",
  ].includes(allergy);
}

function statusStyle(
  status:
    | string
    | null
    | undefined
) {
  const normalized =
    cleanText(
      status
    ).toLowerCase();

  if (
    normalized.includes(
      "discharg"
    )
  ) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (
    normalized.includes(
      "hospital"
    ) ||
    normalized.includes(
      "critical"
    ) ||
    normalized.includes(
      "acute"
    )
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    normalized.includes(
      "leave"
    ) ||
    normalized.includes(
      "hold"
    )
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export default function ResidentsDirectory({
  residents,
}: Props) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    roomFilter,
    setRoomFilter,
  ] = useState("all");

  const [
    letterFilter,
    setLetterFilter,
  ] = useState("all");

  const [
    page,
    setPage,
  ] = useState(1);

  const sortedResidents =
    useMemo(
      () =>
        [...residents].sort(
          compareResidents
        ),
      [residents]
    );

  const statuses =
    useMemo(() => {
      return [
        ...new Set(
          sortedResidents
            .map((resident) =>
              cleanText(
                resident.status
              )
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          undefined,
          {
            sensitivity:
              "base",
          }
        )
      );
    }, [sortedResidents]);

  const rooms =
    useMemo(() => {
      return [
        ...new Set(
          sortedResidents
            .map((resident) =>
              cleanText(
                resident.room
              )
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          undefined,
          {
            numeric: true,
            sensitivity:
              "base",
          }
        )
      );
    }, [sortedResidents]);

  const filteredResidents =
    useMemo(() => {
      const query =
        normalizeSearch(
          search
        );

      return sortedResidents.filter(
        (resident) => {
          const name =
            getResidentName(
              resident
            );

          const matchesSearch =
            !query ||
            [
              resident.full_name,
              resident.room,
              resident.status,
              resident.diagnosis,
              resident.allergies,
              resident.primary_doctor,
              resident.next_of_kin,
              resident.next_of_kin_phone,
              resident.emergency_contact,
            ].some((value) =>
              normalizeSearch(
                value
              ).includes(query)
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            cleanText(
              resident.status
            ) === statusFilter;

          const matchesRoom =
            roomFilter === "all" ||
            cleanText(
              resident.room
            ) === roomFilter;

          const matchesLetter =
            letterFilter ===
              "all" ||
            name
              .charAt(0)
              .toUpperCase() ===
              letterFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesRoom &&
            matchesLetter
          );
        }
      );
    }, [
      letterFilter,
      roomFilter,
      search,
      sortedResidents,
      statusFilter,
    ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    roomFilter,
    letterFilter,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredResidents.length /
          PAGE_SIZE
      )
    );

  const currentPage =
    Math.min(
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

  const filtersActive =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    roomFilter !== "all" ||
    letterFilter !== "all";

  const firstRecord =
    filteredResidents.length
      ? pageStart + 1
      : 0;

  const lastRecord =
    Math.min(
      pageStart +
        PAGE_SIZE,
      filteredResidents.length
    );

  const roomsInUse =
    new Set(
      sortedResidents
        .map((resident) =>
          cleanText(
            resident.room
          )
        )
        .filter(Boolean)
    ).size;

  const attentionCount =
    sortedResidents.filter(
      (resident) =>
        requiresAttention(
          resident.status
        )
    ).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoomFilter("all");
    setLetterFilter("all");
    setPage(1);
  }

  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE HEADING */}

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
                Residents
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                Resident List
              </h1>

              <p className="text-xs text-[#718078]">
                Current resident clinical directory
              </p>
            </div>
          </div>

          <Link
            href="/add-resident"
            className="
              inline-flex h-9
              items-center justify-center
              gap-2 rounded-[5px]
              border border-[#063428]
              bg-[#073B2F]
              px-4 text-xs
              font-bold text-white
              transition
              hover:bg-[#0D4A3A]
            "
          >
            <Plus size={14} />

            Add Resident
          </Link>
        </div>
      </section>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">
        {/* SUMMARY STRIP */}

        <section
          className="
            mb-3 grid
            border border-[#CCD5D0]
            bg-white
            sm:grid-cols-3
          "
        >
          <SummaryCell
            label="Residents"
            value={
              sortedResidents.length
            }
          />

          <SummaryCell
            label="Rooms in use"
            value={roomsInUse}
          />

          <SummaryCell
            label="Need attention"
            value={
              attentionCount
            }
            warning={
              attentionCount > 0
            }
          />
        </section>


        {/* FILTER BAR */}

        <section className="border border-[#C9D3CE] bg-white">
          <div className="border-b border-[#D8DFDB] bg-[#F8F7F2] px-3 py-2">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={14}
                  className="
                    pointer-events-none
                    absolute left-2.5
                    top-1/2
                    -translate-y-1/2
                    text-[#6D7D76]
                  "
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
                  placeholder="Search resident, room, diagnosis, physician, contact..."
                  className="
                    h-8 w-full
                    rounded-[4px]
                    border border-[#BCC9C3]
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

              <div className="flex flex-wrap gap-2">
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
                    h-8
                    min-w-[145px]
                    rounded-[4px]
                    border border-[#BCC9C3]
                    bg-white
                    px-2 text-xs
                    text-[#31443D]
                    outline-none
                    focus:border-[#59766B]
                  "
                >
                  <option value="all">
                    All Statuses
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
                  onChange={(
                    event
                  ) =>
                    setRoomFilter(
                      event.target
                        .value
                    )
                  }
                  className="
                    h-8
                    min-w-[125px]
                    rounded-[4px]
                    border border-[#BCC9C3]
                    bg-white
                    px-2 text-xs
                    text-[#31443D]
                    outline-none
                    focus:border-[#59766B]
                  "
                >
                  <option value="all">
                    All Rooms
                  </option>

                  {rooms.map(
                    (room) => (
                      <option
                        key={room}
                        value={room}
                      >
                        Room {room}
                      </option>
                    )
                  )}
                </select>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="
                      inline-flex h-8
                      items-center gap-1.5
                      rounded-[4px]
                      border border-[#BCC9C3]
                      bg-white px-3
                      text-xs font-semibold
                      text-[#42564E]
                      hover:bg-[#F5F4EF]
                    "
                  >
                    <RotateCcw
                      size={12}
                    />

                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>


          {/* A-Z STRIP */}

          <div className="overflow-x-auto border-b border-[#D8DFDB] bg-white">
            <div className="flex min-w-max items-stretch px-2 py-1.5">
              <button
                type="button"
                onClick={() =>
                  setLetterFilter(
                    "all"
                  )
                }
                className={`
                  mr-1 h-7
                  min-w-[42px]
                  border px-2
                  text-[11px]
                  font-bold

                  ${
                    letterFilter ===
                    "all"
                      ? "border-[#073B2F] bg-[#073B2F] text-white"
                      : "border-[#CBD4CF] bg-white text-[#50645B] hover:bg-[#F3F2ED]"
                  }
                `}
              >
                ALL
              </button>

              {alphabet.map(
                (letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() =>
                      setLetterFilter(
                        letter
                      )
                    }
                    className={`
                      h-7 min-w-[29px]
                      border-y border-r
                      border-[#D2DAD6]
                      px-1.5
                      text-[11px]
                      font-bold

                      ${
                        letterFilter ===
                        letter
                          ? "bg-[#E9EEE9] text-[#073B2F] shadow-[inset_0_-2px_0_#D5A437]"
                          : "bg-white text-[#607169] hover:bg-[#F5F4EF]"
                      }
                    `}
                  >
                    {letter}
                  </button>
                )
              )}
            </div>
          </div>


          {/* RESULT STATUS */}

          <div className="flex items-center justify-between gap-3 border-b border-[#D8DFDB] bg-[#FBFAF7] px-3 py-1.5 text-[11px]">
            <p className="text-[#607169]">
              Showing{" "}
              <strong className="text-[#263A32]">
                {
                  filteredResidents.length
                }
              </strong>{" "}
              matching resident
              {filteredResidents.length ===
              1
                ? ""
                : "s"}
            </p>

            <p className="font-semibold text-[#7D6A35]">
              A–Z order
            </p>
          </div>


          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1380px] border-collapse text-left">
              <thead>
                <tr className="bg-[#E8EEEA] text-[10px] font-bold uppercase tracking-[0.035em] text-[#354A41]">
                  <TableHead>
                    Resident
                  </TableHead>

                  <TableHead>
                    ID
                  </TableHead>

                  <TableHead>
                    Sex
                  </TableHead>

                  <TableHead>
                    Age
                  </TableHead>

                  <TableHead>
                    Room
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Admit Date
                  </TableHead>

                  <TableHead>
                    Diagnosis
                  </TableHead>

                  <TableHead>
                    Physician
                  </TableHead>

                  <TableHead>
                    Allergies
                  </TableHead>

                  <TableHead>
                    Contact
                  </TableHead>

                  <TableHead>
                    Action
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {visibleResidents.length >
                0 ? (
                  visibleResidents.map(
                    (
                      resident,
                      index
                    ) => {
                      const allergy =
                        cleanText(
                          resident.allergies
                        );

                      return (
                        <tr
                          key={
                            resident.id
                          }
                          className={`
                            border-b
                            border-[#E2E7E4]
                            text-[12px]
                            transition-colors
                            hover:bg-[#FFFDF7]

                            ${
                              index %
                                2 ===
                              0
                                ? "bg-white"
                                : "bg-[#FAFAF7]"
                            }
                          `}
                        >
                          <td className="px-3 py-2">
                            <div className="flex min-w-[205px] items-center gap-2.5">
                              <ResidentAvatar
                                resident={
                                  resident
                                }
                              />

                              <Link
                                href={`/residents/${resident.id}`}
                                className="
                                  min-w-0
                                  font-bold
                                  text-[#073B2F]
                                  hover:underline
                                "
                              >
                                <span className="block max-w-[180px] truncate">
                                  {getResidentName(
                                    resident
                                  )}
                                </span>
                              </Link>
                            </div>
                          </td>

                          <td className="px-3 py-2 font-mono text-[11px] text-[#607169]">
                            {resident.id}
                          </td>

                          <td className="px-3 py-2 text-[#40534B]">
                            {cleanText(
                              resident.gender
                            ) || "—"}
                          </td>

                          <td className="px-3 py-2 text-[#40534B]">
                            {formatAge(
                              resident.age
                            )}
                          </td>

                          <td className="px-3 py-2 font-semibold text-[#263A32]">
                            {cleanText(
                              resident.room
                            ) || "—"}
                          </td>

                          <td className="px-3 py-2">
                            <StatusBadge
                              status={
                                cleanText(
                                  resident.status
                                ) ||
                                "Not recorded"
                              }
                            />
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-[#506159]">
                            {formatDate(
                              resident.date_admitted
                            )}
                          </td>

                          <td className="max-w-[230px] px-3 py-2">
                            <span className="block truncate text-[#40534B]">
                              {cleanText(
                                resident.diagnosis
                              ) || "—"}
                            </span>
                          </td>

                          <td className="max-w-[190px] px-3 py-2">
                            <span className="block truncate text-[#40534B]">
                              {cleanText(
                                resident.primary_doctor
                              ) || "—"}
                            </span>
                          </td>

                          <td className="max-w-[180px] px-3 py-2">
                            <span
                              className={`
                                block truncate
                                ${
                                  hasAllergy(
                                    allergy
                                  )
                                    ? "font-semibold text-red-700"
                                    : "text-[#607169]"
                                }
                              `}
                            >
                              {allergy ||
                                "NKA"}
                            </span>
                          </td>

                          <td className="max-w-[190px] px-3 py-2">
                            <div className="truncate font-medium text-[#40534B]">
                              {cleanText(
                                resident.next_of_kin
                              ) ||
                                "—"}
                            </div>

                            <div className="mt-0.5 truncate text-[10px] text-[#7B8983]">
                              {cleanText(
                                resident.next_of_kin_phone
                              ) ||
                                cleanText(
                                  resident.emergency_contact
                                ) ||
                                "No phone"}
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <Link
                              href={`/residents/${resident.id}`}
                              className="
                                inline-flex h-7
                                items-center
                                rounded-[4px]
                                border
                                border-[#93A69D]
                                bg-white px-2.5
                                text-[11px]
                                font-bold
                                text-[#073B2F]
                                hover:border-[#073B2F]
                                hover:bg-[#F0F4F1]
                              "
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-6 py-14 text-center"
                    >
                      <p className="text-sm font-semibold text-[#30443B]">
                        No residents match the selected filters.
                      </p>

                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="mt-2 text-xs font-bold text-[#073B2F] underline"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          {/* MOBILE */}

          <div className="divide-y divide-[#DCE3DF] lg:hidden">
            {visibleResidents.map(
              (resident) => (
                <article
                  key={resident.id}
                  className="bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <ResidentAvatar
                      resident={
                        resident
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/residents/${resident.id}`}
                            className="block truncate text-sm font-bold text-[#073B2F]"
                          >
                            {getResidentName(
                              resident
                            )}
                          </Link>

                          <p className="mt-0.5 text-[10px] text-[#76857E]">
                            Resident #
                            {resident.id}
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            cleanText(
                              resident.status
                            ) ||
                            "Not recorded"
                          }
                        />
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <MobileField
                          label="Room"
                          value={
                            cleanText(
                              resident.room
                            ) || "—"
                          }
                        />

                        <MobileField
                          label="Age"
                          value={formatAge(
                            resident.age
                          )}
                        />

                        <MobileField
                          label="Diagnosis"
                          value={
                            cleanText(
                              resident.diagnosis
                            ) || "—"
                          }
                        />

                        <MobileField
                          label="Physician"
                          value={
                            cleanText(
                              resident.primary_doctor
                            ) || "—"
                          }
                        />
                      </dl>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>


          {/* PAGINATION */}

          <div className="flex flex-col gap-2 border-t border-[#D1D9D5] bg-[#F8F7F2] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#607169]">
              Showing{" "}
              <strong>
                {firstRecord}
              </strong>{" "}
              -{" "}
              <strong>
                {lastRecord}
              </strong>{" "}
              of{" "}
              <strong>
                {
                  filteredResidents.length
                }
              </strong>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage(
                    Math.max(
                      1,
                      currentPage - 1
                    )
                  )
                }
                className="
                  inline-flex h-7 w-7
                  items-center justify-center
                  border border-[#BDC8C2]
                  bg-white text-[#4A5D54]
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  hover:bg-[#EEF2EF]
                "
              >
                <ChevronLeft
                  size={13}
                />
              </button>

              <span className="min-w-[92px] text-center text-[11px] font-semibold text-[#4A5D54]">
                Page {currentPage} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setPage(
                    Math.min(
                      totalPages,
                      currentPage + 1
                    )
                  )
                }
                className="
                  inline-flex h-7 w-7
                  items-center justify-center
                  border border-[#BDC8C2]
                  bg-white text-[#4A5D54]
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  hover:bg-[#EEF2EF]
                "
              >
                <ChevronRight
                  size={13}
                />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


function SummaryCell({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#D8DFDB] px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span
        className={`
          text-[20px]
          font-bold
          ${
            warning
              ? "text-red-700"
              : "text-[#073B2F]"
          }
        `}
      >
        {value}
      </span>

      <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6D7D76]">
        {label}
      </span>
    </div>
  );
}


function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="border-r border-[#D2DBD6] px-3 py-2 last:border-r-0">
      {children}
    </th>
  );
}


function ResidentAvatar({
  resident,
}: {
  resident: ResidentRecord;
}) {
  if (
    resident.photo_url
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={
          resident.photo_url
        }
        alt=""
        className="
          h-9 w-9
          shrink-0
          rounded-[4px]
          border border-[#C8D2CD]
          object-cover
        "
      />
    );
  }

  return (
    <div
      className="
        flex h-9 w-9
        shrink-0
        items-center justify-center
        rounded-[4px]
        border border-[#C5D0CA]
        bg-[#E6EEE8]
        text-[11px]
        font-bold
        text-[#073B2F]
      "
    >
      {getInitials(
        resident
      )}
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        whitespace-nowrap
        rounded-[3px]
        border
        px-1.5 py-0.5
        text-[10px]
        font-bold
        ${statusStyle(status)}
      `}
    >
      {status}
    </span>
  );
}


function MobileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] font-bold uppercase tracking-wide text-[#7A8982]">
        {label}
      </dt>

      <dd className="mt-0.5 truncate font-medium text-[#31443C]">
        {value}
      </dd>
    </div>
  );
}
