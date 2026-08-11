"use client";

import type {
  ReactNode,
} from "react";

import {
  useStaffSession,
} from "@/components/StaffSessionProvider";

type RoleTheme =
  | "administrator"
  | "nurse"
  | "physician"
  | "neutral";

type Props = {
  children: ReactNode;
};

function resolveRoleTheme(
  role: unknown
): RoleTheme {
  const normalized =
    String(role ?? "")
      .trim()
      .toLowerCase();

  if (
    normalized ===
      "administrator" ||
    normalized === "admin"
  ) {
    return "administrator";
  }

  if (
    normalized === "nurse"
  ) {
    return "nurse";
  }

  if (
    normalized ===
      "physician" ||
    normalized === "doctor"
  ) {
    return "physician";
  }

  return "neutral";
}

export default function RoleThemeShell({
  children,
}: Props) {
  const {
    staff,
  } = useStaffSession();

  const theme =
    resolveRoleTheme(
      staff?.role
    );

  return (
    <div
      data-lacura-role-theme={
        theme
      }
      className="role-theme-shell min-h-screen"
    >
      {children}
    </div>
  );
}
