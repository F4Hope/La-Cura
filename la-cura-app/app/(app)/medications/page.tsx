import { supabase } from "@/lib/supabase/client";

export default async function MedicationsPage() {
  const { data: medications, error } = await supabase
    .from("medications")
    .select("*");

  console.log("MEDICATION DATA:", medications);
  console.log("MEDICATION ERROR:", error);

  return (
    <div>
      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">Medications</h1>
        <p className="text-green-100">
          Medication records
        </p>
      </header>

      <section className="p-8">
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <table className="w-full">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-4 text-left">Resident</th>
                <th className="p-4 text-left">Medication</th>
                <th className="p-4 text-left">Dosage</th>
                <th className="p-4 text-left">Frequency</th>
                <th className="p-4 text-left">Time</th>
              </tr>
            </thead>

            <tbody>
              {medications?.map((med) => (
                <tr key={med.id} className="border-b">
                  <td className="p-4">{med.resident_name}</td>
                  <td className="p-4">{med.medication_name}</td>
                  <td className="p-4">{med.dosage}</td>
                  <td className="p-4">{med.frequency}</td>
                  <td className="p-4">{med.time_to_take}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </section>
    </div>
  );
}