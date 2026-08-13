"use client";

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  Activity,
  Bed,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileBarChart,
  HeartPulse,
  Home,
  NotebookPen,
  Pill,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  useStaffSession,
} from "@/components/StaffSessionProvider";


type StaffRole =
  | "administrator"
  | "nurse"
  | "physician"
  | "staff";


type NavLink = {
  label: string;
  href: string;

  icon?:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;
};


type NavMenu = {
  label: string;

  match:
    string[];

  items:
    NavLink[];
};


function normalizeRole(
  value: unknown
): StaffRole {
  const role =
    String(
      value ??
        ""
    )
      .trim()
      .toLowerCase();


  if (
    role ===
      "administrator" ||
    role ===
      "admin"
  ) {
    return "administrator";
  }


  if (
    role ===
      "physician" ||
    role ===
      "doctor"
  ) {
    return "physician";
  }


  if (
    role ===
    "nurse"
  ) {
    return "nurse";
  }


  return "staff";
}


function getString(
  object:
    Record<
      string,
      unknown
    >,

  keys:
    string[]
) {
  for (
    const key
    of keys
  ) {
    const value =
      object[key];


    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }


  return "";
}


function getGreeting(
  language:
    "en" | "fr"
) {
  const hour =
    new Date()
      .getHours();


  if (
    language ===
    "fr"
  ) {
    if (
      hour < 12
    ) {
      return "Bonjour";
    }


    if (
      hour < 18
    ) {
      return "Bon après-midi";
    }


    return "Bonsoir";
  }


  if (
    hour < 12
  ) {
    return "Good morning";
  }


  if (
    hour < 17
  ) {
    return "Good afternoon";
  }


  return "Good evening";
}


function getRoleMessage(
  role:
    StaffRole,

  language:
    "en" | "fr"
) {
  if (
    language ===
    "fr"
  ) {
    switch (
      role
    ) {
      case "nurse":
        return "Merci pour les soins que vous apportez à chaque résident, à chaque service.";

      case "physician":
        return "Votre jugement clinique contribue à la continuité des soins de chaque résident.";

      case "administrator":
        return "Merci de maintenir les équipes de soins coordonnées, soutenues et opérationnelles.";

      default:
        return "Merci de contribuer aujourd’hui à des soins sûrs et de qualité.";
    }
  }


  switch (
    role
  ) {
    case "nurse":
      return "Thank you for the care you give every resident, every shift.";

    case "physician":
      return "Your clinical judgment keeps every resident’s care moving forward.";

    case "administrator":
      return "Thank you for keeping your care teams connected, supported, and ready.";

    default:
      return "Thank you for helping deliver safe, compassionate care today.";
  }
}


function getGreetingName(
  role:
    StaffRole,

  name:
    string,

  language:
    "en" | "fr"
) {
  const firstName =
    name
      .split(
        /\s+/
      )[0] ||
    (
      language ===
      "fr"
        ? "Clinicien"
        : "Clinician"
    );


  if (
    role ===
    "physician"
  ) {
    return `Dr. ${firstName}`;
  }


  if (
    role ===
    "nurse"
  ) {
    return language ===
      "fr"
      ? `Infirmier(ère) ${firstName}`
      : `Nurse ${firstName}`;
  }


  return firstName;
}


function formatRole(
  role:
    StaffRole,

  language:
    "en" | "fr"
) {
  if (
    language ===
    "fr"
  ) {
    switch (
      role
    ) {
      case "administrator":
        return "Administrateur";

      case "physician":
        return "Médecin";

      case "nurse":
        return "Infirmier(ère)";

      default:
        return "Personnel clinique";
    }
  }


  switch (
    role
  ) {
    case "administrator":
      return "Administrator";

    case "physician":
      return "Physician";

    case "nurse":
      return "Nurse";

    default:
      return "Clinical Staff";
  }
}


