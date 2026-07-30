import Link from "next/link";
import { Search, Plus, Pill, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default async function MedicationsPage() {

  const { data: medications } = await supabase
    .from("medications")
    .select("*")
    .order("resident_name");

  return (

    <div className="min-h-screen bg-gray-100">

      <header className="bg-green-700 text-white p-6">

        <h1 className="text-2xl md:text-4xl font-bold">

          Medications

        </h1>

        <p className="text-green-100 mt-2">

          Medication Records

        </p>

      </header>

      <section className="p-4 md:p-8">

        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">

          <div className="relative w-full md:w-96">

            <Search
              className="absolute left-4 top-3 text-gray-400"
              size={20}
            />

            <input
              placeholder="Search medications..."
              className="w-full rounded-xl border pl-12 pr-4 py-3"
            />

          </div>

          <Link href="/add-medication">

            <button className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white rounded-xl px-6 py-3 flex justify-center items-center gap-2">

              <Plus size={20}/>

              Add Medication

            </button>

          </Link>

        </div>

        <div className="grid gap-5">

          {medications?.length === 0 && (

            <div className="bg-white rounded-2xl shadow p-10 text-center">

              No Medications Found

            </div>

          )}

          {medications?.map((med)=>(

            <div
              key={med.id}
              className="bg-white rounded-2xl shadow p-5"
            >

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-xl font-bold text-green-700">

                    {med.resident_name}

                  </h2>

                  <p className="text-gray-500">

                    {med.medication_name}

                  </p>

                </div>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                  Active

                </span>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

                <div>

                  <p className="text-gray-500 text-sm">

                    Dosage

                  </p>

                  <strong>

                    {med.dosage}

                  </strong>

                </div>

                <div>

                  <p className="text-gray-500 text-sm">

                    Frequency

                  </p>

                  <strong>

                    {med.frequency}

                  </strong>

                </div>

                <div className="flex items-center gap-2">

                  <Clock
                    size={18}
                    className="text-red-600"
                  />

                  <strong>

                    {med.time_to_take}

                  </strong>

                </div>

                <div className="flex items-center gap-2">

                  <Pill
                    size={18}
                    className="text-orange-600"
                  />

                  <strong>

                    {med.medication_name}

                  </strong>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>

  );

}