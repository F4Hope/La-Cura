import {
  createClient,
} from "@/lib/supabase/server";


export async function getCarePlans() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("care_plans")
    .select("*")
    .order(
      "review_date",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Unable to load care plans:",
      error.message
    );

    return [];
  }

  return data ?? [];
}
