"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  IconDefinition,
} from "@fortawesome/fontawesome-svg-core";

import {
  faCalendarDays,
  faChevronRight,
  faClipboardList,
  faFileLines,
  faGaugeHigh,
  faGear,
  faHeartPulse,
  faPills,
  faRightFromBracket,
  faUserGear,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import {
  normalizeStaffRole,
  useStaffSession,
} from "@/components/StaffSessionProvider";

import {
  signOut,
} from "@/lib/auth";

type MenuItem = {
  name: string;
  href: string;
  icon: IconDefinition;
};

const administratorMenu: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: faGaugeHigh,
  },

  {
    name: "Residents",
    href: "/residents",
    icon: faUsers,
  },

  {
    name: "User Management",
    href: "/staff",
    icon: faUserGear,
  },

  {
    name: "Reports",
    href: "/reports",
    icon: faFileLines,
  },

  {
    name: "Settings",
    href: "/settings",
    icon: faGear,
  },
];

const nurseMenu: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: faGaugeHigh,
  },

  {
    name: "Residents",
    href: "/residents",
    icon: faUsers,
  },

  {
    name: "Medication",
    href: "/medication-administration",
    icon: faPills,
  },

  {
    name: "Appointments",
    href: "/appointments",
    icon: faCalendarDays,
  },
];

const physicianMenu: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: faGaugeHigh,
  },

  {
    name: "Residents",
    href: "/residents",
    icon: faUsers,
  },

  {
    name: "Care Plans",
    href: "/care-plans",
    icon: faClipboardList,
  },

  {
    name: "Appointments",
    href: "/appointments",
    icon: faCalendarDays,
  },
];

function getMenuForRole(
  role:
    | string
    | null
    | undefined
): MenuItem[] {
  const normalizedRole =
    normalizeStaffRole(role);

  if (
    normalizedRole ===
      "administrator" ||
    normalizedRole === "admin"
  ) {
    return administratorMenu;
  }

  if (
    normalizedRole === "nurse"
  ) {
    return nurseMenu;
  }

  if (
    normalizedRole === "physician"
  ) {
    return physicianMenu;
  }

  /*
   * Never default to Administrator.
   *
   * An unknown or unsupported role
   * receives no privileged navigation.
   */
  return [];
}

function formatRole(
  role:
    | string
    | null
    | undefined
): string {
  const normalizedRole =
    normalizeStaffRole(role);

  if (
    normalizedRole === "admin" ||
    normalizedRole ===
      "administrator"
  ) {
    return "Administrator";
  }

  if (
    normalizedRole === "nurse"
  ) {
    return "Nurse";
  }

  if (
    normalizedRole === "physician"
  ) {
    return "Physician";
  }

  return "Staff Member";
}

export default function Sidebar() {
  const pathname =
    usePathname();

  /*
   * IMPORTANT:
   * Sidebar no longer calls
   * getCurrentStaff().
   *
   * RoleGuard and Sidebar now use the
   * same staff object loaded once by
   * StaffSessionProvider.
   */
  const {
    staff,
  } = useStaffSession();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const menu =
    getMenuForRole(
      staff?.role
    );

  const staffName =
    staff?.full_name?.trim() ||
    staff?.name?.trim() ||
    "La-Cura Staff";

  const staffRole =
    formatRole(
      staff?.role
    );

  function isMenuItemActive(
    href: string
  ): boolean {
    if (
      href === "/dashboard"
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const {
        error,
      } = await signOut();

      if (error) {
        throw error;
      }

      window.location.replace(
        "/login"
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );

      setLoggingOut(false);
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-green-800 via-green-800 to-green-900 text-white">
      <div className="border-b border-green-700/50 px-8 py-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-4"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-green-700 shadow-sm">
            <AppIcon
              icon={faHeartPulse}
              className="text-3xl"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-black leading-none tracking-tight text-white">
              La-Cura
            </h1>

            <p className="mt-2 whitespace-nowrap text-sm text-green-200">
              Compassionate Care
            </p>
          </div>
        </Link>
      </div>

      <div className="border-b border-green-700/50 px-8 py-6">
        <p className="text-sm text-green-300">
          Logged in as
        </p>

        <h2 className="mt-1 truncate text-xl font-bold text-white">
          {staffName}
        </h2>

        <div className="mt-2 inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-300" />

          <p className="text-sm font-medium text-green-200">
            {staffRole}
          </p>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-5 py-8"
      >
        <div className="space-y-3">
          {menu.map(
            (item) => {
              const active =
                isMenuItemActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200 ${
                    active
                      ? "bg-white text-green-800 shadow-lg"
                      : "text-green-100 hover:bg-green-700/70 hover:text-white"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <AppIcon
                      icon={item.icon}
                      className="w-5 shrink-0 text-[21px]"
                    />

                    <span className="truncate font-semibold">
                      {item.name}
                    </span>
                  </div>

                  <AppIcon
                    icon={
                      faChevronRight
                    }
                    className={`shrink-0 text-sm transition-all duration-200 ${
                      active
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            }
          )}

          {menu.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">
                No navigation assigned
              </p>

              <p className="mt-2 text-sm leading-6 text-green-100">
                This account does not
                have an approved La-Cura
                navigation profile.
              </p>
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-green-700/50 p-6">
        <button
          type="button"
          onClick={
            handleLogout
          }
          disabled={
            loggingOut
          }
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 py-4 font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AppIcon
            icon={
              faRightFromBracket
            }
            className="text-lg"
            spin={loggingOut}
          />

          {loggingOut
            ? "Logging out..."
            : "Logout"}
        </button>
      </div>
    </aside>
  );
}