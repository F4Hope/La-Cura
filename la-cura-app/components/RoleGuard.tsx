"use client";

import type { ReactNode } from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import {
  faBan,
  faShieldHalved,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import { getCurrentStaff } from "@/lib/auth";

type Props = {
  allow: string[];
  children: ReactNode;
};

type AccessState =
  | "loading"
  | "allowed"
  | "denied"
  | "inactive"
  | "error";

export default function RoleGuard({
  allow,
  children,
}: Props) {
  const pathname = usePathname();

  const [accessState, setAccessState] =
    useState<AccessState>("loading");

  const [message, setMessage] =
    useState("");

  const allowedRoles = useMemo(
    () => [...allow],
    [allow]
  );

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      setAccessState("loading");
      setMessage("");

      try {
        const staff =
          await getCurrentStaff();

        if (!active) {
          return;
        }

        if (!staff) {
          window.location.replace(
            "/login"
          );

          return;
        }

        if (staff.active !== true) {
          setMessage(
            "This staff account is inactive. Contact an administrator."
          );

          setAccessState("inactive");
          return;
        }

        if (
          staff.must_change_password ===
            true &&
          pathname !==
            "/change-password"
        ) {
          window.location.replace(
            "/change-password"
          );

          return;
        }

        if (
          !allowedRoles.includes(
            staff.role
          )
        ) {
          setMessage(
            "You do not have permission to access this page."
          );

          setAccessState("denied");
          return;
        }

        setAccessState("allowed");
      } catch (error) {
        console.error(
          "Role authorization failed:",
          error
        );

        if (!active) {
          return;
        }

        setMessage(
          "La-Cura could not verify your access. Sign in again."
        );

        setAccessState("error");
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, [allowedRoles, pathname]);

  if (accessState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <AppIcon
            icon={faSpinner}
            spin
            className="text-4xl text-green-700"
          />

          <p className="mt-4 font-semibold text-slate-600">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (
    accessState === "denied" ||
    accessState === "inactive" ||
    accessState === "error"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              accessState === "error"
                ? "bg-amber-100"
                : "bg-red-100"
            }`}
          >
            <AppIcon
              icon={
                accessState === "denied"
                  ? faBan
                  : faShieldHalved
              }
              className={`text-4xl ${
                accessState === "error"
                  ? "text-amber-700"
                  : "text-red-700"
              }`}
            />
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            {accessState === "denied"
              ? "Access Denied"
              : accessState ===
                  "inactive"
                ? "Account Inactive"
                : "Access Verification Failed"}
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {message}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.replace(
                "/login"
              );
            }}
            className="mt-7 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Return to Login
          </button>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}