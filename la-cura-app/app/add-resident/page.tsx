"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AddResidentPage() {

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    room: "",
    status: "Stable",
    emergency_contact: "",
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const { error } = await supabase
      .from("residents")
      .insert([
        {
          full_name: form.full_name,
          age: Number(form.age),
          room: form.room,
          status: form.status,
          emergency_contact: form.emergency_contact,
        },
      ]);


    if (error) {
  console.log(error);
  alert(error.message);
  return;
}


    alert("Resident added successfully");


    setForm({
      full_name: "",
      age: "",
      room: "",
      status: "Stable",
      emergency_contact: "",
    });

  };


  return (
    <div className="min-h-screen bg-gray-100">


      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">
          Add Resident
        </h1>

        <p className="text-green-100">
          Register a new resident
        </p>
      </header>


      <section className="p-8">


        <div className="bg-white rounded-2xl shadow p-8 max-w-2xl">


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >


            <input
              placeholder="Full Name"
              className="w-full border rounded-xl p-3"
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name: e.target.value,
                })
              }
            />


            <input
              type="number"
              placeholder="Age"
              className="w-full border rounded-xl p-3"
              value={form.age}
              onChange={(e) =>
                setForm({
                  ...form,
                  age: e.target.value,
                })
              }
            />


            <input
              placeholder="Room"
              className="w-full border rounded-xl p-3"
              value={form.room}
              onChange={(e) =>
                setForm({
                  ...form,
                  room: e.target.value,
                })
              }
            />


            <select
              className="w-full border rounded-xl p-3"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >

              <option>Stable</option>
              <option>Observation</option>
              <option>Critical</option>

            </select>


            <input
              placeholder="Emergency Contact"
              className="w-full border rounded-xl p-3"
              value={form.emergency_contact}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergency_contact: e.target.value,
                })
              }
            />


            <button
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl"
            >
              Save Resident
            </button>


          </form>


        </div>


      </section>


    </div>
  );
}