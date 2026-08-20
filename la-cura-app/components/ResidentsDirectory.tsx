"use client";

import Link from "next/link";

import {
  type ReactNode,
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

import useAppUi from "@/components/i18n/useAppUi";


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


function compareRooms(
  first: ResidentRecord,
  second: ResidentRecord
) {
  const roomComparison =
    cleanText(first.room).localeCompare(
      cleanText(second.room),
      undefined,
      {
        sensitivity: "base",
        numeric: true,
      }
    );

  if (roomComparison !== 0) {
    return roomComparison;
  }

  return compareResidents(
    first,
    second
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
    | undefined,
  locale: string
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
    locale,
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
    typeof value !== "number" ||
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
    normalizeSearch(status);

  return [
    "critical",
    "attention",
    "hospital",
    "hospitalized",
    "acute",
    "unstable",
    "urgent",
    "observation",
    "monitor",
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
    normalizeSearch(value);

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
    normalizeSearch(status);

  if (
    normalized.includes(
      "discharg"
    )
  ) {
    return `
      border-slate-300
      bg-slate-100
      text-slate-700
    `;
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
    ) ||
    normalized.includes(
      "unstable"
    ) ||
    normalized.includes(
      "urgent"
    )
  ) {
    return `
      border-red-200
      bg-red-50
      text-red-700
    `;
  }

  if (
    normalized.includes(
      "leave"
    ) ||
    normalized.includes(
      "hold"
    ) ||
    normalized.includes(
      "observation"
    ) ||
    normalized.includes(
      "monitor"
    ) ||
    normalized.includes(
      "attention"
    )
  ) {
    return `
      border-amber-200
      bg-amber-50
      text-amber-800
    `;
  }

  return `
    border-emerald-200
    bg-emerald-50
    text-emerald-800
  `;
}


export default function ResidentsDirectory({
  residents,
}: Props) {
  const {
    ui,
    locale,
  } = useAppUi();

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
          compareRooms
        ),
      [residents]
    );


  const statuses =
    useMemo(() => {
      return [
        ...new Set(
          residents
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
    }, [residents]);


  const rooms =
    useMemo(() => {
      return [
        ...new Set(
          residents
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
    }, [residents]);


  const availableLetters =
    useMemo(() => {
      return new Set(
        residents
          .map((resident) =>
            getResidentName(
              resident
            )
              .charAt(0)
              .toUpperCase()
          )
          .filter(Boolean)
      );
    }, [residents]);


  const filteredResidents =
    useMemo(() => {
      const query =
        normalizeSearch(search);

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
              resident.gender,
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
            roomFilter ===
              "all" ||
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
    useMemo(
      () =>
        new Set(
          residents
            .map((resident) =>
              cleanText(
                resident.room
              )
            )
            .filter(Boolean)
        ).size,
      [residents]
    );


  const attentionCount =
    useMemo(
      () =>
        residents.filter(
          (resident) =>
            requiresAttention(
              resident.status
            )
        ).length,
      [residents]
    );


  const activeCount =
    useMemo(
      () =>
        residents.filter(
          (resident) => {
            const status =
              normalizeSearch(
                resident.status
              );

            return (
              status.includes(
                "active"
              ) ||
              status.includes(
                "admitted"
              ) ||
              status.includes(
                "stable"
              )
            );
          }
        ).length,
      [residents]
    );


  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoomFilter("all");
    setLetterFilter("all");
    setPage(1);
  }


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">

      {/* PAGE HEADER */}

      <header className="border-b border-[#BFC9C4] bg-white">
        <div
          className="
            mx-auto
            flex
            max-w-[1800px]
            flex-col
            gap-3
            px-4
            py-3
            sm:px-5
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-6
          "
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="font-medium hover:text-[#073B2F] hover:underline"
              >
                {ui("Home")}
              </Link>

              <span>/</span>

              <span className="font-semibold text-[#40524B]">
                {ui("Residents")}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#10231E]">
                {ui("Resident Census")}
              </h1>

              <p className="text-[11px] text-[#718078]">
                {ui(
                  "Current resident clinical directory"
                )}
              </p>
            </div>
          </div>

          <Link
            href="/add-resident"
            className="
              inline-flex
              h-8
              items-center
              justify-center
              gap-1.5
              rounded-[3px]
              border
              border-[#063428]
              bg-[#073B2F]
              px-3
              text-[11px]
              font-bold
              text-white
              hover:bg-[#0D4A3A]
            "
          >
            <Plus size={13} />

            {ui("Add Resident")}
          </Link>
        </div>
      </header>


      <main className="mx-auto max-w-[1800px] p-3 sm:p-4 lg:px-6">

        {/* CENSUS SUMMARY */}

        <section
          className="
            mb-3
            grid
            border
            border-[#C3CDC8]
            bg-white
            sm:grid-cols-4
          "
        >
          <SummaryCell
            label={ui("Residents")}
            value={
              residents.length
            }
          />

          <SummaryCell
            label={ui("Active")}
            value={
              activeCount
            }
          />

          <SummaryCell
            label={ui("Rooms in use")}
            value={roomsInUse}
          />

          <SummaryCell
            label={ui("Need attention")}
            value={
              attentionCount
            }
            warning={
              attentionCount > 0
            }
          />
        </section>


        {/* DIRECTORY */}

        <section className="overflow-hidden border border-[#BFCAC4] bg-white">

          {/* TOOLBAR */}

          <div className="border-b border-[#D4DDD8] bg-[#ECEFEB] px-3 py-2">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">

              <div className="relative min-w-0 flex-1">
                <Search
                  size={13}
                  className="
                    pointer-events-none
                    absolute
                    left-2.5
                    top-1/2
                    -translate-y-1/2
                    text-[#677870]
                  "
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                    setPage(1);
                  }}
                  placeholder={ui(
                    "Search resident, room, diagnosis, physician, contact..."
                  )}
                  className="
                    h-8
                    w-full
                    rounded-[2px]
                    border
                    border-[#AEBAB4]
                    bg-white
                    pl-8
                    pr-3
                    text-[11px]
                    text-[#1D2F28]
                    outline-none
                    placeholder:text-[#8B9892]
                    focus:border-[#537568]
                  "
                />
              </div>


              <div className="flex flex-wrap gap-1.5">

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                  className="
                    h-8
                    min-w-[140px]
                    rounded-[2px]
                    border
                    border-[#AEBAB4]
                    bg-white
                    px-2
                    text-[11px]
                    text-[#31443D]
                    outline-none
                  "
                >
                  <option value="all">
                    {ui("All Statuses")}
                  </option>

                  {statuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {ui(status)}
                      </option>
                    )
                  )}
                </select>


                <select
                  value={
                    roomFilter
                  }
                  onChange={(event) => {
                    setRoomFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                  className="
                    h-8
                    min-w-[120px]
                    rounded-[2px]
                    border
                    border-[#AEBAB4]
                    bg-white
                    px-2
                    text-[11px]
                    text-[#31443D]
                    outline-none
                  "
                >
                  <option value="all">
                    {ui("All Rooms")}
                  </option>

                  {rooms.map(
                    (room) => (
                      <option
                        key={room}
                        value={room}
                      >
                        {ui("Room")}{" "}
                        {room}
                      </option>
                    )
                  )}
                </select>


                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  disabled={
                    !filtersActive
                  }
                  className="
                    inline-flex
                    h-8
                    items-center
                    gap-1.5
                    rounded-[2px]
                    border
                    border-[#AEBAB4]
                    bg-white
                    px-3
                    text-[11px]
                    font-semibold
                    text-[#42564E]
                    hover:bg-[#F5F4EF]
                    disabled:cursor-default
                    disabled:opacity-40
                  "
                >
                  <RotateCcw
                    size={12}
                  />

                  {ui("Reset")}
                </button>

              </div>
            </div>
          </div>


          {/* ALPHABET INDEX */}

          <div className="overflow-x-auto border-b border-[#D6DEDA] bg-white">
            <div className="flex min-w-max items-stretch px-2 py-1.5">

              <button
                type="button"
                onClick={() => {
                  setLetterFilter(
                    "all"
                  );
                  setPage(1);
                }}
                className={`
                  mr-1
                  h-7
                  min-w-[42px]
                  border
                  px-2
                  text-[10px]
                  font-bold

                  ${
                    letterFilter ===
                    "all"
                      ? "border-[#073B2F] bg-[#073B2F] text-white"
                      : "border-[#CBD4CF] bg-white text-[#50645B] hover:bg-[#F3F2ED]"
                  }
                `}
              >
                {ui("ALL")}
              </button>


              {alphabet.map(
                (letter) => {
                  const available =
                    availableLetters.has(
                      letter
                    );

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={
                        !available
                      }
                      onClick={() => {
                        setLetterFilter(
                          letter
                        );
                        setPage(1);
                      }}
                      className={`
                        h-7
                        min-w-[29px]
                        border-y
                        border-r
                        border-[#D2DAD6]
                        px-1.5
                        text-[10px]
                        font-bold

                        ${
                          letterFilter ===
                          letter
                            ? "bg-[#E5EBE6] text-[#073B2F] shadow-[inset_0_-2px_0_#B58B2F]"
                            : "bg-white text-[#607169] hover:bg-[#F5F4EF]"
                        }

                        ${
                          !available
                            ? "cursor-default opacity-30 hover:bg-white"
                            : ""
                        }
                      `}
                    >
                      {letter}
                    </button>
                  );
                }
              )}

            </div>
          </div>


          {/* RESULT BAR */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
              border-b
              border-[#D8DFDB]
              bg-[#F8F7F3]
              px-3
              py-1.5
              text-[10px]
            "
          >
            <p className="text-[#607169]">
              {ui("Showing")}{" "}
              <strong className="text-[#263A32]">
                {
                  filteredResidents.length
                }
              </strong>{" "}
              {ui("matching residents")}
            </p>

            <p className="font-semibold text-[#6B5A2D]">
              {roomFilter ===
              "all"
                ? ui(
                    "Census ordered by room"
                  )
                : `${ui(
                    "Room"
                  )} ${roomFilter}`}
            </p>
          </div>


          {/* DESKTOP CENSUS TABLE */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1450px] border-collapse text-left">

              <thead>
                <tr className="bg-[#E4E9E5] text-[9px] font-bold uppercase tracking-[0.025em] text-[#354A41]">

                  <TableHead
                    widthClass="w-[85px]"
                  >
                    {ui("Room")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[245px]"
                  >
                    {ui("Resident")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[115px]"
                  >
                    {ui("Sex / Age")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[130px]"
                  >
                    {ui("Status")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[110px]"
                  >
                    {ui("Admit Date")}
                  </TableHead>

                  <TableHead>
                    {ui(
                      "Primary Diagnosis"
                    )}
                  </TableHead>

                  <TableHead
                    widthClass="w-[190px]"
                  >
                    {ui("Physician")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[180px]"
                  >
                    {ui("Allergies")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[205px]"
                  >
                    {ui("Contact")}
                  </TableHead>

                  <TableHead
                    widthClass="w-[75px]"
                  >
                    {ui("Action")}
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

                      const contactName =
                        cleanText(
                          resident.next_of_kin
                        );

                      const contactPhone =
                        cleanText(
                          resident.next_of_kin_phone
                        ) ||
                        cleanText(
                          resident.emergency_contact
                        );

                      return (
                        <tr
                          key={
                            resident.id
                          }
                          className={`
                            border-b
                            border-[#DEE4E0]
                            text-[11px]
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

                          {/* ROOM */}

                          <td className="px-3 py-2 align-middle">
                            <span
                              className="
                                font-mono
                                text-[12px]
                                font-bold
                                tabular-nums
                                text-[#263A32]
                              "
                            >
                              {cleanText(
                                resident.room
                              ) || "—"}
                            </span>
                          </td>


                          {/* RESIDENT */}

                          <td className="px-3 py-1.5">
                            <div className="flex min-w-[210px] items-center gap-2">

                              <ResidentAvatar
                                resident={
                                  resident
                                }
                              />

                              <div className="min-w-0">
                                <Link
                                  href={`/residents/${resident.id}`}
                                  className="
                                    block
                                    max-w-[190px]
                                    truncate
                                    font-bold
                                    text-[#073B2F]
                                    hover:underline
                                  "
                                >
                                  {getResidentName(
                                    resident
                                  )}
                                </Link>

                                <p className="mt-0.5 font-mono text-[9px] text-[#7B8983]">
                                  #{resident.id}
                                </p>
                              </div>

                            </div>
                          </td>


                          {/* SEX AGE */}

                          <td className="px-3 py-2 text-[#40534B]">
                            {cleanText(
                              resident.gender
                            ) || "—"}

                            <span className="mx-1 text-[#A0AAA5]">
                              /
                            </span>

                            {formatAge(
                              resident.age
                            )}
                          </td>


                          {/* STATUS */}

                          <td className="px-3 py-2">
                            <StatusBadge
                              status={
                                cleanText(
                                  resident.status
                                ) ||
                                "Not recorded"
                              }
                              label={ui(
                                cleanText(
                                  resident.status
                                ) ||
                                  "Not recorded"
                              )}
                            />
                          </td>


                          {/* ADMIT */}

                          <td className="whitespace-nowrap px-3 py-2 font-mono text-[10px] text-[#506159]">
                            {formatDate(
                              resident.date_admitted,
                              locale
                            )}
                          </td>


                          {/* DIAGNOSIS */}

                          <td className="max-w-[290px] px-3 py-2">
                            <span className="block truncate text-[#33483F]">
                              {cleanText(
                                resident.diagnosis
                              ) || "—"}
                            </span>
                          </td>


                          {/* PHYSICIAN */}

                          <td className="max-w-[190px] px-3 py-2">
                            <span className="block truncate text-[#40534B]">
                              {cleanText(
                                resident.primary_doctor
                              ) ||
                                ui(
                                  "Not assigned"
                                )}
                            </span>
                          </td>


                          {/* ALLERGIES */}

                          <td className="max-w-[180px] px-3 py-2">
                            <span
                              className={`
                                block
                                truncate

                                ${
                                  hasAllergy(
                                    allergy
                                  )
                                    ? "font-bold text-red-700"
                                    : "text-[#607169]"
                                }
                              `}
                            >
                              {allergy ||
                                ui("NKA")}
                            </span>
                          </td>


                          {/* CONTACT */}

                          <td className="max-w-[205px] px-3 py-2">
                            <div className="truncate font-medium text-[#40534B]">
                              {contactName ||
                                "—"}
                            </div>

                            <div className="mt-0.5 truncate font-mono text-[9px] text-[#7B8983]">
                              {contactPhone ||
                                ui(
                                  "No phone"
                                )}
                            </div>
                          </td>


                          {/* ACTION */}

                          <td className="px-3 py-2">
                            <Link
                              href={`/residents/${resident.id}`}
                              className="
                                inline-flex
                                h-7
                                items-center
                                border
                                border-[#8FA198]
                                bg-white
                                px-2.5
                                text-[10px]
                                font-bold
                                text-[#073B2F]
                                hover:border-[#073B2F]
                                hover:bg-[#EEF3F0]
                              "
                            >
                              {ui("Open")}
                            </Link>
                          </td>

                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-14 text-center"
                    >
                      <p className="text-[12px] font-semibold text-[#30443B]">
                        {ui(
                          "No residents match the selected filters."
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="mt-2 text-[11px] font-bold text-[#073B2F] underline"
                      >
                        {ui(
                          "Reset filters"
                        )}
                      </button>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>


          {/* MOBILE CENSUS */}

          <div className="divide-y divide-[#DCE3DF] lg:hidden">

            {visibleResidents.length >
            0 ? (
              visibleResidents.map(
                (resident) => (
                  <article
                    key={
                      resident.id
                    }
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
                              className="block truncate text-[13px] font-bold text-[#073B2F]"
                            >
                              {getResidentName(
                                resident
                              )}
                            </Link>

                            <p className="mt-0.5 text-[10px] text-[#76857E]">
                              {ui("Room")}{" "}
                              {cleanText(
                                resident.room
                              ) ||
                                "—"}{" "}
                              • #{resident.id}
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              cleanText(
                                resident.status
                              ) ||
                              "Not recorded"
                            }
                            label={ui(
                              cleanText(
                                resident.status
                              ) ||
                                "Not recorded"
                            )}
                          />

                        </div>


                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">

                          <MobileField
                            label={ui(
                              "Sex / Age"
                            )}
                            value={`${cleanText(
                              resident.gender
                            ) || "—"} / ${formatAge(
                              resident.age
                            )}`}
                          />

                          <MobileField
                            label={ui(
                              "Admit Date"
                            )}
                            value={formatDate(
                              resident.date_admitted,
                              locale
                            )}
                          />

                          <MobileField
                            label={ui(
                              "Diagnosis"
                            )}
                            value={
                              cleanText(
                                resident.diagnosis
                              ) || "—"
                            }
                          />

                          <MobileField
                            label={ui(
                              "Physician"
                            )}
                            value={
                              cleanText(
                                resident.primary_doctor
                              ) ||
                              ui(
                                "Not assigned"
                              )
                            }
                          />

                        </dl>


                        <div className="mt-3 flex justify-end">
                          <Link
                            href={`/residents/${resident.id}`}
                            className="border border-[#8FA198] bg-white px-3 py-1 text-[10px] font-bold text-[#073B2F]"
                          >
                            {ui(
                              "Open Record"
                            )}
                          </Link>
                        </div>

                      </div>
                    </div>
                  </article>
                )
              )
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-[12px] font-semibold text-[#30443B]">
                  {ui(
                    "No residents match the selected filters."
                  )}
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-2 text-[11px] font-bold text-[#073B2F] underline"
                >
                  {ui(
                    "Reset filters"
                  )}
                </button>
              </div>
            )}

          </div>


          {/* PAGINATION */}

          <footer
            className="
              flex
              flex-col
              gap-2
              border-t
              border-[#CCD6D1]
              bg-[#F4F4F0]
              px-3
              py-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-[10px] text-[#607169]">
              {ui("Showing")}{" "}
              <strong>
                {firstRecord}
              </strong>{" "}
              -{" "}
              <strong>
                {lastRecord}
              </strong>{" "}
              {ui("of")}{" "}
              <strong>
                {
                  filteredResidents.length
                }
              </strong>
            </p>


            <div className="flex items-center gap-1">

              <button
                type="button"
                aria-label={ui(
                  "Previous page"
                )}
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
                  inline-flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  border
                  border-[#AEBAB4]
                  bg-white
                  text-[#4A5D54]
                  hover:bg-[#EEF2EF]
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                <ChevronLeft
                  size={13}
                />
              </button>


              <span className="min-w-[94px] text-center text-[10px] font-semibold text-[#4A5D54]">
                {ui("Page")}{" "}
                {currentPage}{" "}
                {ui("of")}{" "}
                {totalPages}
              </span>


              <button
                type="button"
                aria-label={ui(
                  "Next page"
                )}
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
                  inline-flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  border
                  border-[#AEBAB4]
                  bg-white
                  text-[#4A5D54]
                  hover:bg-[#EEF2EF]
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                <ChevronRight
                  size={13}
                />
              </button>

            </div>
          </footer>

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
    <div
      className="
        flex
        min-h-[47px]
        items-center
        gap-3
        border-b
        border-[#D8DFDB]
        px-3
        py-2
        last:border-b-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >
      <span
        className={`
          min-w-[30px]
          font-mono
          text-[19px]
          font-bold
          tabular-nums

          ${
            warning
              ? "text-red-700"
              : "text-[#073B2F]"
          }
        `}
      >
        {value}
      </span>

      <span className="text-[9px] font-bold uppercase tracking-[0.035em] text-[#6D7D76]">
        {label}
      </span>
    </div>
  );
}


function TableHead({
  children,
  widthClass = "",
}: {
  children: ReactNode;
  widthClass?: string;
}) {
  return (
    <th
      className={`
        border-r
        border-[#CAD3CE]
        px-3
        py-2
        align-middle
        last:border-r-0
        ${widthClass}
      `}
    >
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
          h-9
          w-8
          shrink-0
          rounded-[2px]
          border
          border-[#BFCAC4]
          object-cover
        "
      />
    );
  }

  return (
    <div
      className="
        flex
        h-9
        w-8
        shrink-0
        items-center
        justify-center
        rounded-[2px]
        border
        border-[#C1CCC6]
        bg-[#E5ECE7]
        text-[9px]
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
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        whitespace-nowrap
        rounded-[2px]
        border
        px-1.5
        py-0.5
        text-[9px]
        font-bold
        ${statusStyle(status)}
      `}
    >
      {label}
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
      <dt className="text-[8px] font-bold uppercase tracking-[0.03em] text-[#7A8982]">
        {label}
      </dt>

      <dd className="mt-0.5 truncate text-[11px] font-medium text-[#31443C]">
        {value}
      </dd>
    </div>
  );
}
