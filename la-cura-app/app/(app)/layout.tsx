"use client";

import type {
  ReactNode,
} from "react";

import RoleGuard from "@/components/RoleGuard";
import RoleThemeShell from "@/components/RoleThemeShell";
import Sidebar from "@/components/Sidebar";
import StaffSessionProvider from "@/components/StaffSessionProvider";

type Props = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: Props) {
  return (
    <StaffSessionProvider>
      <RoleThemeShell>
        <RoleGuard
          allow={[
            "Administrator",
            "Nurse",
            "Physician",
          ]}
        >
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <main className="min-w-0 flex-1">
              {children}
            </main>
          </div>
        </RoleGuard>
      </RoleThemeShell>
    </StaffSessionProvider>
  );
}
