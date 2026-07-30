"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import ResidentSearch from "@/components/ResidentSearch";
import { getCurrentStaff } from "@/lib/currentStaff";
import { isOnline, saveOffline } from "@/lib/offline";

type Resident = {
  id: number;
  full_name: string;
  room: string;
  age: number;
};

export default function AddVitalsPage() {

  const [resident, setResident] = useState<Resident | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({

    temperature: "",
    pulse: "",
    systolic: "",
    diastolic: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    weight: "",
    pain_score: "",
    notes: ""

  });


  async function saveVitals(e: React.FormEvent) {

    e.preventDefault();

    if (!resident) {
      alert("Select a resident");
      return;
    }

    setSaving(true);

    const staff = await getCurrentStaff();

    const data = {

      resident_id: resident.id,

      temperature: Number(form.temperature),
      pulse: Number(form.pulse),
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      respiratory_rate: Number(form.respiratory_rate),
      oxygen_saturation: Number(form.oxygen_saturation),
      weight: Number(form.weight),
      pain_score: Number(form.pain_score),

      notes: form.notes,

      recorded_by: staff?.full_name || "Offline Staff",

      created_at: new Date().toISOString()

    };


    if (!isOnline()) {

      saveOffline("vital_signs", data);

      alert(
        "No internet. Vital signs saved offline and will sync later."
      );

      setSaving(false);

      return;

    }


    const { error } = await supabase
      .from("vital_signs")
      .insert(data);


    setSaving(false);


    if (error) {

      alert(error.message);

      return;

    }


    alert("Vital Signs Saved");


    setForm({

      temperature: "",
      pulse: "",
      systolic: "",
      diastolic: "",
      respiratory_rate: "",
      oxygen_saturation: "",
      weight: "",
      pain_score: "",
      notes: ""

    });

    setResident(null);

  }


  return (

    <div className="min-h-screen bg-gray-100">

      <header className="bg-green-700 text-white p-6">

        <h1 className="text-3xl font-bold">
          Record Vital Signs
        </h1>

        <p className="text-green-100">
          Works online and offline
        </p>

      </header>


      <section className="p-5">

        <form
          onSubmit={saveVitals}
          className="bg-white rounded-2xl shadow p-6 max-w-4xl mx-auto space-y-5"
        >

          <ResidentSearch
            onResidentSelected={setResident}
          />


          {resident && (

            <div className="bg-green-50 p-4 rounded-xl">

              <b>{resident.full_name}</b>

              <p>
                Room {resident.room}
              </p>

            </div>

          )}


          <div className="grid grid-cols-2 gap-4">

            {Object.keys(form).map((field)=> (

              field !== "notes" && (

                <input

                  key={field}

                  type="number"

                  placeholder={field.replaceAll("_"," ")}

                  value={(form as any)[field]}

                  onChange={(e)=>
                    setForm({
                      ...form,
                      [field]: e.target.value
                    })
                  }

                  className="border rounded-xl p-3"

                />

              )

            ))}

          </div>


          <textarea

            rows={4}

            placeholder="Notes"

            value={form.notes}

            onChange={(e)=>
              setForm({
                ...form,
                notes:e.target.value
              })
            }

            className="border rounded-xl p-3 w-full"

          />


          <button

            disabled={saving}

            className="w-full bg-green-700 text-white rounded-xl py-4 flex justify-center gap-2"

          >

            <Save size={20}/>

            {saving ? "Saving..." : "Save Vital Signs"}

          </button>


        </form>

      </section>


    </div>

  );

}