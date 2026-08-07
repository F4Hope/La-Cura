"use client";

import { useState } from "react";
import { Save, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import ResidentSearch from "@/components/ResidentSearch";
import { getCurrentStaff } from "@/lib/currentStaff";

export default function AddNursingNotePage() {

  const [resident, setResident] = useState<any>(null);

  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const [saving, setSaving] = useState(false);

  async function saveNote() {

    if (!resident) {
      alert("Please select a resident.");
      return;
    }

    const note = `
SUBJECTIVE
${subjective}

OBJECTIVE
${objective}

ASSESSMENT
${assessment}

PLAN
${plan}
`;

    const staff = await getCurrentStaff();

    if (!staff) {
      alert("Unable to identify the logged in staff member.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("nursing_notes")
      .insert({

        resident_id: resident.id,

        note,

        recorded_by: staff.full_name,

      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Nursing Note Saved Successfully");

    setResident(null);

    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <header className="bg-green-700 text-white p-6">

        <h1 className="text-2xl md:text-4xl font-bold">

          Nursing Notes

        </h1>

        <p className="text-green-100 mt-2">

          SOAP Clinical Documentation

        </p>

      </header>

      <section className="p-4 md:p-8">

        <div className="bg-white rounded-2xl shadow p-6 max-w-5xl mx-auto">

          <ResidentSearch
            onResidentSelected={setResident}
          />

          {resident && (

            <div className="bg-green-50 rounded-xl p-4 mt-5">

              <strong>

                {resident.full_name}

              </strong>

              <p>

                Room {resident.room}

              </p>

            </div>

          )}

          <div className="space-y-5 mt-6">

            <textarea
              rows={4}
              placeholder="Subjective (What the resident says...)"
              value={subjective}
              onChange={(e)=>setSubjective(e.target.value)}
              className="border rounded-xl p-4 w-full"
            />

            <textarea
              rows={4}
              placeholder="Objective (Observations / Vital Signs)"
              value={objective}
              onChange={(e)=>setObjective(e.target.value)}
              className="border rounded-xl p-4 w-full"
            />

            <textarea
              rows={4}
              placeholder="Assessment"
              value={assessment}
              onChange={(e)=>setAssessment(e.target.value)}
              className="border rounded-xl p-4 w-full"
            />

            <textarea
              rows={4}
              placeholder="Plan / Intervention"
              value={plan}
              onChange={(e)=>setPlan(e.target.value)}
              className="border rounded-xl p-4 w-full"
            />

          </div>

          <button
            onClick={saveNote}
            disabled={saving}
            className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-4 mt-6 flex justify-center items-center gap-2"
          >

            <Save size={20}/>

            {saving ? "Saving..." : "Save Nursing Note"}

          </button>

        </div>

      </section>

    </div>

  );

}