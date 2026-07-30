import {
  faCircleCheck,
  faClipboardCheck,
  faHeartPulse,
  faListCheck,
  faPills,
  faTriangleExclamation,
  faUserGear,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

import { getClinicalAlerts } from "@/lib/alerts";
import { getDashboardStats } from "@/lib/dashboardStats";
import {
  getRecentMedicationActivity,
  getRecentVitalActivity,
} from "@/lib/recentActivity";
import { getTodayTasks } from "@/lib/tasks";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const medicationActivity =
    await getRecentMedicationActivity();

  const vitalActivity =
    await getRecentVitalActivity();

  const alerts = await getClinicalAlerts();
  const tasks = await getTodayTasks();

  const cards = [
    {
      title: "Residents",
      value: stats.residents,
      href: "/residents",
      color: "bg-green-600",
      icon: faUsers,
    },
    {
      title: "Staff",
      value: stats.staff,
      href: "/staff",
      color: "bg-blue-600",
      icon: faUserGear,
    },
    {
      title: "Medications",
      value: stats.medications,
      href: "/medications",
      color: "bg-orange-500",
      icon: faPills,
    },
    {
      title: "Vital Signs",
      value: stats.vitals,
      href: "/add-vitals",
      color: "bg-red-500",
      icon: faHeartPulse,
    },
    {
      title: "Medication Passes",
      value: stats.medicationAdministration,
      href: "/medication-administration",
      color: "bg-purple-600",
      icon: faClipboardCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <WelcomeBanner />

        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900">
                Dashboard Overview
              </h2>

              <p className="mt-2 text-gray-500">
                Monitor residents, staff, and daily clinical
                activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                href={card.href}
                icon={card.icon}
                color={card.color}
              />
            ))}
          </div>
        </section>

        <div className="mb-10 grid gap-8 xl:grid-cols-2">
          <section className="overflow-hidden rounded-[30px] bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-200 px-8 py-6">
              <AppIcon
                icon={faListCheck}
                className="text-xl text-green-600"
              />

              <h2 className="text-2xl font-bold text-gray-900">
                Today&apos;s Tasks
              </h2>
            </div>

            {tasks.length === 0 ? (
              <div className="px-8 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                  <AppIcon
                    icon={faCircleCheck}
                    className="text-2xl text-green-700"
                  />
                </div>

                <p className="mt-4 font-bold text-green-700">
                  No outstanding tasks
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks.map((task: any, index: number) => (
                  <div
                    key={`${task.title}-${index}`}
                    className="flex items-center justify-between px-8 py-5 transition hover:bg-green-50"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        <AppIcon
                          icon={faCircleCheck}
                          className="text-green-700"
                        />
                      </div>

                      <span className="truncate font-medium text-gray-700">
                        {task.title}
                      </span>
                    </div>

                    <span className="ml-4 font-black text-green-700">
                      {task.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[30px] bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-gray-200 px-8 py-6">
              <AppIcon
                icon={faTriangleExclamation}
                className="text-xl text-red-500"
              />

              <h2 className="text-2xl font-bold text-gray-900">
                Clinical Alerts
              </h2>
            </div>

            {alerts.length === 0 ? (
              <div className="px-8 py-10">
                <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <AppIcon
                      icon={faCircleCheck}
                      className="text-lg text-green-700"
                    />
                  </div>

                  <div>
                    <p className="font-bold text-green-800">
                      No Clinical Alerts
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      No active clinical alerts require attention.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert: any, index: number) => (
                  <div
                    key={`${alert.type}-${index}`}
                    className="px-8 py-5 transition hover:bg-red-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                        <AppIcon
                          icon={faTriangleExclamation}
                          className="text-red-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-red-600">
                          {alert.type}
                        </div>

                        <div className="mt-1 font-semibold text-gray-900">
                          {alert.resident}
                        </div>

                        <div className="mt-2 text-gray-500">
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="overflow-hidden rounded-[30px] bg-white shadow-xl">
          <div className="border-b border-gray-200 px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Clinical Activity
            </h2>

            <p className="mt-2 text-gray-500">
              Latest medication administrations and vital-sign
              recordings.
            </p>
          </div>

          {medicationActivity.length === 0 &&
          vitalActivity.length === 0 ? (
            <div className="px-8 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <AppIcon
                  icon={faClipboardCheck}
                  className="text-2xl text-slate-400"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-800">
                No recent clinical activity
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Medication and vital-sign entries will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {medicationActivity.map((item: any) => (
                <div
                  key={`med-${item.id}`}
                  className="flex items-start gap-5 px-8 py-6 transition hover:bg-green-50"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100">
                    <AppIcon
                      icon={faPills}
                      className="text-2xl text-green-700"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900">
                      <strong>{item.administered_by}</strong>{" "}
                      {item.status}{" "}
                      <strong>
                        {item.medications?.medication_name ??
                          "medication"}
                      </strong>{" "}
                      for{" "}
                      <strong>
                        {item.residents?.full_name ??
                          "resident"}
                      </strong>
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Medication Administration Record
                    </p>
                  </div>
                </div>
              ))}

              {vitalActivity.map((item: any) => (
                <div
                  key={`vital-${item.id}`}
                  className="flex items-start gap-5 px-8 py-6 transition hover:bg-red-50"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                    <AppIcon
                      icon={faHeartPulse}
                      className="text-2xl text-red-600"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900">
                      <strong>{item.recorded_by}</strong>{" "}
                      recorded vital signs for{" "}
                      <strong>
                        {item.residents?.full_name ??
                          "resident"}
                      </strong>
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Vital Signs Record
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}