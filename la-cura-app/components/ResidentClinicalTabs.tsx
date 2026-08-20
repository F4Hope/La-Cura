"use client";

import Link from "next/link";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  residentText,
  type ResidentTextKey,
} from "@/lib/i18n/resident";


export type ResidentTabKey =
  | "dash"
  | "profile"
  | "census"
  | "med-diag"
  | "allergies"
  | "immun"
  | "orders"
  | "vitals"
  | "results"
  | "mds"
  | "assmnts"
  | "therapy"
  | "prog-notes"
  | "care-plan"
  | "tasks"
  | "misc";


type ResidentTab = {
  key: ResidentTabKey;
  labelKey: ResidentTextKey;
};


const tabs: ResidentTab[] = [
  {
    key: "dash",
    labelKey: "tab.dash",
  },
  {
    key: "profile",
    labelKey: "tab.profile",
  },
  {
    key: "census",
    labelKey: "tab.census",
  },
  {
    key: "med-diag",
    labelKey: "tab.medDiag",
  },
  {
    key: "allergies",
    labelKey: "tab.allergies",
  },
  {
    key: "immun",
    labelKey: "tab.immun",
  },
  {
    key: "orders",
    labelKey: "tab.orders",
  },
  {
    key: "vitals",
    labelKey: "tab.vitals",
  },
  {
    key: "results",
    labelKey: "tab.results",
  },
  {
    key: "mds",
    labelKey: "tab.mds",
  },
  {
    key: "assmnts",
    labelKey: "tab.assmnts",
  },
  {
    key: "therapy",
    labelKey: "tab.therapy",
  },
  {
    key: "prog-notes",
    labelKey: "tab.progNotes",
  },
  {
    key: "care-plan",
    labelKey: "tab.carePlan",
  },
  {
    key: "tasks",
    labelKey: "tab.tasks",
  },
  {
    key: "misc",
    labelKey: "tab.misc",
  },
];


const validTabs =
  new Set<ResidentTabKey>(
    tabs.map(
      (tab) =>
        tab.key
    )
  );


export function normalizeResidentTab(
  value: unknown
): ResidentTabKey {
  const raw =
    Array.isArray(value)
      ? value[0]
      : value;

  if (
    typeof raw === "string" &&
    validTabs.has(
      raw as ResidentTabKey
    )
  ) {
    return raw as ResidentTabKey;
  }

  return "dash";
}


type Props = {
  residentId: number;
  activeTab: ResidentTabKey;
};


export default function ResidentClinicalTabs({
  residentId,
  activeTab,
}: Props) {
  const {
    language,
  } = useLanguage();

  return (
    <nav
      aria-label={residentText(
        language,
        "tabs.aria"
      )}
      className="pcc-resident-tabs"
    >
      <div className="pcc-resident-tabs-scroll">
        {tabs.map((tab) => {
          const active =
            activeTab ===
            tab.key;

          const href =
            tab.key === "dash"
              ? `/residents/${residentId}`
              : `/residents/${residentId}?tab=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={
                active
                  ? "pcc-resident-tab pcc-resident-tab-active"
                  : "pcc-resident-tab"
              }
            >
              {residentText(
                language,
                tab.labelKey
              )}
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        .pcc-resident-tabs {
          width: 100%;
          overflow: hidden;
          border-top: 1px solid #b8bdb9;
          border-bottom: 1px solid #aeb4af;
          background: #dfe1dc;
        }

        .pcc-resident-tabs-scroll {
          display: flex;
          align-items: stretch;
          min-width: max-content;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #aab0ab #e7e8e4;
        }

        .pcc-resident-tab {
          position: relative;
          display: inline-flex;
          height: 29px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          padding: 0 10px;

          border-right: 1px solid #b9bebb;

          background:
            linear-gradient(
              to bottom,
              #f7f7f5 0%,
              #e9eae6 100%
            ) !important;

          color: #303733 !important;

          font-family:
            var(--font-la-cura-sans),
            Arial,
            Helvetica,
            sans-serif !important;

          font-size: 10px !important;
          font-weight: 600 !important;
          line-height: 1 !important;
          letter-spacing: 0 !important;
          text-transform: none !important;
          white-space: nowrap;

          filter: none !important;
          box-shadow:
            inset 0 1px 0
              rgba(255,255,255,0.85) !important;

          transition:
            background-color 100ms ease,
            color 100ms ease !important;
        }

        .pcc-resident-tab:hover {
          background:
            #ffffff !important;

          color:
            #073b2f !important;
        }

        .pcc-resident-tab-active {
          background:
            linear-gradient(
              to bottom,
              #778537 0%,
              #68772f 100%
            ) !important;

          color:
            #ffffff !important;

          font-weight:
            700 !important;

          border-right-color:
            #596728 !important;

          box-shadow:
            inset 0 1px 0
              rgba(255,255,255,0.17),
            inset 0 -2px 0
              #526023 !important;
        }

        .pcc-resident-tab-active:hover {
          background:
            #6d7c31 !important;

          color:
            #ffffff !important;
        }

        @media (max-width: 900px) {
          .pcc-resident-tab {
            height: 31px;
            padding:
              0 9px;
          }
        }
      `}</style>
    </nav>
  );
}
