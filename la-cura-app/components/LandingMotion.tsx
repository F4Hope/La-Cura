"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  IconDefinition,
} from "@fortawesome/fontawesome-svg-core";

import {
  faChartLine,
  faCircleCheck,
  faClock,
  faHeartPulse,
  faLaptopMedical,
  faPills,
  faShieldHalved,
  faUserNurse,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type ClinicalTab = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: IconDefinition;
  points: string[];
  preview: {
    title: string;
    primary: string;
    secondary: string;
    tertiary: string;
  };
};

const clinicalTabs: ClinicalTab[] = [
  {
    id: "residents",
    label: "Residents",
    eyebrow: "Resident Records",
    title: "One clear view of every resident",
    description:
      "Keep demographics, diagnoses, allergies, clinical history, medications, vitals, and care information connected in one organized resident chart.",
    icon: faUsers,
    points: [
      "Resident profiles and clinical summaries",
      "Latest vitals and medication history",
      "Fast access to nursing documentation",
    ],
    preview: {
      title: "Resident Overview",
      primary: "John M.",
      secondary: "Room 204",
      tertiary: "Stable",
    },
  },
  {
    id: "medications",
    label: "Medications",
    eyebrow: "Medication Management",
    title: "Medication workflows built for safer care",
    description:
      "Give care teams a clearer medication workflow with medication records, administration history, staff attribution, and resident-specific information.",
    icon: faPills,
    points: [
      "Medication orders and administration",
      "Given, held, and refused documentation",
      "Resident medication history",
    ],
    preview: {
      title: "Medication Due",
      primary: "Lisinopril",
      secondary: "10 mg • Oral",
      tertiary: "08:00",
    },
  },
  {
    id: "vitals",
    label: "Vitals",
    eyebrow: "Clinical Monitoring",
    title: "Capture vital signs without slowing down care",
    description:
      "Document observations quickly while keeping the correct resident attached to the record and making recent measurements easy to review.",
    icon: faHeartPulse,
    points: [
      "Blood pressure and pulse",
      "Temperature and oxygen saturation",
      "Pain score and clinical observations",
    ],
    preview: {
      title: "Latest Vitals",
      primary: "118 / 76",
      secondary: "BP • 76 bpm",
      tertiary: "SpO₂ 98%",
    },
  },
  {
    id: "nursing",
    label: "Nursing Notes",
    eyebrow: "Clinical Documentation",
    title: "Structured nursing documentation",
    description:
      "Document resident status, observations, assessment, and interventions through a focused clinical workflow designed for everyday nursing use.",
    icon: faUserNurse,
    points: [
      "SOAP nursing documentation",
      "Staff attribution",
      "Resident-linked clinical timeline",
    ],
    preview: {
      title: "Nursing Note",
      primary: "SOAP",
      secondary: "Assessment documented",
      tertiary: "Saved by Nurse",
    },
  },
  {
    id: "coordination",
    label: "Care Coordination",
    eyebrow: "Connected Care",
    title: "Keep the care team on the same page",
    description:
      "Bring together clinical information, appointments, care plans, alerts, and resident activity so staff can make better-informed decisions.",
    icon: faLaptopMedical,
    points: [
      "Clinical alerts and recent activity",
      "Appointments and care plans",
      "Role-based staff access",
    ],
    preview: {
      title: "Care Status",
      primary: "Care Plan",
      secondary: "Team coordinated",
      tertiary: "Up to date",
    },
  },
];

const floatingIcons: Array<{
  icon: IconDefinition;
  className: string;
  delay: string;
  duration: string;
}> = [
  {
    icon: faHeartPulse,
    className:
      "left-[6%] top-[18%]",
    delay: "0s",
    duration: "7s",
  },
  {
    icon: faPills,
    className:
      "left-[18%] top-[66%]",
    delay: "1.4s",
    duration: "8.5s",
  },
  {
    icon: faUserNurse,
    className:
      "right-[13%] top-[16%]",
    delay: "0.8s",
    duration: "9s",
  },
  {
    icon: faChartLine,
    className:
      "right-[4%] top-[58%]",
    delay: "2s",
    duration: "7.5s",
  },
  {
    icon: faShieldHalved,
    className:
      "right-[28%] top-[76%]",
    delay: "1.1s",
    duration: "10s",
  },
];

