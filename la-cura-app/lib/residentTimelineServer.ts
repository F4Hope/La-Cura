import {
  createClient,
} from "@/lib/supabase/server";

export type ResidentTimelineItem = {
  type: string;
  icon: string;
  date: string | null;
  title: string;
  subtitle: string;
};

function safeText(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getMedicationName(
  relation: unknown
): string {
  if (
    !relation ||
    typeof relation !== "object"
  ) {
    return "Medication";
  }

  if (Array.isArray(relation)) {
    const first =
      relation[0];

    if (
      first &&
      typeof first === "object" &&
      "medication_name" in first
    ) {
      return (
        safeText(
          first.medication_name
        ) || "Medication"
      );
    }

    return "Medication";
  }

  if (
    "medication_name" in relation
  ) {
    return (
      safeText(
        relation.medication_name
      ) || "Medication"
    );
  }

  return "Medication";
}

function sortTimestamp(
  value: string | null
): number {
  if (!value) {
    return 0;
  }

  const time =
    new Date(value).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}

export async function getResidentTimelineServer(
  residentId: number
): Promise<
  ResidentTimelineItem[]
> {
  const supabase =
    await createClient();

  const [
    medications,
    vitals,
    nursing,
    incidents,
  ] = await Promise.all([
    supabase
      .from(
        "medication_administration"
      )
      .select(`
        id,
        status,
        administered_at,
        administered_by,
        medications (
          medication_name
        )
      `)
      .eq(
        "resident_id",
        residentId
      ),

    supabase
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
      .eq(
        "resident_id",
        residentId
      ),

    supabase
      .from("nursing_notes")
      .select(`
        id,
        note,
        recorded_by,
        created_at
      `)
      .eq(
        "resident_id",
        residentId
      ),

    supabase
      .from("incident_reports")
      .select(`
        id,
        incident_type,
        description,
        action_taken,
        reported_by,
        created_at
      `)
      .eq(
        "resident_id",
        residentId
      ),
  ]);

  if (medications.error) {
    console.error(
      "Unable to load medication timeline:",
      medications.error.message
    );
  }

  if (vitals.error) {
    console.error(
      "Unable to load vital-sign timeline:",
      vitals.error.message
    );
  }

  if (nursing.error) {
    console.error(
      "Unable to load nursing-note timeline:",
      nursing.error.message
    );
  }

  if (incidents.error) {
    console.error(
      "Unable to load incident timeline:",
      incidents.error.message
    );
  }

  const timeline:
    ResidentTimelineItem[] = [];

  for (
    const item of
      medications.data ?? []
  ) {
    const medicationName =
      getMedicationName(
        item.medications
      );

    const status =
      safeText(item.status) ||
      "Status not recorded";

    const administeredBy =
      safeText(
        item.administered_by
      ) || "Unknown staff";

    timeline.push({
      type: "Medication",
      icon: "💊",
      date:
        item.administered_at ??
        null,
      title:
        medicationName,
      subtitle:
        `${status} by ${administeredBy}`,
    });
  }

  for (
    const item of
      vitals.data ?? []
  ) {
    const temperature =
      item.temperature ??
      "—";

    const pulse =
      item.pulse ?? "—";

    const systolic =
      item.systolic ?? "—";

    const diastolic =
      item.diastolic ?? "—";

    const oxygen =
      item.oxygen_saturation ??
      "—";

    timeline.push({
      type: "Vital Signs",
      icon: "❤️",
      date:
        item.recorded_at ??
        null,
      title:
        `${temperature}°C • Pulse ${pulse}`,
      subtitle:
        `BP ${systolic}/${diastolic} • O₂ ${oxygen}%`,
    });
  }

  for (
    const item of
      nursing.data ?? []
  ) {
    const note =
      safeText(item.note) ||
      "Nursing note";

    const recordedBy =
      safeText(
        item.recorded_by
      ) || "Unknown staff";

    timeline.push({
      type: "Nursing Note",
      icon: "📝",
      date:
        item.created_at ??
        null,
      title: note,
      subtitle:
        `Recorded by ${recordedBy}`,
    });
  }

  for (
    const item of
      incidents.data ?? []
  ) {
    const incidentType =
      safeText(
        item.incident_type
      ) || "Incident";

    const description =
      safeText(
        item.description
      ) ||
      "No description recorded";

    const reportedBy =
      safeText(
        item.reported_by
      ) || "Unknown staff";

    timeline.push({
      type: "Incident Report",
      icon: "🚨",
      date:
        item.created_at ??
        null,
      title:
        incidentType,
      subtitle:
        `${description} • Reported by ${reportedBy}`,
    });
  }

  timeline.sort(
    (a, b) =>
      sortTimestamp(b.date) -
      sortTimestamp(a.date)
  );

  return timeline;
}