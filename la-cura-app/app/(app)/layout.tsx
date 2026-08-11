"use client";

import type {
  ReactNode,
} from "react";

import RoleGuard from "@/components/RoleGuard";
import RoleThemeShell from "@/components/RoleThemeShell";
import StaffSessionProvider from "@/components/StaffSessionProvider";

import ClinicalTopNav from "@/components/ClinicalTopNav";
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
          <div className="min-h-screen bg-[#F7F5EF]">
            <ClinicalTopNav />

            <main className="min-w-0">
              {children}
            </main>
          </div>
        </RoleGuard>
      </RoleThemeShell>
    </StaffSessionProvider>
  );
}
