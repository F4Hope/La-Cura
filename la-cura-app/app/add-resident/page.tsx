"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Notification from "@/components/Notification";

export default function AddResidentPage() {
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    room: "",
    date_of_birth: "",
    date_admitted: "",
    diagnosis: "",
    allergies: "",
    blood_group: "",
    primary_doctor: "",
    status: "Stable",
    emergency_contact: "",
    next_of_kin: "",
    next_of_kin_phone: "",
    notes: "",
    photo_url: "",
  });

  const [errors, setErrors] = useState({
    full_name: false,
    age: false,
    gender: false,
    room: false,
    date_admitted: false,
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      full_name: form.full_name.trim() === "",
      age: form.age === "",
      gender: form.gender === "",
      room: form.room.trim() === "",
      date_admitted: form.date_admitted === "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setNotification({
        type: "error",
        message: "Please complete all required fields.",
      });
      return;
    }

    const { error } = await supabase.from("residents").insert([
      {
        full_name: form.full_name,
        age: Number(form.age),
        gender: form.gender,
        room: form.room,
        date_of_birth: form.date_of_birth || null,
        date_admitted: form.date_admitted,
        diagnosis: form.diagnosis,
        allergies: form.allergies,
        blood_group: form.blood_group,
        primary_doctor: form.primary_doctor,
        status: form.status,
        emergency_contact: form.emergency_contact,
        next_of_kin: form.next_of_kin,
        next_of_kin_phone: form.next_of_kin_phone,
        notes: form.notes,
        photo_url: form.photo_url,
      },
    ]);

    if (error) {
      console.log(error);

      setNotification({
        type: "error",
        message: error.message,
      });

      return;
    }

    setNotification({
      type: "success",
      message: "Resident added successfully!",
    });

    setForm({
      full_name: "",
      age: "",
      gender: "",
      room: "",
      date_of_birth: "",
      date_admitted: "",
      diagnosis: "",
      allergies: "",
      blood_group: "",
      primary_doctor: "",
      status: "Stable",
      emergency_contact: "",
      next_of_kin: "",
      next_of_kin_phone: "",
      notes: "",
      photo_url: "",
    });

    setErrors({
      full_name: false,
      age: false,
      gender: false,
      room: false,
      date_admitted: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}

      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">
          Add Resident
        </h1>

        <p className="text-green-100">
          Register a New Resident
        </p>
      </header>

      <section className="p-8">

        <div className="bg-white rounded-2xl shadow p-8 max-w-4xl">

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            <input
              placeholder="Full Name *"
              className={`border rounded-xl p-3 ${errors.full_name ? "border-red-500" : ""}`}
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Age *"
              className={`border rounded-xl p-3 ${errors.age ? "border-red-500" : ""}`}
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value })
              }
            />

            <select
              className={`border rounded-xl p-3 ${errors.gender ? "border-red-500" : ""}`}
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
            >
              <option value="">Select Gender *</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <input
              placeholder="Room Number *"
              className={`border rounded-xl p-3 ${errors.room ? "border-red-500" : ""}`}
              value={form.room}
              onChange={(e) =>
                setForm({ ...form, room: e.target.value })
              }
            />

            <input
              type="date"
              className="border rounded-xl p-3"
              value={form.date_of_birth}
              onChange={(e) =>
                setForm({ ...form, date_of_birth: e.target.value })
              }
            />

            <input
              type="date"
              className={`border rounded-xl p-3 ${errors.date_admitted ? "border-red-500" : ""}`}
              value={form.date_admitted}
              onChange={(e) =>
                setForm({ ...form, date_admitted: e.target.value })
              }
            />

            <input
              placeholder="Diagnosis"
              className="border rounded-xl p-3"
              value={form.diagnosis}
              onChange={(e) =>
                setForm({ ...form, diagnosis: e.target.value })
              }
            />

            <input
              placeholder="Allergies"
              className="border rounded-xl p-3"
              value={form.allergies}
              onChange={(e) =>
                setForm({ ...form, allergies: e.target.value })
              }
            />

            <input
              placeholder="Blood Group"
              className="border rounded-xl p-3"
              value={form.blood_group}
              onChange={(e) =>
                setForm({ ...form, blood_group: e.target.value })
              }
            />

            <input
              placeholder="Primary Doctor"
              className="border rounded-xl p-3"
              value={form.primary_doctor}
              onChange={(e) =>
                setForm({ ...form, primary_doctor: e.target.value })
              }
            />

            <select
              className="border rounded-xl p-3"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option>Stable</option>
              <option>Observation</option>
              <option>Critical</option>
            </select>

            <input
              placeholder="Emergency Contact"
              className="border rounded-xl p-3"
              value={form.emergency_contact}
              onChange={(e) =>
                setForm({ ...form, emergency_contact: e.target.value })
              }
            />

            <input
              placeholder="Next of Kin"
              className="border rounded-xl p-3"
              value={form.next_of_kin}
              onChange={(e) =>
                setForm({ ...form, next_of_kin: e.target.value })
              }
            />

            <input
              placeholder="Next of Kin Phone"
              className="border rounded-xl p-3"
              value={form.next_of_kin_phone}
              onChange={(e) =>
                setForm({ ...form, next_of_kin_phone: e.target.value })
              }
            />

            <input
              placeholder="Photo URL (optional)"
              className="border rounded-xl p-3 md:col-span-2"
              value={form.photo_url}
              onChange={(e) =>
                setForm({ ...form, photo_url: e.target.value })
              }
            />

            <textarea
              placeholder="Notes"
              rows={5}
              className="border rounded-xl p-3 md:col-span-2"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />

            <button
              className="bg-green-700 hover:bg-green-800 text-white rounded-xl py-4 font-semibold md:col-span-2"
            >
              Save Resident
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}