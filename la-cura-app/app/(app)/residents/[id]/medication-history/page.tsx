import Link from "next/link";
import { ArrowLeft, CheckCircle, PauseCircle, XCircle } from "lucide-react";

import { getMedicationHistory } from "@/lib/medicationHistory";

export default async function MedicationHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const history = await getMedicationHistory(Number(id));

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-green-700 text-white p-6 shadow">

        <Link
          href={`/residents/${id}`}
          className="flex items-center gap-2 mb-4 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to Resident
        </Link>

        <h1 className="text-3xl font-bold">
          Medication History
        </h1>

      </header>

      <section className="p-8">

        <div className="space-y-6">

          {history.length === 0 && (

            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">

              No medication history found.

            </div>

          )}

          {history.map((item: any) => (

            <div
              key={item.id}
              className="bg-white rounded-2xl shadow p-6"
            >

              <div className="flex items-center gap-3 mb-4">

                {item.status === "Administered" && (
                  <CheckCircle
                    className="text-green-600"
                    size={28}
                  />
                )}

                {item.status === "Held" && (
                  <PauseCircle
                    className="text-yellow-500"
                    size={28}
                  />
                )}

                {item.status === "Refused" && (
                  <XCircle
                    className="text-red-600"
                    size={28}
                  />
                )}

                <div>

                  <h2 className="font-bold text-lg">

                    {item.medications?.medication_name}

                  </h2>

                  <p className="text-gray-500">

                    {item.medications?.dosage}

                  </p>

                </div>

              </div>

              <div className="grid md:grid-cols-2 gap-4">

                <div>

                  <b>Status</b>

                  <p>{item.status}</p>

                </div>

                <div>

                  <b>Nurse</b>

                  <p>{item.administered_by}</p>

                </div>

                <div>

                  <b>Reason</b>

                  <p>{item.reason || "-"}</p>

                </div>

                <div>

                  <b>Date & Time</b>

                  <p>

                    {new Date(item.administered_at).toLocaleString()}

                  </p>

                </div>

              </div>

              <div className="mt-5">

                <b>Notes</b>

                <p className="mt-2 text-gray-700">

                  {item.notes || "-"}

                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}