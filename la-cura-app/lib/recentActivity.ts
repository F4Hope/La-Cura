import {
  createClient,
} from "@/lib/supabase/server";

type VitalActivityRow = {
  id: number;
  resident_id: number | null;
  recorded_at: string | null;
  recorded_by: string | null;
};

type ResidentNameRow = {
  id: number;
  full_name: string | null;
};

export async function getRecentMedicationActivity() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "medication_administration"
    )
    .select(`
      id,
      status,
      administered_at,
      administered_by,
      residents (
        full_name
      ),
      medications (
        medication_name
      )
    `)
    .order(
      "administered_at",
      {
        ascending: false,
      }
    )
    .limit(5);

  if (error) {
    console.error(
      "Unable to load recent medication activity:",
      error.message
    );

    return [];
  }

  return data ?? [];
}

export async function getRecentVitalActivity() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("vital_signs")
    .select(`
      id,
      resident_id,
      recorded_at,
      recorded_by
    `)
    .order(
      "recorded_at",
      {
        ascending: false,
      }
    )
    .limit(5);

  if (error) {
    console.error(
      "Unable to load recent vital-sign activity:",
      error.message
    );

    return [];
  }

  const vitalRows =
    (data ?? []) as VitalActivityRow[];

  const residentIds = [
    ...new Set(
      vitalRows
        .map(
          (row) =>
            row.resident_id
        )
        .filter(
          (
            id
          ): id is number =>
            typeof id ===
            "number"
        )
    ),
  ];

  if (
    residentIds.length === 0
  ) {
    return vitalRows.map(
      (row) => ({
        ...row,
        residents: null,
      })
    );
  }

  const {
    data: residentData,
    error: residentError,
  } = await supabase
    .from("residents")
    .select(
      "id, full_name"
    )
    .in(
      "id",
      residentIds
    );

  if (residentError) {
    console.error(
      "Unable to resolve resident names for recent vital-sign activity:",
      residentError.message
    );

    return vitalRows.map(
      (row) => ({
        ...row,
        residents: null,
      })
    );
  }

  const residents =
    (residentData ??
      []) as ResidentNameRow[];

  const residentNames =
    new Map(
      residents.map(
        (resident) => [
          resident.id,
          resident.full_name,
        ]
      )
    );

  return vitalRows.map(
    (row) => ({
      ...row,

      residents:
        row.resident_id ===
        null
          ? null
          : {
              full_name:
                residentNames.get(
                  row.resident_id
                ) ?? null,
            },
    })
  );
}