function isPathActive(
  pathname:
    string,

  href:
    string
) {
  if (
    href ===
    "/dashboard"
  ) {
    return (
      pathname ===
      "/dashboard"
    );
  }


  return (
    pathname ===
      href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}


function isAnyPathActive(
  pathname:
    string,

  paths:
    string[]
) {
  return paths.some(
    (
      path
    ) =>
      pathname ===
        path ||
      pathname.startsWith(
        `${path}/`
      )
  );
}


function ClinicalMenu({
  menu,
  pathname,
}: {
  menu:
    NavMenu;

  pathname:
    string;
}) {
  const active =
    isAnyPathActive(
      pathname,
      menu.match
    );


  return (
    <details className="group relative h-full">
      <summary
        className={`
          flex h-full cursor-pointer
          list-none items-center gap-1.5
          border-b-2 px-4
          text-[13px] font-bold
          uppercase tracking-[0.045em]
          transition
          [&::-webkit-details-marker]:hidden

          ${
            active
              ? "border-[#D5A437] bg-[#E9EEE9] text-[#073B2F]"
              : "border-transparent text-[#30423C] hover:bg-[#F1F2ED] hover:text-[#073B2F]"
          }
        `}
      >
        {menu.label}

        <ChevronDown
          size={14}
          strokeWidth={
            2
          }
          className="transition-transform group-open:rotate-180"
        />
      </summary>


      <div className="absolute left-0 top-full z-[100] min-w-[275px] overflow-hidden border border-[#D9E0DC] bg-white py-2 shadow-[0_16px_40px_rgba(7,59,47,0.12)]">
        {menu.items.map(
          (
            item
          ) => {
            const Icon =
              item.icon;


            const itemActive =
              isPathActive(
                pathname,
                item.href
              );


            return (
              <Link
                key={`${menu.label}-${item.href}`}
                href={
                  item.href
                }
                className={`
                  flex items-center
                  gap-3 px-4 py-2.5
                  text-sm transition

                  ${
                    itemActive
                      ? "bg-[#F1F5F2] font-semibold text-[#073B2F]"
                      : "text-[#4B5D56] hover:bg-[#F7F5EF] hover:text-[#073B2F]"
                  }
                `}
              >
                {Icon && (
                  <Icon
                    size={
                      16
                    }
                    className={
                      itemActive
                        ? "text-[#D5A437]"
                        : "text-[#668078]"
                    }
                  />
                )}

                {item.label}
              </Link>
            );
          }
        )}
      </div>
    </details>
  );
}


export default function ClinicalTopNav() {
  const pathname =
    usePathname();


  const {
    staff,
  } =
    useStaffSession();


  const {
    language,
    locale,
    t,
  } =
    useLanguage();


  const profile =
    (staff ??
      {}) as Record<
      string,
      unknown
    >;


  const role =
    normalizeRole(
      profile.role
    );


  const fullName =
    getString(
      profile,
      [
        "full_name",
        "name",
        "staff_name",
        "display_name",
        "first_name",
      ]
    ) ||
    t(
      "staff.clinical"
    );


  const greetingName =
    getGreetingName(
      role,
      fullName,
      language
    );


  const initial =
    fullName
      .charAt(
        0
      )
      .toUpperCase() ||
    "L";


  const currentDate =
    new Intl.DateTimeFormat(
      locale,
      {
        weekday:
          "short",

        month:
          "short",

        day:
          "numeric",
      }
    ).format(
      new Date()
    );


  const clinicalMenu:
    NavMenu = {
    label:
      t(
        "nav.clinical"
      ),

    match: [
      "/care-plans",
      "/add-vitals",
      "/add-nursing-note",
      "/add-incident-report",
      "/medication-administration",
      "/appointments",
    ],

    items: [
      {
        label:
          t(
            "nav.carePlans"
          ),

        href:
          "/care-plans",

        icon:
          ClipboardList,
      },

      {
        label:
          t(
            "nav.recordVitals"
          ),

        href:
          "/add-vitals",

        icon:
          HeartPulse,
      },

      {
        label:
          t(
            "nav.nursingNotes"
          ),

        href:
          "/add-nursing-note",

        icon:
          NotebookPen,
      },

      {
        label:
          t(
            "nav.incidentReports"
          ),

        href:
          "/add-incident-report",

        icon:
          ShieldCheck,
      },

      {
        label:
          t(
            "nav.medicationAdministration"
          ),

        href:
          "/medication-administration",

        icon:
          Pill,
      },

      {
        label:
          t(
            "nav.appointments"
          ),

        href:
          "/appointments",

        icon:
          CalendarDays,
      },
    ],
  };


  const adminMenu:
    NavMenu = {
    label:
      t(
        "nav.admin"
      ),

    match: [
      "/staff",
      "/settings",
    ],

    items: [
      {
        label:
          t(
            "nav.staffManagement"
          ),

        href:
          "/staff",

        icon:
          Users,
      },

      {
        label:
          t(
            "nav.settings"
          ),

        href:
          "/settings",

        icon:
          Settings,
      },
    ],
  };


  return (
    <header className="sticky top-0 z-50 border-t-[3px] border-[#073B2F] bg-[#F7F5EF] text-[#10231E] shadow-[0_1px_0_rgba(7,59,47,0.12)]">
      <div className="border-b border-[#DCE3DF]">
        <div className="mx-auto flex min-h-[72px] max-w-[1800px] items-center justify-between gap-6 px-4 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D9E0DC] bg-white">
                <Image
                  src="/logo.png"
                  alt="La-Cura"
                  width={
                    35
                  }
                  height={
                    35
                  }
                  className="h-8 w-8 object-contain"
                />
              </div>


              <div className="hidden sm:block">
                <p className="text-[24px] font-black leading-none tracking-[-0.035em] text-[#073B2F]">
                  La-Cura
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B782A]">
                  {t(
                    "brand.workspace"
                  )}
                </p>
              </div>
            </Link>


            <div className="hidden min-w-0 border-l border-[#D7DFDB] pl-5 lg:block">
              <div className="flex items-center gap-2">
                <p className="truncate text-[14px] font-bold text-[#10231E]">
                  {getGreeting(
                    language
                  )}
                  ,{" "}
                  <span className="text-[#073B2F]">
                    {greetingName}
                  </span>
                </p>

                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D5A437]" />
              </div>


              <p className="mt-0.5 max-w-[570px] truncate text-[12px] text-[#66766F]">
                {getRoleMessage(
                  role,
                  language
                )}
              </p>
            </div>
          </div>


          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#DCE3DF] bg-white px-3 py-1.5 xl:flex">
              <span className="h-2 w-2 rounded-full bg-[#0F9D6A] shadow-[0_0_0_3px_rgba(15,157,106,0.10)]" />

              <span className="text-[11px] font-semibold text-[#53675F]">
                {t(
                  "session.secure"
                )}
              </span>
            </div>


            <div className="hidden text-right md:block">
              <p className="text-[11px] font-semibold text-[#7A8A83]">
                {currentDate}
              </p>

              <p className="mt-0.5 text-[12px] font-bold text-[#30453D]">
                {formatRole(
                  role,
                  language
                )}
              </p>
            </div>


            <Link
              href="/settings"
              aria-label={
                t(
                  "nav.settings"
                )
              }
              className="hidden h-9 w-9 items-center justify-center border border-[#D7DFDB] bg-white text-[#53675F] transition hover:bg-[#F1F2ED] hover:text-[#073B2F] sm:flex"
            >
              <Settings
                size={
                  15
                }
              />
            </Link>


            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-full border border-[#D7DFDB] bg-white p-1 pr-2.5 transition hover:border-[#B8C8C0] hover:bg-[#FBFAF6]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#073B2F] text-xs font-black text-white">
                {initial}
              </span>

              <div className="hidden max-w-[150px] text-left xl:block">
                <p className="truncate text-[12px] font-bold text-[#172A23]">
                  {fullName}
                </p>

                <p className="truncate text-[10px] text-[#74847D]">
                  {t(
                    "account.my"
                  )}
                </p>
              </div>

              <ChevronDown
                size={
                  13
                }
                className="text-[#6F8179]"
              />
            </Link>
          </div>
        </div>
      </div>


      <div className="h-[44px] border-b border-[#CED8D3] bg-white">
        <div className="mx-auto flex h-full max-w-[1800px] items-stretch overflow-x-auto px-2 sm:px-3 lg:px-4">
          <PrimaryLink
            pathname={
              pathname
            }
            href="/dashboard"
            label={
              t(
                "nav.home"
              )
            }
            icon={
              Home
            }
          />


          <PrimaryLink
            pathname={
              pathname
            }
            href="/residents"
            label={
              t(
                "nav.residents"
              )
            }
            icon={
              Bed
            }
          />


          <ClinicalMenu
            menu={
              clinicalMenu
            }
            pathname={
              pathname
            }
          />


          <PrimaryLink
            pathname={
              pathname
            }
            href="/medications"
            label={
              t(
                "nav.medications"
              )
            }
            icon={
              Pill
            }
          />


          <PrimaryLink
            pathname={
              pathname
            }
            href="/reports"
            label={
              t(
                "nav.reports"
              )
            }
            icon={
              FileBarChart
            }
          />


          {role ===
            "administrator" && (
            <ClinicalMenu
              menu={
                adminMenu
              }
              pathname={
                pathname
              }
            />
          )}


          <div className="ml-auto hidden items-center px-4 2xl:flex">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#73847D]">
              <Activity
                size={
                  14
                }
                className="text-[#0F8B62]"
              />

              {t(
                "nav.clinicalBrand"
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


function PrimaryLink({
  pathname,
  href,
  label,
  icon:
    Icon,
}: {
  pathname:
    string;

  href:
    string;

  label:
    string;

  icon:
    React.ComponentType<{
      size?: number;
      strokeWidth?: number;
    }>;
}) {
  const active =
    isPathActive(
      pathname,
      href
    );


  return (
    <Link
      href={
        href
      }
      className={`
        flex shrink-0
        items-center gap-2
        border-b-2 px-4
        text-[13px] font-bold
        uppercase tracking-[0.045em]
        transition

        ${
          active
            ? "border-[#D5A437] bg-[#E9EEE9] text-[#073B2F]"
            : "border-transparent text-[#30423C] hover:bg-[#F1F2ED]"
        }
      `}
    >
      <Icon
        size={
          14
        }
        strokeWidth={
          2.2
        }
      />

      {label}
    </Link>
  );
}
