import { supabase } from "@/lib/supabase/client";

export async function syncOfflineData() {

  if (!navigator.onLine) {
    return;
  }

  const key = "offline_vital_signs";

  const stored = JSON.parse(
    localStorage.getItem(key) || "[]"
  );


  if (stored.length === 0) {
    return;
  }


  const { error } = await supabase
    .from("vital_signs")
    .insert(stored);


  if (error) {

    console.log(
      "Sync failed:",
      error.message
    );

    return;

  }


  localStorage.removeItem(key);


  console.log(
    "Offline data synced successfully"
  );

}