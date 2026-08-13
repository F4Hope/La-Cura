"use client";

import type {
  ReactNode,
} from "react";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentStaff,
} from "@/lib/auth";

export type StaffSessionRecord = {
  id?: number | string;
  auth_user_id?: string | null;

  full_name?: string | null;
  name?: string | null;

  role?: string | null;
  staff_code?: string | null;
  preferred_language?: "en" | "fr" | null;

  active?: boolean | null;

  must_change_password?:
    | boolean
    | null;
};

export type StaffSessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type StaffSessionContextValue = {
  staff: StaffSessionRecord | null;

  status: StaffSessionStatus;

  error: string | null;

  refreshStaff: () => Promise<void>;
};

const StaffSessionContext =
  createContext<
    StaffSessionContextValue | undefined
  >(undefined);

type Props = {
  children: ReactNode;
};

export default function StaffSessionProvider({
  children,
}: Props) {
  const [
    staff,
    setStaff,
  ] = useState<StaffSessionRecord | null>(
    null
  );

  const [
    status,
    setStatus,
  ] = useState<StaffSessionStatus>(
    "loading"
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const loadStaff =
    useCallback(
      async (
        showLoading: boolean
      ) => {
        if (showLoading) {
          setStatus("loading");
        }

        setError(null);

        try {
          const currentStaff =
            await getCurrentStaff();

          if (!currentStaff) {
            setStaff(null);

            setStatus(
              "unauthenticated"
            );

            return;
          }

          setStaff(
            currentStaff as StaffSessionRecord
          );

          setStatus(
            "authenticated"
          );
        } catch (loadError) {
          console.error(
            "Unable to initialize staff session:",
            loadError
          );

          setStaff(null);

          setError(
            "La-Cura could not verify the current staff session."
          );

          setStatus("error");
        }
      },
      []
    );

  useEffect(() => {
    let active = true;

    async function initialize() {
      setStatus("loading");

      setError(null);

      try {
        const currentStaff =
          await getCurrentStaff();

        if (!active) {
          return;
        }

        if (!currentStaff) {
          setStaff(null);

          setStatus(
            "unauthenticated"
          );

          return;
        }

        setStaff(
          currentStaff as StaffSessionRecord
        );

        setStatus(
          "authenticated"
        );
      } catch (loadError) {
        console.error(
          "Unable to initialize staff session:",
          loadError
        );

        if (!active) {
          return;
        }

        setStaff(null);

        setError(
          "La-Cura could not verify the current staff session."
        );

        setStatus("error");
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  const refreshStaff =
    useCallback(async () => {
      await loadStaff(false);
    }, [loadStaff]);

  const value =
    useMemo<
      StaffSessionContextValue
    >(
      () => ({
        staff,
        status,
        error,
        refreshStaff,
      }),
      [
        staff,
        status,
        error,
        refreshStaff,
      ]
    );

  return (
    <StaffSessionContext.Provider
      value={value}
    >
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSession(): StaffSessionContextValue {
  const context =
    useContext(
      StaffSessionContext
    );

  if (!context) {
    throw new Error(
      "useStaffSession must be used inside StaffSessionProvider."
    );
  }

  return context;
}

export function normalizeStaffRole(
  role:
    | string
    | null
    | undefined
): string {
  return (
    role
      ?.trim()
      .toLowerCase() ?? ""
  );
}

export function isAdministratorRole(
  role:
    | string
    | null
    | undefined
): boolean {
  const normalized =
    normalizeStaffRole(role);

  return (
    normalized ===
      "administrator" ||
    normalized === "admin"
  );
}

export function isNurseRole(
  role:
    | string
    | null
    | undefined
): boolean {
  return (
    normalizeStaffRole(role) ===
    "nurse"
  );
}

export function isPhysicianRole(
  role:
    | string
    | null
    | undefined
): boolean {
  return (
    normalizeStaffRole(role) ===
    "physician"
  );
}