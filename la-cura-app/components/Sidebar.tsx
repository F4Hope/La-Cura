"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  HeartPulse,
  Pill,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";

import { signOut } from "@/lib/auth";

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen bg-green-800 text-white flex flex-col">

      <div className="p-6">

        <h1 className="text-3xl font-bold mb-10">
          La-Cura
        </h1>

        <nav className="space-y-4">

          <Link href="/dashboard" className="flex items-center gap-3 hover:text-green-300">
            <LayoutDashboard size={22} />
            Dashboard
          </Link>

          <Link href="/residents" className="flex items-center gap-3 hover:text-green-300">
            <Users size={22} />
            Residents
          </Link>

          <Link href="/staff" className="flex items-center gap-3 hover:text-green-300">
            <HeartPulse size={22} />
            Staff
          </Link>

          <Link href="/medications" className="flex items-center gap-3 hover:text-green-300">
            <Pill size={22} />
            Medications
          </Link>

          <Link href="/appointments" className="flex items-center gap-3 hover:text-green-300">
            <CalendarDays size={22} />
            Appointments
          </Link>

          <Link href="/care-plans" className="flex items-center gap-3 hover:text-green-300">
            <FileText size={22} />
            Care Plans
          </Link>

          <Link href="/reports" className="flex items-center gap-3 hover:text-green-300">
            <BarChart3 size={22} />
            Reports
          </Link>

          <Link href="/settings" className="flex items-center gap-3 hover:text-green-300">
            <Settings size={22} />
            Settings
          </Link>

        </nav>

      </div>

      <div className="mt-auto border-t border-green-700 p-6">

        <div className="flex items-center gap-3 mb-5">

          <UserCircle size={40} />

          <div>

            <p className="font-semibold">
              Administrator
            </p>

            <p className="text-sm text-green-200">
              Logged In
            </p>

          </div>

        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 transition rounded-xl px-4 py-3"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </aside>
  );
}