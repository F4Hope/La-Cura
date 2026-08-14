export const RESIDENT_TAB_KEYS = [
  "dash",
  "profile",
  "census",
  "med-diag",
  "allergies",
  "immun",
  "orders",
  "vitals",
  "results",
  "mds",
  "assmnts",
  "therapy",
  "prog-notes",
  "care-plan",
  "tasks",
  "misc",

] as const;

export type ResidentTabKey =
  (typeof RESIDENT_TAB_KEYS)[number];

const validResidentTabs =
  new Set<string>(
    RESIDENT_TAB_KEYS
  );

export function normalizeResidentTab(
  value: unknown
): ResidentTabKey {
  const raw =
    Array.isArray(value)
      ? value[0]
      : value;

  if (
    typeof raw === "string" &&
    validResidentTabs.has(raw)
  ) {
    return raw as ResidentTabKey;
  }

  return "dash";
}
