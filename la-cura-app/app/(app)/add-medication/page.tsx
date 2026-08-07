"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Notification from "@/components/Notification";

export default function AddMedicationPage() {
  const [residents, setResidents] = useState<any[]>([]);

  const [form, setForm] = useState({
    resident_id: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    route: "",
    start_date: "",
    end_date: "",
    time_to_take: "",
    prescribed_by: "",
    notes: "",
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  async function loadResidents() {
    const { data } = await supabase
      .from("residents")
      .select("id, full_name")
      .order("full_name");

    setResidents(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      form.resident_id === "" ||
      form.medication_name === "" ||
      form.dosage === "" ||
      form.frequency === ""
    ) {
      setNotification({
        type: "error",
        message: "Please complete all required fields.",
      });
      return;
    }

    const { error } = await supabase
      .from("medications")
      .insert([form]);

    if (error) {
      setNotification({
        type: "error",
        message: error.message,
      });
      return;
    }

    setNotification({
      type: "success",
      message: "Medication added successfully!",
    });

    setForm({
      resident_id: "",
      medication_name: "",
      dosage: "",
      frequency: "",
      route: "",
      start_date: "",
      end_date: "",
      time_to_take: "",
      prescribed_by: "",
      notes: "",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}

      <header className="bg-green-700 text-white p-6 shadow">
        <h1 className="text-3xl font-bold">
          Add Medication
        </h1>

        <p className="text-green-100">
          Register medication for a resident
        </p>
      </header>

      <section className="p-8">

        <div className="bg-white rounded-2xl shadow p-8 max-w-3xl">

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-5"
          >

            <select
              className="border rounded-xl p-3"
              value={form.resident_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  resident_id: e.target.value,
                })
              }
            >
              <option value="">
                Select Resident *
              </option>

              {residents.map((resident) => (
                <option
                  key={resident.id}
                  value={resident.id}
                >
                  {resident.full_name}
                </option>
              ))}

            </select>

            <input
              placeholder="Medication Name *"
              className="border rounded-xl p-3"
              value={form.medication_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  medication_name: e.target.value,
                })
              }
            />

            <input
              placeholder="Dosage *"
              className="border rounded-xl p-3"
              value={form.dosage}
              onChange={(e) =>
                setForm({
                  ...form,
                  dosage: e.target.value,
                })
              }
            />

            <input
              placeholder="Frequency *"
              className="border rounded-xl p-3"
              value={form.frequency}
              onChange={(e) =>
                setForm({
                  ...form,
                  frequency: e.target.value,
                })
              }
            />

            <input
              placeholder="Route"
              className="border rounded-xl p-3"
              value={form.route}
              onChange={(e) =>
                setForm({
                  ...form,
                  route: e.target.value,
                })
              }
            />

            <input
              type="time"
              className="border rounded-xl p-3"
              value={form.time_to_take}
              onChange={(e) =>
                setForm({
                  ...form,
                  time_to_take: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="border rounded-xl p-3"
              value={form.start_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  start_date: e.target.value,
                })
              }
            />

            <input
              type="date"
              className="border rounded-xl p-3"
              value={form.end_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  end_date: e.target.value,
                })
              }
            />

            <input
              placeholder="Prescribed By"
              className="border rounded-xl p-3 md:col-span-2"
              value={form.prescribed_by}
              onChange={(e) =>
                setForm({
                  ...form,
                  prescribed_by: e.target.value,
                })
              }
            />

            <textarea
              rows={4}
              placeholder="Notes"
              className="border rounded-xl p-3 md:col-span-2"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />

            <button
              className="bg-green-700 hover:bg-green-800 text-white rounded-xl py-4 font-semibold md:col-span-2"
            >
              Save Medication
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}