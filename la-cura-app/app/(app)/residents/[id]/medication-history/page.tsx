import Link from "next/link";
import { ArrowLeft, CheckCircle, PauseCircle, XCircle } from "lucide-react";

import { getMedicationHistory } from "@/lib/medicationHistory";

import {
  getServerLanguage,
} from "@/lib/i18n/serverLanguage";

import {
  uiLocale,
  uiText,
} from "@/lib/i18n/appUi";

export default async function MedicationHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const language =
    await getServerLanguage();

  const locale =
    uiLocale(language);

  const ui =
    (value: string) =>
      uiText(language, value);

  const history = await getMedicationHistory(Number(id));

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="border-b border-[#D5A437] bg-[#073B2F] px-4 py-3 text-white">

        <Link
          href={`/residents/${id}`}
          className="flex items-center gap-2 mb-4 hover:underline"
        >
          <ArrowLeft size={20} />
          {ui("Back to Resident")}</Link>

        <h1 className="text-[22px] font-bold tracking-[-0.02em]">
          {ui("Medication History")}</h1>

      </header>

      <section className="p-8">

        <div className="space-y-6">

          {history.length === 0 && (

            <div className="border border-[#C8D2CD] bg-white p-6 text-center text-[11px] text-[#687970]">

              {ui("No medication history found.")}</div>

          )}

          {history.map((item: any) => (

            <div
              key={item.id}
              className="border border-[#C8D2CD] bg-white p-3"
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

                  <b>{ui("Status")}</b>

                  <p>{ui(item.status)}</p>

                </div>

                <div>

                  <b>{ui("Nurse")}</b>

                  <p>{item.administered_by}</p>

                </div>

                <div>

                  <b>{ui("Reason")}</b>

                  <p>{item.reason || "-"}</p>

                </div>

                <div>

                  <b>{ui("Date & Time")}</b>

                  <p>

                    {new Date(item.administered_at).toLocaleString(locale)}

                  </p>

                </div>

              </div>

              <div className="mt-5">

                <b>{ui("Notes")}</b>

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