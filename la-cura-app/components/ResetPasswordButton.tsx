"use client";

import {
  useEffect,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  faCheck,
  faClipboard,
  faCopy,
  faEye,
  faEyeSlash,
  faIdCard,
  faKey,
  faSpinner,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";
import { supabase } from "@/lib/supabase/client";

type Props = {
  staffId: number;
  fullName: string;
  staffCode: string;
};

type ResetCredentials = {
  staffCode: string;
  temporaryPassword: string;
};

type ResetPasswordResponse = {
  success?: boolean;
  message?: string;

  credentials?: {
    staffCode?: string;
    temporaryPassword?: string;
  };

  staff?: {
    id?: number;
    fullName?: string;
    role?: string;
  };

  error?: string;
};

export default function ResetPasswordButton({
  staffId,
  fullName,
  staffCode,
}: Props) {
  const [mounted, setMounted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    credentials,
    setCredentials,
  ] = useState<ResetCredentials | null>(
    null
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(true);

  const [copiedField, setCopiedField] =
    useState<
      "staff-code" | "password" | "both" | null
    >(null);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeCredentials();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [credentials]);

  function closeCredentials() {
    setCredentials(null);
    setShowPassword(true);
    setCopiedField(null);
    setError("");
  }

  async function copyText(
    text: string,
    field:
      | "staff-code"
      | "password"
      | "both"
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (copyError) {
      console.error(
        "Unable to copy temporary credentials:",
        copyError
      );

      setError(
        "The credentials could not be copied automatically. Select and copy them manually."
      );
    }
  }

  async function resetPassword() {
    if (loading) {
      return;
    }

    const confirmed =
      window.confirm(
        `Reset the password for ${fullName}?\n\nTheir current password will stop working immediately.`
      );

    if (!confirmed) {
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
          "Your administrator session has expired. Sign in again."
        );
      }

      const response = await fetch(
        "/api/staff/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            staffId,
          }),
        }
      );

      const result =
        (await response.json()) as ResetPasswordResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to reset the staff password."
        );
      }

      const returnedStaffCode =
        result.credentials?.staffCode;

      const temporaryPassword =
        result.credentials
          ?.temporaryPassword;

      if (
        !returnedStaffCode ||
        !temporaryPassword
      ) {
        throw new Error(
          "The password was reset, but the temporary credentials were not returned."
        );
      }

      setCredentials({
        staffCode:
          returnedStaffCode,

        temporaryPassword,
      });

      setShowPassword(true);
      setCopiedField(null);
    } catch (caughtError) {
      console.error(
        "Unable to reset staff password:",
        caughtError
      );

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reset the staff password.";

      setError(message);
      window.alert(message);
    } finally {
      setLoading(false);
    }
  }

  const credentialsText =
    credentials
      ? [
          "La-Cura Staff Login",
          "",
          `Staff Member: ${fullName}`,
          `Staff Code: ${credentials.staffCode}`,
          `Temporary Password: ${credentials.temporaryPassword}`,
          "",
          "The staff member must change this temporary password after signing in.",
        ].join("\n")
      : "";

  return (
    <>
      <button
        type="button"
        onClick={resetPassword}
        disabled={loading}
        title={`Reset password for ${staffCode}`}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
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
          ? "Resetting..."
          : "Reset Password"}
      </button>

      {mounted &&
        credentials &&
        createPortal(
          <div
            role="presentation"
            onMouseDown={
              closeCredentials
            }
            className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-password-title"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              className="my-auto w-full max-w-2xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
            >
              <header className="bg-gradient-to-r from-indigo-800 to-indigo-600 px-6 py-6 text-white sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <AppIcon
                        icon={faKey}
                        className="text-2xl"
                      />
                    </div>

                    <div>
                      <h2
                        id="reset-password-title"
                        className="text-2xl font-black"
                      >
                        Password Reset Complete
                      </h2>

                      <p className="mt-1 text-indigo-100">
                        {fullName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeCredentials
                    }
                    aria-label="Close password credentials"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25"
                  >
                    <AppIcon
                      icon={faXmark}
                    />
                  </button>
                </div>
              </header>

              <main className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 sm:p-8">
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
                  <AppIcon
                    icon={
                      faTriangleExclamation
                    }
                    className="mt-1 shrink-0"
                  />

                  <p>
                    The previous password no
                    longer works. Copy these
                    credentials before closing
                    this window. The temporary
                    password will not be shown
                    again.
                  </p>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                      <AppIcon
                        icon={faIdCard}
                        className="text-indigo-700"
                      />

                      Staff Code
                    </label>

                    <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
                      <div className="min-w-0 flex-1 break-all px-4 py-3.5 font-mono text-sm font-bold tracking-wider text-slate-900 sm:text-base">
                        {
                          credentials.staffCode
                        }
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            credentials.staffCode,
                            "staff-code"
                          )
                        }
                        className="inline-flex items-center gap-2 border-l border-slate-300 px-4 font-bold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        <AppIcon
                          icon={
                            copiedField ===
                            "staff-code"
                              ? faCheck
                              : faCopy
                          }
                        />

                        <span className="hidden sm:inline">
                          {copiedField ===
                          "staff-code"
                            ? "Copied"
                            : "Copy"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                      <AppIcon
                        icon={faKey}
                        className="text-indigo-700"
                      />

                      Temporary Password
                    </label>

                    <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-300 bg-slate-50">
                      <div className="min-w-0 flex-1 break-all px-4 py-3.5 font-mono text-sm font-bold tracking-wider text-slate-900 sm:text-base">
                        {showPassword
                          ? credentials.temporaryPassword
                          : "••••••••••••••••"}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) =>
                              !current
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide temporary password"
                            : "Show temporary password"
                        }
                        className="border-l border-slate-300 px-4 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-700"
                      >
                        <AppIcon
                          icon={
                            showPassword
                              ? faEyeSlash
                              : faEye
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            credentials.temporaryPassword,
                            "password"
                          )
                        }
                        className="inline-flex items-center gap-2 border-l border-slate-300 px-4 font-bold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        <AppIcon
                          icon={
                            copiedField ===
                            "password"
                              ? faCheck
                              : faCopy
                          }
                        />

                        <span className="hidden sm:inline">
                          {copiedField ===
                          "password"
                            ? "Copied"
                            : "Copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </div>
                )}
              </main>

              <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      credentialsText,
                      "both"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-700 bg-white px-6 py-3 font-bold text-indigo-700 transition hover:bg-indigo-50"
                >
                  <AppIcon
                    icon={
                      copiedField ===
                      "both"
                        ? faCheck
                        : faClipboard
                    }
                  />

                  {copiedField ===
                  "both"
                    ? "Credentials Copied"
                    : "Copy Both Credentials"}
                </button>

                <button
                  type="button"
                  onClick={
                    closeCredentials
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-6 py-3 font-bold text-white transition hover:bg-indigo-800"
                >
                  <AppIcon
                    icon={faCheck}
                  />

                  Done
                </button>
              </footer>
            </section>
          </div>,
          document.body
        )}
    </>
  );
}