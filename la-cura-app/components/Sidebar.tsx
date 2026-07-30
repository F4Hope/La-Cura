"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
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
import { getCurrentStaff, signOut } from "@/lib/auth";

type Staff = {
  id?: number | string;
  full_name?: string | null;
  name?: string | null;
  role?: string | null;
};

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

export default function Sidebar() {
  const pathname = usePathname();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStaff() {
      try {
        const currentStaff = await getCurrentStaff();

        if (active) {
          setStaff(currentStaff as Staff | null);
        }
      } catch (error) {
        console.error("Unable to load current staff:", error);

        if (active) {
          setStaff(null);
        }
      }
    }

    void loadStaff();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }

  function getMenu(): MenuItem[] {
    const normalizedRole = staff?.role?.trim().toLowerCase();

    if (normalizedRole === "nurse") {
      return nurseMenu;
    }

    if (normalizedRole === "physician") {
      return physicianMenu;
    }

    return administratorMenu;
  }

  function isMenuItemActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const menu = getMenu();

  const staffName =
    staff?.full_name?.trim() ||
    staff?.name?.trim() ||
    "La-Cura Staff";

  const staffRole = staff?.role?.trim() || "Staff Member";

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white shadow-2xl">
      <div className="border-b border-green-700/40 px-8 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <AppIcon
              icon={faHeartPulse}
              className="text-[34px] text-green-700"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-4xl font-black tracking-tight">
              La-Cura
            </h1>

            <p className="mt-1 text-sm text-green-200">
              Compassionate Care
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-green-700/40 px-8 py-6">
        <p className="text-sm text-green-300">Logged in as</p>

        <h2 className="mt-1 truncate text-xl font-bold">
          {staffName}
        </h2>

        <p className="mt-1 text-sm font-medium text-green-200">
          {staffRole}
        </p>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-3 px-5 py-8"
      >
        {menu.map((item) => {
          const active = isMenuItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 ${
                active
                  ? "bg-white text-green-800 shadow-lg"
                  : "text-green-100 hover:bg-green-700/70"
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
                icon={faChevronRight}
                className={`text-sm transition-all duration-200 ${
                  active
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-green-700/40 p-6">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 py-4 font-semibold transition hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AppIcon
            icon={faRightFromBracket}
            className="text-lg"
            spin={loggingOut}
          />

          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}