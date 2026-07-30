import { supabase } from "./supabase/client";

export async function getMedications() {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .order("time_to_take", { ascending: true });

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}

export async function getResidentMedications(residentId: number) {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("resident_id", residentId)
    .order("time_to_take", { ascending: true });

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}

export async function addMedication(medication: any) {
  const { error } = await supabase
    .from("medications")
    .insert([medication]);

  return error;
}

export async function updateMedication(id: number, updates: any) {
  const { error } = await supabase
    .from("medications")
    .update(updates)
    .eq("id", id);

  return error;
}

export async function deleteMedication(id: number) {
  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", id);

  return error;
}