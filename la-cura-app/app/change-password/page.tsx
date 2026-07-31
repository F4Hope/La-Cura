"use client";

import type { FormEvent } from "react";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  faCheck,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faHeartPulse,
  faKey,
  faLock,
  faRightFromBracket,
  faShieldHalved,
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import { supabase } from "@/lib/supabase/client";

type ChangePasswordResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  staff?: {
    id?: number;
    fullName?: string;
    staffCode?: string;
  };
};

type PasswordRequirement = {
  label: string;
  satisfied: boolean;
};

export default function ChangePasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (
        sessionError ||
        !sessionData.session
      ) {
        router.replace("/login");
        return;
      }

      setCheckingSession(false);
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  const requirements =
    useMemo<PasswordRequirement[]>(
      () => [
        {
          label:
            "At least 12 characters",
          satisfied:
            newPassword.length >= 12,
        },
        {
          label:
            "At least one uppercase letter",
          satisfied:
            /[A-Z]/.test(newPassword),
        },
        {
          label:
            "At least one lowercase letter",
          satisfied:
            /[a-z]/.test(newPassword),
        },
        {
          label:
            "At least one number",
          satisfied:
            /[0-9]/.test(newPassword),
        },
        {
          label:
            "At least one special character",
          satisfied:
            /[^A-Za-z0-9]/.test(
              newPassword
            ),
        },
        {
          label: "No spaces",
          satisfied:
            newPassword.length > 0 &&
            !/\s/.test(newPassword),
        },
      ],
      [newPassword]
    );

  const passwordIsValid =
    requirements.every(
      (requirement) =>
        requirement.satisfied
    ) &&
    newPassword.length <= 128;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const canSubmit =
    passwordIsValid &&
    passwordsMatch &&
    !loading &&
    !success;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      const accessToken =
        sessionData.session
          ?.access_token;

      if (
        sessionError ||
        !accessToken
      ) {
        throw new Error(
          "Your session has expired. Sign in again."
        );
      }

      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            newPassword,
          }),
        }
      );

      const result =
        (await response.json()) as ChangePasswordResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to change your password."
        );
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1800);
    } catch (caughtError) {
      console.error(
        "Password change failed:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to change your password."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <AppIcon
            icon={faSpinner}
            spin
            className="text-4xl text-green-700"
          />

          <p className="mt-4 font-semibold text-slate-600">
            Verifying your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-700 to-emerald-500 px-5 py-10">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-green-300/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-200/10 blur-3xl" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <header className="bg-gradient-to-r from-green-800 to-green-600 px-7 py-7 text-white sm:px-9">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <AppIcon
                icon={faHeartPulse}
                className="text-3xl"
              />
            </div>

            <div>
              <p className="font-semibold text-green-100">
                La-Cura Account Security
              </p>

              <h1 className="mt-1 text-3xl font-black">
                Create a Private Password
              </h1>

              <p className="mt-2 text-sm leading-6 text-green-100">
                Replace the temporary password
                provided by your administrator.
              </p>
            </div>
          </div>
        </header>

        <div className="p-7 sm:p-9">
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <AppIcon
                  icon={faCircleCheck}
                  className="text-5xl text-green-700"
                />
              </div>

              <h2 className="mt-6 text-3xl font-black text-slate-900">
                Password Changed
              </h2>

              <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
                Your new password is active.
                You are being redirected to
                sign in again.
              </p>

              <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
            </div>
          ) : (
            <>
              <div className="mb-7 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-800">
                <AppIcon
                  icon={faShieldHalved}
                  className="mt-1 shrink-0"
                />

                <p>
                  Choose a password that only
                  you know. Do not share it with
                  your administrator or another
                  staff member.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block font-bold text-slate-800"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <AppIcon
                      icon={faKey}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(
                          event.target.value
                        );

                        setError("");
                      }}
                      autoComplete="new-password"
                      disabled={loading}
                      placeholder="Enter a new private password"
                      className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-green-700 disabled:opacity-50"
                    >
                      <AppIcon
                        icon={
                          showNewPassword
                            ? faEyeSlash
                            : faEye
                        }
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block font-bold text-slate-800"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <AppIcon
                      icon={faLock}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value
                        );

                        setError("");
                      }}
                      autoComplete="new-password"
                      disabled={loading}
                      placeholder="Enter the password again"
                      className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmed password"
                          : "Show confirmed password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-green-700 disabled:opacity-50"
                    >
                      <AppIcon
                        icon={
                          showConfirmPassword
                            ? faEyeSlash
                            : faEye
                        }
                      />
                    </button>
                  </div>

                  {confirmPassword &&
                    !passwordsMatch && (
                      <p className="mt-2 text-sm font-semibold text-red-600">
                        The passwords do not
                        match.
                      </p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-bold text-slate-800">
                    Password requirements
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {requirements.map(
                      (requirement) => (
                        <div
                          key={
                            requirement.label
                          }
                          className={`flex items-start gap-2 text-sm ${
                            requirement.satisfied
                              ? "text-green-700"
                              : "text-slate-500"
                          }`}
                        >
                          <AppIcon
                            icon={
                              requirement.satisfied
                                ? faCheck
                                : faLock
                            }
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {
                              requirement.label
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    <AppIcon
                      icon={
                        faTriangleExclamation
                      }
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <AppIcon
                    icon={
                      loading
                        ? faSpinner
                        : faKey
                    }
                    spin={loading}
                  />

                  {loading
                    ? "Changing Password..."
                    : "Set New Password"}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  <AppIcon
                    icon={faRightFromBracket}
                  />

                  Sign Out
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}