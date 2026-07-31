import { supabase } from "@/lib/supabase/client";

type VitalAlertRow = {
  id: number;
  resident_id: number | null;
  temperature: number | string | null;
  oxygen_saturation: number | string | null;
  pain_score: number | string | null;
  systolic: number | string | null;
  diastolic: number | string | null;
  recorded_at: string | null;
};

type ResidentNameRow = {
  id: number;
  full_name: string | null;
};

export type ClinicalAlert = {
  type: string;
  color: "red" | "orange";
  resident: string | null;
  message: string;
};

function toNumber(
  value: number | string | null
): number | null {
  if (
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

export async function getClinicalAlerts(): Promise<
  ClinicalAlert[]
> {
  const { data, error } = await supabase
    .from("vital_signs")
    .select(
      "id, resident_id, temperature, oxygen_saturation, pain_score, systolic, diastolic, recorded_at"
    )
    .order("recorded_at", {
      ascending: false,
    })
    .limit(50);

  if (error) {
    console.error(
      "Unable to load clinical alerts."
    );

    return [];
  }

  const vitalRows =
    (data ?? []) as VitalAlertRow[];

  const residentIds = [
    ...new Set(
      vitalRows
        .map((vital) => vital.resident_id)
        .filter(
          (residentId): residentId is number =>
            typeof residentId === "number"
        )
    ),
  ];

  const residentNames = new Map<
    number,
    string | null
  >();

  if (residentIds.length > 0) {
    const {
      data: residentData,
      error: residentError,
    } = await supabase
      .from("residents")
      .select("id, full_name")
      .in("id", residentIds);

    if (residentError) {
      console.error(
        "Unable to resolve resident names for clinical alerts."
      );
    } else {
      const residents =
        (residentData ??
          []) as ResidentNameRow[];

      for (const resident of residents) {
        residentNames.set(
          resident.id,
          resident.full_name
        );
      }
    }
  }

  const alerts: ClinicalAlert[] = [];

  for (const vital of vitalRows) {
    const temperature = toNumber(
      vital.temperature
    );

    const oxygenSaturation = toNumber(
      vital.oxygen_saturation
    );

    const painScore = toNumber(
      vital.pain_score
    );

    const systolic = toNumber(
      vital.systolic
    );

    const diastolic = toNumber(
      vital.diastolic
    );

    const residentName =
      vital.resident_id === null
        ? null
        : residentNames.get(
            vital.resident_id
          ) ?? null;

    if (
      temperature !== null &&
      temperature > 38
    ) {
      alerts.push({
        type: "High Temperature",
        color: "red",
        resident: residentName,
        message: `${temperature}°C`,
      });
    }

    if (
      oxygenSaturation !== null &&
      oxygenSaturation < 92
    ) {
      alerts.push({
        type: "Low Oxygen",
        color: "red",
        resident: residentName,
        message: `${oxygenSaturation}%`,
      });
    }

    if (
      painScore !== null &&
      painScore >= 7
    ) {
      alerts.push({
        type: "Severe Pain",
        color: "orange",
        resident: residentName,
        message: `${painScore}/10`,
      });
    }

    if (
      systolic !== null &&
      systolic >= 180
    ) {
      alerts.push({
        type:
          "Critical Blood Pressure",
        color: "red",
        resident: residentName,
        message:
          diastolic === null
            ? `${systolic}`
            : `${systolic}/${diastolic}`,
      });
    }
  }

  return alerts;
}