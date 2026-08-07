import { supabase } from "@/lib/supabase/client";

type OfflineVitalRecord = Record<
  string,
  unknown
>;

function normalizeVitalRecord(
  record: OfflineVitalRecord
): OfflineVitalRecord {
  const {
    created_at,
    ...rest
  } = record;

  return {
    ...rest,

    recorded_at:
      rest.recorded_at ??
      created_at ??
      new Date().toISOString(),
  };
}

export async function syncOfflineData() {
  if (
    typeof window === "undefined" ||
    !navigator.onLine
  ) {
    return;
  }

  const key =
    "offline_vital_signs";

  let stored:
    OfflineVitalRecord[] = [];

  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return;
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      localStorage.removeItem(
        key
      );

      return;
    }

    stored =
      parsed as OfflineVitalRecord[];
  } catch {
    return;
  }

  if (stored.length === 0) {
    return;
  }

  /*
   * Backward compatibility:
   *
   * Older offline vital records may
   * contain `created_at`.
   *
   * The vital_signs table uses
   * `recorded_at`, so normalize old
   * queued records before syncing.
   */
  const normalized =
    stored.map(
      normalizeVitalRecord
    );

  const {
    error,
  } = await supabase
    .from("vital_signs")
    .insert(normalized);

  if (error) {
    console.error(
      "Offline vital-sign sync failed:",
      error.message
    );

    return;
  }

  localStorage.removeItem(key);
}