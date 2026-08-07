import {
  createClient,
} from "@/lib/supabase/server";

export async function getTodayTasks() {
  const supabase =
    await createClient();

  const tasks = [];

  const {
    count: medicationCount,
    error: medicationError,
  } = await supabase
    .from(
      "medication_administration"
    )
    .select("*", {
      count: "exact",
      head: true,
    });

  if (medicationError) {
    console.error(
      "Unable to load medication task count:",
      medicationError.message
    );
  }

  tasks.push({
    icon: "💊",
    title:
      "Medication Administrations",
    value:
      medicationCount ?? 0,
    color: "blue",
  });

  const {
    count: vitalCount,
    error: vitalError,
  } = await supabase
    .from("vital_signs")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (vitalError) {
    console.error(
      "Unable to load vital-sign task count:",
      vitalError.message
    );
  }

  tasks.push({
    icon: "❤️",
    title:
      "Vital Signs Recorded",
    value:
      vitalCount ?? 0,
    color: "red",
  });

  const {
    count: appointmentCount,
    error: appointmentError,
  } = await supabase
    .from("appointments")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (appointmentError) {
    console.error(
      "Unable to load appointment task count:",
      appointmentError.message
    );
  }

  tasks.push({
    icon: "📅",
    title: "Appointments",
    value:
      appointmentCount ?? 0,
    color: "green",
  });

  return tasks;
}