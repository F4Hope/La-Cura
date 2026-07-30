"use client";

import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  staff: any;
};

export default function EditStaffModal({
  open,
  onClose,
  staff,
}: Props) {

  const [form, setForm] = useState(staff);

  useEffect(() => {
    setForm(staff);
  }, [staff]);

  if (!open || !staff) return null;

  async function save() {

    const response = await fetch("/api/staff/update",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(form)
    });

    if(!response.ok){
      alert("Unable to update staff.");
      return;
    }

    window.location.reload();

  }

  return(

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl w-full max-w-xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          Edit Staff
        </h2>

        <div className="space-y-4">

          <input
            className="w-full border rounded-xl p-3"
            value={form.full_name}
            onChange={(e)=>setForm({...form,full_name:e.target.value})}
          />

          <input
            className="w-full border rounded-xl p-3"
            value={form.phone}
            onChange={(e)=>setForm({...form,phone:e.target.value})}
          />

          <input
            className="w-full border rounded-xl p-3"
            value={form.department}
            onChange={(e)=>setForm({...form,department:e.target.value})}
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

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="border rounded-xl px-5 py-3"
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="bg-green-700 text-white rounded-xl px-5 py-3"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );

}