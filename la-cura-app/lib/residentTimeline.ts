import { supabase } from "@/lib/supabase/client";

export async function getResidentTimeline(residentId: number) {

  const medicationPromise = supabase
    .from("medication_administration")
    .select(`
      id,
      status,
      administered_at,
      administered_by,
      medications(medication_name)
    `)
    .eq("resident_id", residentId);

  const vitalsPromise = supabase
    .from("vital_signs")
    .select(`
      id,
      recorded_at,
      recorded_by,
      temperature,
      pulse,
      systolic,
      diastolic,
      oxygen_saturation
    `)
    .eq("resident_id", residentId);

  const nursingPromise = supabase
    .from("nursing_notes")
    .select(`
      id,
      note,
      recorded_by,
      created_at
    `)
    .eq("resident_id", residentId);

  const incidentPromise = supabase
    .from("incident_reports")
    .select(`
      id,
      incident_type,
      description,
      action_taken,
      reported_by,
      created_at
    `)
    .eq("resident_id", residentId);

  const [
    medications,
    vitals,
    nursing,
    incidents,
  ] = await Promise.all([
    medicationPromise,
    vitalsPromise,
    nursingPromise,
    incidentPromise,
  ]);

  const timeline: any[] = [];

  // Medication
  if (medications.data) {

    medications.data.forEach((item: any) => {

      timeline.push({
        type: "Medication",
        icon: "💊",
        date: item.administered_at,
        title: item.medications?.medication_name,
        subtitle: `${item.status} by ${item.administered_by}`,
      });

    });

  }

  // Vital Signs
  if (vitals.data) {

    vitals.data.forEach((item: any) => {

      timeline.push({
        type: "Vital Signs",
        icon: "❤️",
        date: item.recorded_at,
        title: `${item.temperature}°C • Pulse ${item.pulse}`,
        subtitle: `BP ${item.systolic}/${item.diastolic} • O₂ ${item.oxygen_saturation}%`,
      });

    });

  }

  // Nursing Notes
  if (nursing.data) {

    nursing.data.forEach((item: any) => {

      timeline.push({
        type: "Nursing Note",
        icon: "📝",
        date: item.created_at,
        title: item.note,
        subtitle: `Recorded by ${item.recorded_by}`,
      });

    });

  }

  // Incident Reports
  if (incidents.data) {

    incidents.data.forEach((item: any) => {

      timeline.push({
        type: "Incident Report",
        icon: "🚨",
        date: item.created_at,
        title: item.incident_type,
        subtitle: `${item.description} • Reported by ${item.reported_by}`,
      });

    });

  }

  timeline.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  return timeline;

}