import Link from "next/link";

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
  label: string;
};

const tabs: ResidentTab[] = [
  {
    key: "dash",
    label: "DASH",
  },
  {
    key: "profile",
    label: "PROFILE",
  },
  {
    key: "census",
    label: "CENSUS",
  },
  {
    key: "med-diag",
    label: "MED DIAG",
  },
  {
    key: "allergies",
    label: "ALLERGIES",
  },
  {
    key: "immun",
    label: "IMMUN",
  },
  {
    key: "orders",
    label: "ORDERS",
  },
  {
    key: "vitals",
    label: "WTS/VITALS",
  },
  {
    key: "results",
    label: "RESULTS",
  },
  {
    key: "mds",
    label: "MDS",
  },
  {
    key: "assmnts",
    label: "ASSMNTS",
  },
  {
    key: "therapy",
    label: "THERAPY",
  },
  {
    key: "prog-notes",
    label: "PROG NOTES",
  },
  {
    key: "care-plan",
    label: "CARE PLAN",
  },
  {
    key: "tasks",
    label: "TASKS",
  },
  {
    key: "misc",
    label: "MISC",
  },
];

const validTabs =
  new Set<ResidentTabKey>(
    tabs.map((tab) => tab.key)
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
  return (
    <nav
      aria-label="Resident clinical record"
      className="
        border-b border-[#C9D3CE]
        bg-[#F8F7F2]
      "
    >
      <div className="overflow-x-auto">
        <div
          className="
            flex min-w-max
            items-stretch
            px-2
            lg:px-3
          "
        >
          {tabs.map((tab) => {
            const active =
              activeTab === tab.key;

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
                className={`
                  relative flex h-[38px]
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
                {tab.label}

                {active && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0 left-0
                      h-[3px] w-full
                      bg-[#D5A437]
                    "
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