export function HeroFloatingIcons() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] hidden overflow-hidden lg:block"
    >
      {floatingIcons.map(
        (
          item,
          index
        ) => (
          <div
            key={index}
            className={`landing-floating-icon absolute flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-green-700 shadow-lg shadow-green-950/10 backdrop-blur-md ${item.className}`}
            style={{
              animationDelay:
                item.delay,
              animationDuration:
                item.duration,
            }}
          >
            <AppIcon
              icon={item.icon}
              className="text-xl"
            />
          </div>
        )
      )}

      <div className="landing-float-dot absolute left-[11%] top-[42%] h-3 w-3 rounded-full bg-green-500/40" />

      <div className="landing-float-dot landing-delay-2 absolute right-[20%] top-[43%] h-2 w-2 rounded-full bg-green-700/30" />

      <div className="landing-float-dot landing-delay-3 absolute bottom-[13%] left-[41%] h-2.5 w-2.5 rounded-full bg-green-600/30" />

      <style jsx>{`
        @keyframes landingFloat {
          0%,
          100% {
            transform: translate3d(
                0,
                0,
                0
              )
              rotate(-2deg);
          }

          50% {
            transform: translate3d(
                0,
                -18px,
                0
              )
              rotate(2deg);
          }
        }

        @keyframes landingDot {
          0%,
          100% {
            transform: translateY(
              0
            );
            opacity: 0.3;
          }

          50% {
            transform: translateY(
              -14px
            );
            opacity: 0.7;
          }
        }

        .landing-floating-icon {
          animation-name: landingFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        .landing-float-dot {
          animation: landingDot
            6s ease-in-out
            infinite;
        }

        .landing-delay-2 {
          animation-delay: 1.5s;
        }

        .landing-delay-3 {
          animation-delay: 2.8s;
        }

        @media
          (prefers-reduced-motion: reduce) {
          .landing-floating-icon,
          .landing-float-dot {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export function ClinicalWorkspaceTabs() {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    clinicalTabs[0].id
  );

  const [
    autoRotate,
    setAutoRotate,
  ] = useState(true);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (mediaQuery.matches) {
      setAutoRotate(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRotate) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setActiveTab(
            (current) => {
              const currentIndex =
                clinicalTabs.findIndex(
                  (tab) =>
                    tab.id ===
                    current
                );

              const nextIndex =
                (currentIndex + 1) %
                clinicalTabs.length;

              return clinicalTabs[
                nextIndex
              ].id;
            }
          );
        },
        5000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [autoRotate]);

  const selectedTab =
    useMemo(
      () =>
        clinicalTabs.find(
          (tab) =>
            tab.id ===
            activeTab
        ) ?? clinicalTabs[0],
      [activeTab]
    );

  function selectTab(
    tabId: string
  ) {
    setActiveTab(tabId);

    /*
     * Once a visitor actively chooses
     * a tab, stop automatic rotation.
     * This prevents the UI from
     * changing while they are reading.
     */
    setAutoRotate(false);
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white lg:py-28">
      <div
        aria-hidden="true"
        className="absolute -left-36 top-24 h-96 w-96 rounded-full bg-green-700/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-36 bottom-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300">
            <AppIcon
              icon={
                faLaptopMedical
              }
            />

            La-Cura Clinical Workspace
          </div>

          <h2 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
            Built around the way care
            teams actually work
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Move between resident care
            workflows without losing
            context. Select a clinical
            area below to see how
            La-Cura organizes everyday
            care.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="La-Cura clinical workspace"
          className="mt-12 flex gap-2 overflow-x-auto border-b border-white/10 pb-px"
        >
          {clinicalTabs.map(
            (tab) => {
              const active =
                tab.id ===
                selectedTab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={
                    active
                  }
                  onClick={() =>
                    selectTab(
                      tab.id
                    )
                  }
                  className={`relative flex shrink-0 items-center gap-2 px-4 py-4 text-sm font-semibold transition ${
                    active
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <AppIcon
                    icon={tab.icon}
                    className={
                      active
                        ? "text-green-400"
                        : ""
                    }
                  />

                  {tab.label}

                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-green-400" />
                  )}
                </button>
              );
            }
          )}
        </div>

        <div
          key={
            selectedTab.id
          }
          className="landing-tab-enter mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-center"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-400">
              {
                selectedTab.eyebrow
              }
            </p>

            <h3 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              {
                selectedTab.title
              }
            </h3>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              {
                selectedTab.description
              }
            </p>

            <div className="mt-8 space-y-4">
              {selectedTab.points.map(
                (point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                      <AppIcon
                        icon={
                          faCircleCheck
                        }
                        className="text-xs"
                      />
                    </div>

                    <p className="text-slate-200">
                      {point}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-green-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Clinical workspace
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {
                      selectedTab.preview
                        .title
                    }
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  Live
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl bg-gradient-to-r from-green-800 via-green-700 to-green-600 p-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-green-100">
                        {
                          selectedTab.preview
                            .secondary
                        }
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        {
                          selectedTab.preview
                            .primary
                        }
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <AppIcon
                        icon={
                          selectedTab.icon
                        }
                        className="text-2xl"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
                    <span className="text-green-100">
                      Current status
                    </span>

                    <span className="font-semibold">
                      {
                        selectedTab.preview
                          .tertiary
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <PreviewCard
                    icon={
                      faClock
                    }
                    label="Updated"
                    value="Just now"
                  />

                  <PreviewCard
                    icon={
                      faShieldHalved
                    }
                    label="Access"
                    value="Role protected"
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Care activity
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        Documentation
                        synchronized
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <AppIcon
                        icon={
                          faChartLine
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex h-16 items-end gap-2">
                    {[
                      46,
                      67,
                      52,
                      81,
                      63,
                      92,
                      74,
                      100,
                    ].map(
                      (
                        height,
                        index
                      ) => (
                        <div
                          key={index}
                          className="landing-bar-grow flex-1 rounded-t bg-green-600/80"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${index * 80}ms`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-9 flex items-center gap-2">
          {clinicalTabs.map(
            (tab) => (
              <button
                key={tab.id}
                type="button"
                aria-label={`Show ${tab.label}`}
                onClick={() =>
                  selectTab(
                    tab.id
                  )
                }
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  tab.id ===
                  selectedTab.id
                    ? "w-10 bg-green-400"
                    : "w-4 bg-white/20 hover:bg-white/40"
                }`}
              />
            )
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes tabEnter {
          from {
            opacity: 0;
            transform: translateY(
              14px
            );
          }

          to {
            opacity: 1;
            transform: translateY(
              0
            );
          }
        }

        @keyframes barGrow {
          from {
            transform: scaleY(
              0
            );
          }

          to {
            transform: scaleY(
              1
            );
          }
        }

        .landing-tab-enter {
          animation: tabEnter
            420ms ease-out both;
        }

        .landing-bar-grow {
          transform-origin: bottom;
          animation: barGrow
            550ms ease-out both;
        }

        @media
          (prefers-reduced-motion: reduce) {
          .landing-tab-enter,
          .landing-bar-grow {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

type PreviewCardProps = {
  icon: IconDefinition;
  label: string;
  value: string;
};

function PreviewCard({
  icon,
  label,
  value,
}: PreviewCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <AppIcon
          icon={icon}
          className="text-xs"
        />

        <p className="text-xs font-medium">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}