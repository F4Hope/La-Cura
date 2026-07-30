"use client";

import Link from "next/link";

import {
  faBell,
  faGear,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Welcome back to La-Cura
          </p>
        </div>

        <div className="hidden h-12 w-[380px] items-center rounded-2xl bg-gray-100 px-4 lg:flex">
          <AppIcon
            icon={faMagnifyingGlass}
            className="text-gray-500"
          />

          <input
            type="search"
            aria-label="Search La-Cura"
            placeholder="Search residents, staff, medications..."
            className="ml-3 flex-1 bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            aria-label="Open notifications"
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 transition hover:bg-green-100 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100"
          >
            <AppIcon
              icon={faBell}
              className="text-lg"
            />

            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
            />
          </button>

          <Link
            href="/settings"
            aria-label="Open settings"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 transition hover:bg-green-100 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100"
          >
            <AppIcon
              icon={faGear}
              className="text-lg"
            />
          </Link>

          <div className="ml-1 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 font-bold text-white">
              A
            </div>

            <div className="hidden md:block">
              <p className="font-semibold text-gray-900">
                Administrator
              </p>

              <p className="text-sm text-gray-500">
                La-Cura
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}