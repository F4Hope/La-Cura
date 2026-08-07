"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  faBan,
  faShieldHalved,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import {
  normalizeStaffRole,
  useStaffSession,
} from "@/components/StaffSessionProvider";

type Props = {
  allow: string[];
  children: ReactNode;
};

type SupportedRole =
  | "administrator"
  | "nurse"
  | "physician";

type RoutePermission = {
  path: string;
  roles: SupportedRole[];
};

const ALL_CLINICAL_ROLES: SupportedRole[] = [
  "administrator",
  "nurse",
  "physician",
];

const ADMIN_ONLY: SupportedRole[] = [
  "administrator",
];

const ADMIN_AND_NURSE: SupportedRole[] = [
  "administrator",
  "nurse",
];

const ROUTE_PERMISSIONS: RoutePermission[] = [
  /*
   * Administrator-only areas
   */
  {
    path: "/staff",
    roles: ADMIN_ONLY,
  },

  {
    path: "/reports",
    roles: ADMIN_ONLY,
  },

  {
    path: "/settings",
    roles: ADMIN_ONLY,
  },

  {
    path: "/add-resident",
    roles: ADMIN_ONLY,
  },

  /*
   * Nursing / medication workflows
   */
  {
    path: "/add-medication",
    roles: ADMIN_AND_NURSE,
  },

  {
    path: "/add-nursing-note",
    roles: ADMIN_AND_NURSE,
  },

  {
    path: "/add-incident-report",
    roles: ADMIN_AND_NURSE,
  },

  {
    path: "/medication-administration",
    roles: ADMIN_AND_NURSE,
  },

  {
    path: "/medications",
    roles: ADMIN_AND_NURSE,
  },

  /*
   * Vitals may be recorded by any
   * authorized clinical role.
   */
  {
    path: "/add-vitals",
    roles: ALL_CLINICAL_ROLES,
  },

  /*
   * Physician workflows
   */
  {
    path: "/care-plans",
    roles: [
      "administrator",
      "physician",
    ],
  },

  /*
   * Shared clinical areas
   */
  {
    path: "/appointments",
    roles: ALL_CLINICAL_ROLES,
  },

  {
    path: "/residents",
    roles: ALL_CLINICAL_ROLES,
  },

  {
    path: "/dashboard",
    roles: ALL_CLINICAL_ROLES,
  },
];

function isPathMatch(
  pathname: string,
  routePath: string
): boolean {
  return (
    pathname === routePath ||
    pathname.startsWith(
      `${routePath}/`
    )
  );
}

function normalizeToSupportedRole(
  role:
    | string
    | null
    | undefined
): SupportedRole | null {
  const normalized =
    normalizeStaffRole(role);

  if (
    normalized === "admin" ||
    normalized === "administrator"
  ) {
    return "administrator";
  }

  if (
    normalized === "nurse"
  ) {
    return "nurse";
  }

  if (
    normalized === "physician"
  ) {
    return "physician";
  }

  return null;
}

function normalizeAllowedRoles(
  roles: string[]
): SupportedRole[] {
  const normalized =
    roles
      .map((role) =>
        normalizeToSupportedRole(
          role
        )
      )
      .filter(
        (
          role
        ): role is SupportedRole =>
          role !== null
      );

  return [
    ...new Set(normalized),
  ];
}

function getAllowedRolesForPath(
  pathname: string,
  fallbackRoles: SupportedRole[]
): SupportedRole[] {
  const permission =
    ROUTE_PERMISSIONS.find(
      (rule) =>
        isPathMatch(
          pathname,
          rule.path
        )
    );

  if (permission) {
    return permission.roles;
  }

  return fallbackRoles;
}

function getSafeDestination(
  role: SupportedRole | null
): string {
  if (
    role === "administrator" ||
    role === "nurse" ||
    role === "physician"
  ) {
    return "/dashboard";
  }

  return "/login";
}

export default function RoleGuard({
  allow,
  children,
}: Props) {
  const pathname =
    usePathname();

  const {
    staff,
    status,
    error,
  } = useStaffSession();

  const currentRole =
    normalizeToSupportedRole(
      staff?.role
    );

  const fallbackRoles =
    normalizeAllowedRoles(
      allow
    );

  const allowedRoles =
    getAllowedRolesForPath(
      pathname,
      fallbackRoles
    );

  const mustChangePassword =
    staff?.must_change_password ===
    true;

  const accountInactive =
    staff?.active === false;

  const roleAllowed =
    currentRole !== null &&
    allowedRoles.includes(
      currentRole
    );

  useEffect(() => {
    if (
      status ===
      "unauthenticated"
    ) {
      window.location.replace(
        "/login"
      );

      return;
    }

    if (
      status !==
      "authenticated"
    ) {
      return;
    }

    if (
      mustChangePassword &&
      pathname !==
        "/change-password"
    ) {
      window.location.replace(
        "/change-password"
      );
    }
  }, [
    mustChangePassword,
    pathname,
    status,
  ]);

  if (
    status === "loading"
  ) {
    return (
      <AccessLoading
        message="Verifying staff access..."
      />
    );
  }

  if (
    status ===
    "unauthenticated"
  ) {
    return (
      <AccessLoading
        message="Redirecting to login..."
      />
    );
  }

  if (
    status === "error"
  ) {
    return (
      <AccessMessage
        type="error"
        title="Access Verification Failed"
        message={
          error ||
          "La-Cura could not verify your staff session."
        }
        actionLabel="Return to Login"
        actionHref="/login"
      />
    );
  }

  if (
    accountInactive
  ) {
    return (
      <AccessMessage
        type="denied"
        title="Account Inactive"
        message="This staff account is inactive. Contact an administrator."
        actionLabel="Return to Login"
        actionHref="/login"
      />
    );
  }

  if (
    mustChangePassword &&
    pathname !==
      "/change-password"
  ) {
    return (
      <AccessLoading
        message="Preparing password update..."
      />
    );
  }

  if (!currentRole) {
    return (
      <AccessMessage
        type="denied"
        title="Role Not Assigned"
        message="Your staff account does not have a recognized La-Cura role. Contact an administrator."
        actionLabel="Return to Login"
        actionHref="/login"
      />
    );
  }

  if (!roleAllowed) {
    return (
      <AccessMessage
        type="denied"
        title="Access Denied"
        message="Your staff role does not have permission to access this area of La-Cura."
        actionLabel="Return to Dashboard"
        actionHref={getSafeDestination(
          currentRole
        )}
      />
    );
  }

  return <>{children}</>;
}

type AccessLoadingProps = {
  message: string;
};

function AccessLoading({
  message,
}: AccessLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <AppIcon
            icon={faSpinner}
            className="text-2xl"
            spin
          />
        </div>

        <p className="mt-4 font-semibold text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}

type AccessMessageProps = {
  type: "denied" | "error";
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
};

function AccessMessage({
  type,
  title,
  message,
  actionLabel,
  actionHref,
}: AccessMessageProps) {
  const errorState =
    type === "error";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            errorState
              ? "bg-amber-100"
              : "bg-red-100"
          }`}
        >
          <AppIcon
            icon={
              errorState
                ? faShieldHalved
                : faBan
            }
            className={`text-4xl ${
              errorState
                ? "text-amber-700"
                : "text-red-700"
            }`}
          />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          {title}
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          {message}
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.replace(
              actionHref
            );
          }}
          className="mt-7 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
        >
          {actionLabel}
        </button>
      </section>
    </div>
  );
}