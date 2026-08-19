"use client";

import type {
  ReactNode,
} from "react";

import ClinicalTopNav from "@/components/ClinicalTopNav";
import LanguageProvider from "@/components/i18n/LanguageProvider";
import RoleGuard from "@/components/RoleGuard";
import RoleThemeShell from "@/components/RoleThemeShell";
import StaffSessionProvider from "@/components/StaffSessionProvider";


type Props = {
  children:
    ReactNode;
};


export default function AppLayout({
  children,
}: Props) {
  return (
    <StaffSessionProvider>
      <LanguageProvider>
        <RoleThemeShell>
          <RoleGuard
            allow={[
              "Administrator",
              "Nurse",
              "Physician",
            ]}
          >
            <div className="lacura-auth-app min-h-screen bg-[#F7F5EF]">
              <ClinicalTopNav />

              <main className="min-w-0">
                {children}
              </main>
            </div>
          </RoleGuard>
        </RoleThemeShell>
      </LanguageProvider>
    </StaffSessionProvider>
  );
}
