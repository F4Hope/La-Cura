import { supabase } from "@/lib/supabase/client";

export async function getTodayTasks() {

  const tasks = [];

  const { count: medicationCount } = await supabase
    .from("medication_administration")
    .select("*", {
      count: "exact",
      head: true,
    });

  tasks.push({
    icon: "💊",
    title: "Medication Administrations",
    value: medicationCount ?? 0,
    color: "blue",
  });

  const { count: vitalCount } = await supabase
    .from("vital_signs")
    .select("*", {
      count: "exact",
      head: true,
    });

  tasks.push({
    icon: "❤️",
    title: "Vital Signs Recorded",
    value: vitalCount ?? 0,
    color: "red",
  });

  const { count: appointmentCount } = await supabase
    .from("appointments")
    .select("*", {
      count: "exact",
      head: true,
    });

  tasks.push({
    icon: "📅",
    title: "Appointments",
    value: appointmentCount ?? 0,
    color: "green",
  });

  return tasks;

}