import { supabase } from "@/lib/supabase/client";

export async function getClinicalAlerts() {

  const { data, error } = await supabase
    .from("vital_signs")
    .select(`
      *,
      residents(full_name)
    `)
    .order("recorded_at", { ascending: false })
    .limit(50);

  if (error) {
    console.log(error);
    return [];
  }

  const alerts = [];

  for (const vital of data) {

    if (vital.temperature > 38) {

      alerts.push({
        type: "High Temperature",
        color: "red",
        resident: vital.residents?.full_name,
        message: `${vital.temperature}°C`
      });

    }

    if (vital.oxygen_saturation < 92) {

      alerts.push({
        type: "Low Oxygen",
        color: "red",
        resident: vital.residents?.full_name,
        message: `${vital.oxygen_saturation}%`
      });

    }

    if (vital.pain_score >= 7) {

      alerts.push({
        type: "Severe Pain",
        color: "orange",
        resident: vital.residents?.full_name,
        message: `${vital.pain_score}/10`
      });

    }

    if (vital.systolic >= 180) {

      alerts.push({
        type: "Critical Blood Pressure",
        color: "red",
        resident: vital.residents?.full_name,
        message: `${vital.systolic}/${vital.diastolic}`
      });

    }

  }

  return alerts;

}