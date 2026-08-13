"use client";

import StaffLanguageSettings from "@/components/settings/StaffLanguageSettings";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  CheckCircle2,
  Database,
  KeyRound,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Server,
  ShieldCheck,
  UserCog,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  isAdministratorRole,
  useStaffSession,
} from "@/components/StaffSessionProvider";

import {
  getOffline,
  isOnline,
} from "@/lib/offline";

import {
  supabase,
} from "@/lib/supabase/client";


type DatabaseStatus =
  | "checking"
  | "connected"
  | "disconnected";


type AuthStatus =
  | "checking"
  | "authenticated"
  | "missing";


function cleanText(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function formatDateTime(
  value:
    | number
    | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value * 1000
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function getOfflineVitalCount() {
  try {
    const queued =
      getOffline(
        "vital_signs"
      );

    return Array.isArray(
      queued
    )
      ? queued.length
      : 0;
  } catch {
    return 0;
  }
}


export default function SettingsPage() {
  const router =
    useRouter();

  const {
    staff,
    status:
      staffSessionStatus,
    error:
      staffSessionError,
    refreshStaff,
  } = useStaffSession();


  const [
    online,
    setOnline,
  ] = useState(false);

  const [
    databaseStatus,
    setDatabaseStatus,
  ] =
    useState<DatabaseStatus>(
      "checking"
    );

  const [
    authStatus,
    setAuthStatus,
  ] =
    useState<AuthStatus>(
      "checking"
    );

  const [
    residentCount,
    setResidentCount,
  ] = useState<
    number | null
  >(null);

  const [
    offlineVitals,
    setOfflineVitals,
  ] = useState(0);

  const [
    sessionExpiresAt,
    setSessionExpiresAt,
  ] = useState<
    number | null
  >(null);

  const [
    lastChecked,
    setLastChecked,
  ] = useState<
    Date | null
  >(null);

  const [
    checking,
    setChecking,
  ] = useState(false);

  const [
    refreshingAccount,
    setRefreshingAccount,
  ] = useState(false);

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);


  const checkSystemStatus =
    useCallback(
      async () => {
        setChecking(true);

        setDatabaseStatus(
          "checking"
        );

        setAuthStatus(
          "checking"
        );

        setOnline(
          isOnline()
        );

        setOfflineVitals(
          getOfflineVitalCount()
        );

        try {
          const {
            data:
              sessionData,
            error:
              sessionError,
          } =
            await supabase.auth.getSession();

          if (
            sessionError ||
            !sessionData.session
          ) {
            setAuthStatus(
              "missing"
            );

            setSessionExpiresAt(
              null
            );
          } else {
            setAuthStatus(
              "authenticated"
            );

            setSessionExpiresAt(
              sessionData.session
                .expires_at ??
                null
            );
          }


          const {
            count,
            error,
          } =
            await supabase
              .from(
                "residents"
              )
              .select(
                "id",
                {
                  count:
                    "exact",
                  head: true,
                }
              );

          if (error) {
            setDatabaseStatus(
              "disconnected"
            );

            setResidentCount(
              null
            );
          } else {
            setDatabaseStatus(
              "connected"
            );

            setResidentCount(
              count ?? 0
            );
          }
        } catch (
          statusError
        ) {
          console.error(
            "Unable to check La-Cura system status:",
            statusError
          );

          setDatabaseStatus(
            "disconnected"
          );
        } finally {
          setLastChecked(
            new Date()
          );

          setChecking(false);
        }
      },
      []
    );


  useEffect(() => {
    function handleOnline() {
      setOnline(true);

      void checkSystemStatus();
    }


    function handleOffline() {
      setOnline(false);

      setDatabaseStatus(
        "disconnected"
      );

      setOfflineVitals(
        getOfflineVitalCount()
      );
    }


    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    void checkSystemStatus();


    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, [
    checkSystemStatus,
  ]);


  async function refreshAccount() {
    if (
      refreshingAccount
    ) {
      return;
    }

    setRefreshingAccount(
      true
    );

    try {
      await refreshStaff();
      await checkSystemStatus();
    } finally {
      setRefreshingAccount(
        false
      );
    }
  }


  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await supabase.auth.signOut();

      router.replace(
        "/login"
      );

      router.refresh();
    } finally {
      setSigningOut(
        false
      );
    }
  }


  const fullName =
    cleanText(
      staff?.full_name
    ) ||
    cleanText(
      staff?.name
    ) ||
    "Clinical Staff";


  const role =
    cleanText(
      staff?.role
    ) ||
    "Clinical Staff";


  const staffCode =
    cleanText(
      staff?.staff_code
    ) ||
    "—";


  const accountActive =
    staff?.active !==
    false;


  const administrator =
    isAdministratorRole(
      staff?.role
    );


  return (
    <div className="min-h-[calc(100vh-119px)] bg-[#F3F2ED] text-[#1B2924]">
      {/* PAGE HEADER */}

      <section className="border-b border-[#CCD5D0] bg-white">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-2 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[#72827B]">
              <Link
                href="/dashboard"
                className="hover:text-[#073B2F]"
              >
                Home
              </Link>

              <span>/</span>

              <span className="font-semibold text-[#40524B]">
                Settings
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#10231E]">
                Settings
              </h1>

              <p className="text-xs text-[#718078]">
                Account, access, connection, and system status
              </p>
            </div>
          </div>


          <button
            type="button"
            onClick={() =>
              void refreshAccount()
            }
            disabled={
              refreshingAccount
            }
            className="
              inline-flex h-8
              items-center
              justify-center
              gap-1.5 border
              border-[#AAB8B1]
              bg-white px-3
              text-[10px]
              font-bold
              text-[#30483E]
              hover:border-[#073B2F]
              hover:bg-[#F2F5F3]
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={12}
              className={
                refreshingAccount
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Account
          </button>
        </div>
      </section>


      <main className="mx-auto max-w-[1500px] p-3 sm:p-4 lg:px-6">
        <StaffLanguageSettings />
        {staffSessionError && (
          <div className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {
              staffSessionError
            }
          </div>
        )}


        {/* ==================================================
            MY ACCOUNT
            ================================================== */}

        <section className="border border-[#C8D2CD] bg-white">
          <SectionHeader
            title="My Account"
            description="Information from your authenticated La-Cura staff account"
          />


          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(330px,0.6fr)]">
            <div className="border-b border-[#D9E1DD] lg:border-b-0 lg:border-r">
              <div className="grid sm:grid-cols-2">
                <SettingValue
                  label="Staff Member"
                  value={
                    fullName
                  }
                  strong
                />

                <SettingValue
                  label="Staff Code"
                  value={
                    staffCode
                  }
                />

                <SettingValue
                  label="Role"
                  value={role}
                />

                <SettingValue
                  label="Account Status"
                  value={
                    accountActive
                      ? "Active"
                      : "Inactive"
                  }
                  status={
                    accountActive
                      ? "success"
                      : "danger"
                  }
                />

                <SettingValue
                  label="Password Status"
                  value={
                    staff
                      ?.must_change_password
                      ? "Password change required"
                      : "Current"
                  }
                  status={
                    staff
                      ?.must_change_password
                      ? "warning"
                      : "success"
                  }
                />

                <SettingValue
                  label="Authentication"
                  value={
                    authStatus ===
                    "authenticated"
                      ? "Authenticated"
                      : authStatus ===
                          "checking"
                        ? "Checking..."
                        : "No active session"
                  }
                  status={
                    authStatus ===
                    "authenticated"
                      ? "success"
                      : authStatus ===
                          "missing"
                        ? "danger"
                        : undefined
                  }
                />
              </div>
            </div>


            <div className="bg-[#FBFAF7] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#C9D4CE] bg-white text-[#073B2F]">
                  <UserRound
                    size={16}
                  />
                </span>

                <div>
                  <h2 className="text-[12px] font-bold text-[#30443B]">
                    Account Security
                  </h2>

                  <p className="mt-1 text-[10px] leading-5 text-[#718078]">
                    Password changes are processed through La-Cura&apos;s authenticated password endpoint.
                  </p>
                </div>
              </div>


              <div className="mt-4 grid gap-1.5">
                <Link
                  href="/change-password"
                  className="
                    inline-flex h-9
                    items-center
                    justify-center
                    gap-2 border
                    border-[#073B2F]
                    bg-[#073B2F]
                    px-3
                    text-[10px]
                    font-bold
                    text-white
                    hover:bg-[#0D4A3A]
                  "
                >
                  <KeyRound
                    size={13}
                  />

                  Change Password
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    void signOut()
                  }
                  disabled={
                    signingOut
                  }
                  className="
                    inline-flex h-9
                    items-center
                    justify-center
                    gap-2 border
                    border-[#B8C3BD]
                    bg-white
                    px-3
                    text-[10px]
                    font-bold
                    text-[#40544B]
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-700
                    disabled:opacity-50
                  "
                >
                  {signingOut ? (
                    <LoaderCircle
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut
                      size={13}
                    />
                  )}

                  {signingOut
                    ? "Signing Out..."
                    : "Sign Out"}
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            CONNECTION & SYSTEM
            ================================================== */}

        <section className="mt-3 border border-[#C8D2CD] bg-white">
          <SectionHeader
            title="Connection & System"
            description="Live status from this browser, the authenticated session, and Supabase"
            action={
              <button
                type="button"
                onClick={() =>
                  void checkSystemStatus()
                }
                disabled={
                  checking
                }
                className="
                  inline-flex h-7
                  items-center gap-1.5
                  border
                  border-[#A9B8B0]
                  bg-white px-2.5
                  text-[9px]
                  font-bold
                  text-[#40544B]
                  hover:border-[#073B2F]
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={10}
                  className={
                    checking
                      ? "animate-spin"
                      : ""
                  }
                />

                Check Now
              </button>
            }
          />


          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            <StatusPanel
              icon={
                online ? (
                  <Wifi
                    size={15}
                  />
                ) : (
                  <WifiOff
                    size={15}
                  />
                )
              }
              title="Network"
              value={
                online
                  ? "Online"
                  : "Offline"
              }
              detail="Browser network status"
              status={
                online
                  ? "success"
                  : "danger"
              }
            />

            <StatusPanel
              icon={
                <ShieldCheck
                  size={15}
                />
              }
              title="Session"
              value={
                authStatus ===
                "authenticated"
                  ? "Authenticated"
                  : authStatus ===
                      "checking"
                    ? "Checking..."
                    : "Unavailable"
              }
              detail={
                sessionExpiresAt
                  ? `Expires ${formatDateTime(
                      sessionExpiresAt
                    )}`
                  : "Authentication session"
              }
              status={
                authStatus ===
                "authenticated"
                  ? "success"
                  : authStatus ===
                      "missing"
                    ? "danger"
                    : "neutral"
              }
            />

            <StatusPanel
              icon={
                <Database
                  size={15}
                />
              }
              title="Database"
              value={
                databaseStatus ===
                "connected"
                  ? "Connected"
                  : databaseStatus ===
                      "checking"
                    ? "Checking..."
                    : "Unavailable"
              }
              detail={
                residentCount !==
                null
                  ? `${residentCount} resident record${
                      residentCount ===
                      1
                        ? ""
                        : "s"
                    } accessible`
                  : "Supabase connection"
              }
              status={
                databaseStatus ===
                "connected"
                  ? "success"
                  : databaseStatus ===
                      "disconnected"
                    ? "danger"
                    : "neutral"
              }
            />

            <StatusPanel
              icon={
                <Activity
                  size={15}
                />
              }
              title="Offline Vitals"
              value={String(
                offlineVitals
              )}
              detail={
                offlineVitals ===
                0
                  ? "No locally queued vital records"
                  : `${offlineVitals} local record${
                      offlineVitals ===
                      1
                        ? ""
                        : "s"
                    } waiting in this browser`
              }
              status={
                offlineVitals > 0
                  ? "warning"
                  : "success"
              }
            />
          </div>


          <div className="flex flex-col gap-2 border-t border-[#D9E1DD] bg-[#FBFAF7] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] text-[#75837C]">
              Last system check:{" "}
              <strong className="font-semibold text-[#4B5F56]">
                {lastChecked
                  ? new Intl.DateTimeFormat(
                      "en-US",
                      {
                        month:
                          "short",
                        day:
                          "numeric",
                        hour:
                          "numeric",
                        minute:
                          "2-digit",
                      }
                    ).format(
                      lastChecked
                    )
                  : "Not checked"}
              </strong>
            </p>

            {offlineVitals >
              0 && (
              <Link
                href="/add-vitals"
                className="text-[9px] font-bold text-[#073B2F] hover:underline"
              >
                Open Vital Signs
              </Link>
            )}
          </div>
        </section>


        {/* ==================================================
            ADMINISTRATION
            ================================================== */}

        {administrator && (
          <section className="mt-3 border border-[#C8D2CD] bg-white">
            <SectionHeader
              title="Administration"
              description="Real administrative functions available to your account"
            />


            <div className="grid md:grid-cols-2">
              <Link
                href="/staff"
                className="
                  flex items-start
                  gap-3 border-b
                  border-[#D9E1DD]
                  p-4
                  transition
                  hover:bg-[#FBFAF7]
                  md:border-b-0
                  md:border-r
                "
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#CBD5D0] bg-[#EEF3EF] text-[#073B2F]">
                  <UserCog
                    size={16}
                  />
                </span>

                <div>
                  <p className="text-[11px] font-bold text-[#30443B]">
                    Staff Management
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-[#718078]">
                    Create staff accounts, edit staff information, reset passwords, deactivate accounts, and reactivate staff.
                  </p>
                </div>
              </Link>


              <div className="flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#CBD5D0] bg-[#EEF3EF] text-[#073B2F]">
                  <Server
                    size={16}
                  />
                </span>

                <div>
                  <p className="text-[11px] font-bold text-[#30443B]">
                    System Configuration
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-[#718078]">
                    Facility-wide clinical policies are not exposed as editable settings until they have server-backed enforcement throughout La-Cura.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* SESSION ERROR */}

        {staffSessionStatus ===
          "error" && (
          <section className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            La-Cura could not verify the current staff account. Refresh the session or sign in again.
          </section>
        )}
      </main>
    </div>
  );
}


function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?:
    React.ReactNode;
}) {
  return (
    <div className="flex min-h-[36px] flex-col gap-1 border-b border-[#D3DCD7] bg-[#E7EDE9] px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.035em] text-[#30463C]">
          {title}
        </h2>

        <p className="mt-0.5 text-[9px] text-[#718078]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}


function SettingValue({
  label,
  value,
  strong = false,
  status,
}: {
  label: string;
  value: string;
  strong?: boolean;

  status?:
    | "success"
    | "warning"
    | "danger";
}) {
  const statusClass =
    status === "success"
      ? "text-emerald-700"
      : status ===
          "warning"
        ? "text-amber-700"
        : status ===
            "danger"
          ? "text-red-700"
          : strong
            ? "text-[#073B2F]"
            : "text-[#40544B]";


  return (
    <div className="border-b border-[#E0E6E3] px-3 py-3 sm:border-r sm:odd:border-r">
      <p className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#7A8982]">
        {label}
      </p>

      <p
        className={`mt-1 text-[11px] font-bold ${statusClass}`}
      >
        {value}
      </p>
    </div>
  );
}


function StatusPanel({
  icon,
  title,
  value,
  detail,
  status,
}: {
  icon:
    React.ReactNode;

  title: string;
  value: string;
  detail: string;

  status:
    | "success"
    | "warning"
    | "danger"
    | "neutral";
}) {
  const stateClass =
    status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status ===
          "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : status ===
            "danger"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-[#CCD5D0] bg-[#F4F6F4] text-[#65766E]";


  return (
    <div className="border-b border-[#D9E1DD] p-3 md:border-r xl:border-b-0 xl:last:border-r-0">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center border ${stateClass}`}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#75847D]">
            {title}
          </p>

          <p className="mt-0.5 text-[12px] font-bold text-[#30443B]">
            {value}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-[#74827B]">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}
