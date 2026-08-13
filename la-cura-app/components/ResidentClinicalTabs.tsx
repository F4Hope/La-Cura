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
  key:
    ResidentTabKey;

  labelKey:
    ResidentTextKey;
};


const tabs:
  ResidentTab[] = [
  {
    key: "dash",
    labelKey:
      "tab.dash",
  },

  {
    key: "profile",
    labelKey:
      "tab.profile",
  },

  {
    key: "census",
    labelKey:
      "tab.census",
  },

  {
    key: "med-diag",
    labelKey:
      "tab.medDiag",
  },

  {
    key: "allergies",
    labelKey:
      "tab.allergies",
  },

  {
    key: "immun",
    labelKey:
      "tab.immun",
  },

  {
    key: "orders",
    labelKey:
      "tab.orders",
  },

  {
    key: "vitals",
    labelKey:
      "tab.vitals",
  },

  {
    key: "results",
    labelKey:
      "tab.results",
  },

  {
    key: "mds",
    labelKey:
      "tab.mds",
  },

  {
    key: "assmnts",
    labelKey:
      "tab.assmnts",
  },

  {
    key: "therapy",
    labelKey:
      "tab.therapy",
  },

  {
    key: "prog-notes",
    labelKey:
      "tab.progNotes",
  },

  {
    key: "care-plan",
    labelKey:
      "tab.carePlan",
  },

  {
    key: "tasks",
    labelKey:
      "tab.tasks",
  },

  {
    key: "misc",
    labelKey:
      "tab.misc",
  },
];


const validTabs =
  new Set<ResidentTabKey>(
    tabs.map(
      (
        tab
      ) =>
        tab.key
    )
  );


export function normalizeResidentTab(
  value: unknown
): ResidentTabKey {
  const raw =
    Array.isArray(
      value
    )
      ? value[0]
      : value;


  if (
    typeof raw ===
      "string" &&
    validTabs.has(
      raw as
        ResidentTabKey
    )
  ) {
    return raw as
      ResidentTabKey;
  }


  return "dash";
}


type Props = {
  residentId:
    number;

  activeTab:
    ResidentTabKey;
};


export default function ResidentClinicalTabs({
  residentId,
  activeTab,
}: Props) {
  const {
    language,
  } =
    useLanguage();


  return (
    <nav
      aria-label={
        residentText(
          language,
          "tabs.aria"
        )
      }
      className="border-b border-[#C9D3CE] bg-[#F8F7F2]"
    >
      <div className="overflow-x-auto">
        <div className="flex min-w-max items-stretch px-2 lg:px-3">
          {tabs.map(
            (
              tab
            ) => {
              const active =
                activeTab ===
                tab.key;


              const href =
                tab.key ===
                "dash"
                  ? `/residents/${residentId}`
                  : `/residents/${residentId}?tab=${tab.key}`;


              return (
                <Link
                  key={
                    tab.key
                  }
                  href={
                    href
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`
                    relative flex
                    h-[38px]
                    items-center
                    whitespace-nowrap
                    border-r
                    border-[#D8DFDB]
                    px-3.5
                    text-[11px]
                    font-bold
                    tracking-[0.025em]
                    transition-colors

                    ${
                      active
                        ? "bg-white text-[#073B2F]"
                        : "text-[#40534C] hover:bg-white hover:text-[#073B2F]"
                    }
                  `}
                >
                  {residentText(
                    language,
                    tab.labelKey
                  )}

                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[3px] w-full bg-[#D5A437]"
                    />
                  )}
                </Link>
              );
            }
          )}
        </div>
      </div>
    </nav>
  );
}
