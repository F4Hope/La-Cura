import Link from "next/link";

import {
  Clock,
  Pill,
  Plus,
  Search,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

export default async function MedicationsPage() {
  const supabase =
    await createClient();

  const {
    data: medications,
    error,
  } = await supabase
    .from("medications")
    .select("*")
    .order("resident_name");

  if (error) {
    console.error(
      "Unable to load medications:",
      error.message
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-700 p-6 text-white">
        <h1 className="text-2xl font-bold md:text-4xl">
          Medications
        </h1>

        <p className="mt-2 text-green-100">
          Medication Records
        </p>
      </header>

      <section className="p-4 md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-3 text-gray-400"
              size={20}
            />

            <input
              placeholder="Search medications..."
              className="w-full rounded-xl border py-3 pl-12 pr-4"
            />
          </div>

          <Link
            href="/add-medication"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-white transition hover:bg-green-800 md:w-auto"
          >
            <Plus size={20} />

            Add Medication
          </Link>
        </div>

        <div className="grid gap-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Medication records could
              not be loaded.
            </div>
          )}

          {!error &&
            (!medications ||
              medications.length ===
                0) && (
              <div className="rounded-2xl bg-white p-10 text-center shadow">
                No Medications Found
              </div>
            )}

          {!error &&
            medications?.map(
              (medication) => (
                <article
                  key={
                    medication.id
                  }
                  className="rounded-2xl bg-white p-5 shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-green-700">
                        {medication.resident_name ||
                          "Resident"}
                      </h2>

                      <p className="text-gray-500">
                        {medication.medication_name ||
                          "Medication"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      Active
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Dosage
                      </p>

                      <strong>
                        {medication.dosage ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Frequency
                      </p>

                      <strong>
                        {medication.frequency ||
                          "—"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock
                        size={18}
                        className="text-red-600"
                      />

                      <strong>
                        {medication.time_to_take ||
                          "—"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <Pill
                        size={18}
                        className="text-orange-600"
                      />

                      <strong>
                        {medication.medication_name ||
                          "—"}
                      </strong>
                    </div>
                  </div>
                </article>
              )
            )}
        </div>
      </section>
    </div>
  );
}