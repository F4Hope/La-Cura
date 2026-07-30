import { supabase } from "@/lib/supabase/client";

export async function getResidents() {

  const { data, error } = await supabase
    .from("residents")
    .select("id, full_name, room, age")
    .order("full_name");

  if (error) {

    console.log(error);

    return [];

  }

  return data;

}