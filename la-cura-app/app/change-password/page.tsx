"use client";

import type {
  FormEvent,
} from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  supabase,
} from "@/lib/supabase/client";


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
  const router =
    useRouter();

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

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

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    let active = true;

    async function verifySession() {
      const {
        data:
          sessionData,
        error:
          sessionError,
      } =
        await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (
        sessionError ||
        !sessionData.session
      ) {
        router.replace(
          "/login"
        );

        return;
      }

      setCheckingSession(
        false
      );
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, [
    router,
  ]);


  const requirements =
    useMemo<
      PasswordRequirement[]
    >(
      () => [
        {
          label:
            "At least 12 characters",
          satisfied:
            newPassword.length >=
            12,
        },
        {
          label:
            "At least one uppercase letter",
          satisfied:
            /[A-Z]/.test(
              newPassword
            ),
        },
        {
          label:
            "At least one lowercase letter",
          satisfied:
            /[a-z]/.test(
              newPassword
            ),
        },
        {
          label:
            "At least one number",
          satisfied:
            /[0-9]/.test(
              newPassword
            ),
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
          label:
            "No spaces",
          satisfied:
            newPassword.length >
              0 &&
            !/\s/.test(
              newPassword
            ),
        },
      ],
      [
        newPassword,
      ]
    );


  const passwordIsValid =
    requirements.every(
      (requirement) =>
        requirement.satisfied
    ) &&
    newPassword.length <=
      128;


  const passwordsMatch =
    confirmPassword.length >
      0 &&
    newPassword ===
      confirmPassword;


  const canSubmit =
    passwordIsValid &&
    passwordsMatch &&
    !loading &&
    !success;


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data:
          sessionData,
        error:
          sessionError,
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


      const response =
        await fetch(
          "/api/auth/change-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body:
              JSON.stringify({
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


      window.setTimeout(
        () => {
          router.replace(
            "/login"
          );

          router.refresh();
        },
        1800
      );
    } catch (
      caughtError
    ) {
      console.error(
        "Password change failed:",
        caughtError
      );

      setError(
        caughtError instanceof
        Error
          ? caughtError.message
          : "Unable to change your password."
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleSignOut() {
    await supabase.auth.signOut();

    router.replace(
      "/login"
    );

    router.refresh();
  }


  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F2ED]">
        <div className="border border-[#CBD5D0] bg-white px-10 py-8 text-center">
          <LoaderCircle
            size={22}
            className="mx-auto animate-spin text-[#073B2F]"
          />

          <p className="mt-3 text-[11px] font-semibold text-[#52645C]">
            Verifying your account...
          </p>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#F3F2ED] text-[#1B2924]">
      <header className="border-t-[4px] border-[#D5A437] bg-[#073B2F] text-white">
        <div className="mx-auto max-w-[1100px] px-5 py-5 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#C9D9D2]">
            La-Cura Account Security
          </p>

          <h1 className="mt-1 text-[24px] font-bold tracking-[-0.025em]">
            Change Password
          </h1>

          <p className="mt-1 text-[11px] text-[#D8E4DE]">
            Set a private password for your authenticated staff account.
          </p>
        </div>
      </header>


      <div className="mx-auto max-w-[1100px] p-4 sm:p-6">
        <section className="border border-[#C8D2CD] bg-white">
          {success ? (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2
                  size={21}
                />
              </span>

              <h2 className="mt-4 text-[18px] font-bold text-[#183129]">
                Password Changed
              </h2>

              <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-[#65766E]">
                Your new password is active. La-Cura is signing you out so you can authenticate again with the new password.
              </p>

              <LoaderCircle
                size={17}
                className="mx-auto mt-4 animate-spin text-[#073B2F]"
              />
            </div>
          ) : (
            <>
              <div className="border-b border-[#D3DCD7] bg-[#E7EDE9] px-4 py-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={14}
                    className="text-[#073B2F]"
                  />

                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
                      Password Security
                    </h2>

                    <p className="mt-0.5 text-[9px] text-[#718078]">
                      Do not share your password with administrators or other staff members.
                    </p>
                  </div>
                </div>
              </div>


              <form
                onSubmit={
                  handleSubmit
                }
                className="grid lg:grid-cols-[minmax(0,1fr)_330px]"
              >
                <div className="border-b border-[#D8DFDB] p-4 lg:border-b-0 lg:border-r">
                  <div className="max-w-xl space-y-4">
                    <PasswordField
                      id="new-password"
                      label="New Password"
                      value={
                        newPassword
                      }
                      show={
                        showNewPassword
                      }
                      onToggle={() =>
                        setShowNewPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      onChange={(
                        value
                      ) => {
                        setNewPassword(
                          value
                        );

                        setError("");
                      }}
                      disabled={
                        loading
                      }
                    />


                    <PasswordField
                      id="confirm-password"
                      label="Confirm New Password"
                      value={
                        confirmPassword
                      }
                      show={
                        showConfirmPassword
                      }
                      onToggle={() =>
                        setShowConfirmPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      onChange={(
                        value
                      ) => {
                        setConfirmPassword(
                          value
                        );

                        setError("");
                      }}
                      disabled={
                        loading
                      }
                    />


                    {confirmPassword &&
                      !passwordsMatch && (
                        <div className="border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
                          The passwords do not match.
                        </div>
                      )}


                    {error && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-semibold text-red-700"
                      >
                        <TriangleAlert
                          size={13}
                          className="mt-0.5 shrink-0"
                        />

                        <span>
                          {error}
                        </span>
                      </div>
                    )}


                    <div className="flex flex-col gap-1.5 border-t border-[#E0E6E3] pt-4 sm:flex-row">
                      <button
                        type="submit"
                        disabled={
                          !canSubmit
                        }
                        className="
                          inline-flex h-9
                          flex-1
                          items-center
                          justify-center
                          gap-2 border
                          border-[#063428]
                          bg-[#073B2F]
                          px-4
                          text-[10px]
                          font-bold
                          text-white
                          hover:bg-[#0D4A3A]
                          disabled:cursor-not-allowed
                          disabled:opacity-45
                        "
                      >
                        {loading ? (
                          <LoaderCircle
                            size={13}
                            className="animate-spin"
                          />
                        ) : (
                          <KeyRound
                            size={13}
                          />
                        )}

                        {loading
                          ? "Changing Password..."
                          : "Change Password"}
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          void handleSignOut()
                        }
                        disabled={
                          loading
                        }
                        className="
                          inline-flex h-9
                          items-center
                          justify-center
                          gap-2 border
                          border-[#B8C3BD]
                          bg-white
                          px-4
                          text-[10px]
                          font-bold
                          text-[#40544B]
                          hover:bg-[#F3F4F2]
                          disabled:opacity-50
                        "
                      >
                        <LogOut
                          size={12}
                        />

                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>


                <aside className="bg-[#FBFAF7] p-4">
                  <div className="flex items-center gap-2 border-b border-[#D8DFDB] pb-2">
                    <LockKeyhole
                      size={14}
                      className="text-[#073B2F]"
                    />

                    <h2 className="text-[11px] font-bold text-[#30443B]">
                      Password Requirements
                    </h2>
                  </div>


                  <div className="mt-3 space-y-2">
                    {requirements.map(
                      (
                        requirement
                      ) => (
                        <div
                          key={
                            requirement.label
                          }
                          className="flex items-start gap-2"
                        >
                          <span
                            className={`
                              mt-0.5 flex h-4 w-4
                              shrink-0 items-center
                              justify-center border

                              ${
                                requirement.satisfied
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-[#CDD6D1] bg-white text-[#89968F]"
                              }
                            `}
                          >
                            {requirement.satisfied ? (
                              <Check
                                size={9}
                              />
                            ) : (
                              <LockKeyhole
                                size={8}
                              />
                            )}
                          </span>

                          <span
                            className={`
                              text-[10px]
                              leading-4

                              ${
                                requirement.satisfied
                                  ? "font-semibold text-emerald-700"
                                  : "text-[#65766E]"
                              }
                            `}
                          >
                            {
                              requirement.label
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>


                  <div className="mt-4 border-t border-[#D8DFDB] pt-3">
                    <p className="text-[9px] leading-4 text-[#77857E]">
                      Changing your password signs this session out after the password update succeeds.
                    </p>
                  </div>
                </aside>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}


function PasswordField({
  id,
  label,
  value,
  show,
  onToggle,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;

  onChange:
    (
      value: string
    ) => void;

  disabled: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="block"
    >
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.03em] text-[#4D6158]">
        {label}
      </span>

      <div className="relative">
        <KeyRound
          size={13}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8982]"
        />

        <input
          id={id}
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          autoComplete="new-password"
          disabled={
            disabled
          }
          placeholder="Enter your new private password"
          className="
            h-10 w-full
            border
            border-[#BFCAC4]
            bg-white
            pl-9 pr-10
            text-[11px]
            text-[#24382F]
            outline-none
            placeholder:text-[#8A9791]
            focus:border-[#667E72]
            focus:ring-1
            focus:ring-[#667E72]/20
            disabled:bg-[#F3F4F2]
          "
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          disabled={
            disabled
          }
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#677870] hover:text-[#073B2F] disabled:opacity-50"
        >
          {show ? (
            <EyeOff
              size={13}
            />
          ) : (
            <Eye
              size={13}
            />
          )}
        </button>
      </div>
    </label>
  );
}
