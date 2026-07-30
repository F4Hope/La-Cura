"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ResidentSearch from "@/components/ResidentSearch";
import { getCurrentStaff } from "@/lib/currentStaff";

export default function AddIncidentReportPage() {

  const [resident, setResident] = useState<any>(null);

  const [incidentType, setIncidentType] = useState("");

  const [description, setDescription] = useState("");

  const [actionTaken, setActionTaken] = useState("");

  const [saving, setSaving] = useState(false);

  async function saveIncident() {

    if (!resident) {
      alert("Select a resident");
      return;
    }

    if (!incidentType) {
      alert("Select incident type");
      return;
    }

    if (!description.trim()) {
      alert("Enter a description");
      return;
    }

    const staff = await getCurrentStaff();

    if (!staff) {
      alert("Unable to identify the logged in staff member.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("incident_reports")
      .insert({

        resident_id: resident.id,

        incident_type: incidentType,

        description,

        action_taken: actionTaken,

        reported_by: staff.full_name,

      });

    setSaving(false);

    if (error) {

      alert(error.message);

      return;

    }

    alert("Incident report saved successfully.");

    setIncidentType("");

    setDescription("");

    setActionTaken("");

  }

  return (

    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">

        Incident Report

      </h1>

      <ResidentSearch
        onResidentSelected={setResident}
      />

      {resident && (

        <div className="bg-red-50 rounded-xl p-4 mt-6">

          <strong>Resident:</strong> {resident.full_name}

        </div>

      )}

      <select
        value={incidentType}
        onChange={(e)=>setIncidentType(e.target.value)}
        className="border rounded-xl p-3 w-full mt-6"
      >

        <option value="">Select Incident Type</option>

        <option>Fall</option>

        <option>Medication Error</option>

        <option>Skin Tear</option>

        <option>Aggressive Behaviour</option>

        <option>Wandering</option>

        <option>Other</option>

      </select>

      <textarea
        rows={6}
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
        placeholder="Describe what happened..."
        className="border rounded-xl p-4 w-full mt-6"
      />

      <textarea
        rows={4}
        value={actionTaken}
        onChange={(e)=>setActionTaken(e.target.value)}
        placeholder="Action taken..."
        className="border rounded-xl p-4 w-full mt-6"
      />

      <button
        onClick={saveIncident}
        disabled={saving}
        className="bg-red-700 text-white px-8 py-3 rounded-xl mt-6 hover:bg-red-800"
      >

        {saving ? "Saving..." : "Save Incident Report"}

      </button>

    </div>

  );

}