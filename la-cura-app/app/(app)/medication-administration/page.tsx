import {
  faClock,
  faClipboardCheck,
  faPills,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AdministerButton from "@/components/AdministerButton";
import AppIcon from "@/components/ui/AppIcon";
import HoldButton from "@/components/HoldButton";
import RefusedButton from "@/components/RefusedButton";

import { getMedications } from "@/lib/medications";

type MedicationRecord = {
  id: number;
  resident_id: number;
  resident_name: string;
  medication_name: string;
  dosage?: string | null;
  time_to_take?: string | null;
  status?: string | null;
};

function getStatusClasses(status?: string | null): string {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "administered") {
    return "bg-green-100 text-green-700";
  }

  if (normalizedStatus === "held") {
    return "bg-amber-100 text-amber-700";
  }

  if (normalizedStatus === "refused") {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

function getStatusBarClass(status?: string | null): string {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "administered") {
    return "bg-green-600";
  }

  if (normalizedStatus === "held") {
    return "bg-amber-500";
  }

  if (normalizedStatus === "refused") {
    return "bg-red-600";
  }

  return "bg-blue-600";
}

export default async function MedicationAdministrationPage() {
  const medicationData = await getMedications();

  const medications =
    (medicationData ?? []) as MedicationRecord[];

  const completed = medications.filter(
    (medication) =>
      medication.status?.trim().toLowerCase() ===
      "administered"
  ).length;

  const pending = medications.length - completed;

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="relative overflow-hidden rounded-b-[40px] bg-gradient-to-r from-green-800 via-green-700 to-green-600 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />

        <div className="absolute -bottom-24 left-1/2 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-14">
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div>
              <span className="font-semibold uppercase tracking-[5px] text-green-100">
                Electronic Medication Administration Record
              </span>

              <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
                Medication Administration
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-green-100 md:text-xl md:leading-9">
                Safely administer, hold, or record refused
                medications while maintaining a complete clinical
                record.
              </p>
            </div>

            <div className="w-full rounded-[30px] bg-white/15 p-7 backdrop-blur-xl lg:min-w-[360px] lg:max-w-md lg:p-8">
              <div className="grid grid-cols-2 gap-7">
                <SummaryMetric
                  icon={faClipboardCheck}
                  value={medications.length}
                  label="Scheduled"
                />

                <SummaryMetric
                  icon={faUsers}
                  value={completed}
                  label="Completed"
                />

                <SummaryMetric
                  icon={faClock}
                  value={pending}
                  label="Pending"
                />

                <SummaryMetric
                  icon={faPills}
                  value={medications.length}
                  label="MAR Entries"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {medications.length === 0 ? (
          <div className="rounded-[30px] bg-white py-24 text-center shadow-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-green-100">
              <AppIcon
                icon={faClipboardCheck}
                className="text-5xl text-green-600"
              />
            </div>

            <h2 className="mt-8 text-3xl font-black text-gray-900">
              No Scheduled Medications
            </h2>

            <p className="mt-4 text-lg text-gray-500">
              There are currently no medications awaiting
              administration.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {medications.map((medication) => {
              const status =
                medication.status?.trim() || "Pending";

              return (
                <article
                  key={medication.id}
                  className="group overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div
                    className={`h-2 ${getStatusBarClass(
                      medication.status
                    )}`}
                  />

                  <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 md:text-3xl">
                          {medication.resident_name}
                        </h2>

                        <p className="mt-2 text-lg text-gray-500">
                          {medication.medication_name}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-5 py-2 font-bold ${getStatusClasses(
                          medication.status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                      <MedicationInformationCard
                        label="Dosage"
                        value={
                          medication.dosage ||
                          "Not documented"
                        }
                        icon={faPills}
                        iconClassName="text-orange-500"
                      />

                      <MedicationInformationCard
                        label="Administration Time"
                        value={
                          medication.time_to_take ||
                          "Not documented"
                        }
                        icon={faClock}
                        iconClassName="text-red-500"
                      />

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm text-gray-400">
                          Medication
                        </p>

                        <h3 className="mt-2 font-bold text-slate-900">
                          {medication.medication_name}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm text-gray-400">
                          Current Status
                        </p>

                        <h3 className="mt-2 font-bold text-green-700">
                          {status}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      <AdministerButton
                        medicationId={medication.id}
                        residentId={medication.resident_id}
                        resident={medication.resident_name}
                        medication={
                          medication.medication_name
                        }
                      />

                      <HoldButton
                        medicationId={medication.id}
                        residentId={medication.resident_id}
                        resident={medication.resident_name}
                        medication={
                          medication.medication_name
                        }
                      />

                      <RefusedButton
                        medicationId={medication.id}
                        residentId={medication.resident_id}
                        resident={medication.resident_name}
                        medication={
                          medication.medication_name
                        }
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

type SummaryMetricProps = {
  icon: Parameters<typeof AppIcon>[0]["icon"];
  value: number;
  label: string;
};

function SummaryMetric({
  icon,
  value,
  label,
}: SummaryMetricProps) {
  return (
    <div>
      <AppIcon
        icon={icon}
        className="mb-3 text-3xl text-white"
      />

      <h2 className="text-4xl font-black text-white">
        {value}
      </h2>

      <p className="text-green-100">{label}</p>
    </div>
  );
}

type MedicationInformationCardProps = {
  label: string;
  value: string;
  icon: Parameters<typeof AppIcon>[0]["icon"];
  iconClassName: string;
};

function MedicationInformationCard({
  label,
  value,
  icon,
  iconClassName,
}: MedicationInformationCardProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm text-gray-400">{label}</p>

      <div className="mt-2 flex items-center gap-3">
        <AppIcon
          icon={icon}
          className={iconClassName}
        />

        <strong className="text-lg text-slate-900">
          {value}
        </strong>
      </div>
    </div>
  );
}