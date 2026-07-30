"use client";

import Sidebar from "@/components/Sidebar";
import RoleGuard from "@/components/RoleGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <RoleGuard
      allow={[
        "Administrator",
        "Nurse",
        "Physician",
      ]}
    >

      <div className="flex min-h-screen bg-gray-100">

        <Sidebar />

        <main className="flex-1">

          {children}

        </main>

      </div>

    </RoleGuard>

  );

}