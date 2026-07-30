"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddStaffModal({
  open,
  onClose,
}: Props) {

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({

    full_name: "",

    email: "",

    phone: "",

    role: "Nurse",

    department: "",

    license_number: "",

    shift: "Day",

    employment_date: "",

  });

  if (!open) return null;

  async function createStaff() {

    setLoading(true);

    const response = await fetch("/api/staff/create", {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify(form),

    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {

      alert(result.error);

      return;

    }

    alert("Invitation sent successfully.");

    onClose();

    window.location.reload();

  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

        <div className="bg-green-700 text-white p-6">

          <h2 className="text-2xl font-bold">

            Add Staff Member

          </h2>

          <p className="text-green-100">

            Step {step} of 2

          </p>

        </div>

        <div className="p-8">

          {step === 1 && (

            <div className="space-y-5">

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e)=>setForm({...form,full_name:e.target.value})}
              />

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={(e)=>setForm({...form,email:e.target.value})}
              />

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e)=>setForm({...form,phone:e.target.value})}
              />

              <select
                className="w-full border rounded-xl p-3"
                value={form.role}
                onChange={(e)=>setForm({...form,role:e.target.value})}
              >

                <option>Administrator</option>

                <option>Nurse</option>

                <option>Physician</option>

              </select>

            </div>

          )}

          {step === 2 && (

            <div className="space-y-5">

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Department"
                value={form.department}
                onChange={(e)=>setForm({...form,department:e.target.value})}
              />

              <input
                className="w-full border rounded-xl p-3"
                placeholder="License Number"
                value={form.license_number}
                onChange={(e)=>setForm({...form,license_number:e.target.value})}
              />

              <select
                className="w-full border rounded-xl p-3"
                value={form.shift}
                onChange={(e)=>setForm({...form,shift:e.target.value})}
              >

                <option>Day</option>

                <option>Night</option>

              </select>

              <input
                className="w-full border rounded-xl p-3"
                type="date"
                value={form.employment_date}
                onChange={(e)=>setForm({...form,employment_date:e.target.value})}
              />

            </div>

          )}

        </div>

        <div className="bg-gray-100 p-6 flex justify-between">

          {step === 1 ? (

            <button
              onClick={onClose}
              className="border rounded-xl px-6 py-3"
            >

              Cancel

            </button>

          ) : (

            <button
              onClick={()=>setStep(1)}
              className="border rounded-xl px-6 py-3"
            >

              Back

            </button>

          )}

          {step === 1 ? (

            <button
              onClick={()=>setStep(2)}
              className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-6 py-3"
            >

              Next →

            </button>

          ) : (

            <button
              onClick={createStaff}
              disabled={loading}
              className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-6 py-3 disabled:opacity-50"
            >

              {loading ? "Creating..." : "Create Staff"}

            </button>

          )}

        </div>

      </div>

    </div>

  );

}