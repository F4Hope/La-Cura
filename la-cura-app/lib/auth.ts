import { supabase } from "./supabase/client";

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  return supabase.auth.getUser();
}

export async function getCurrentStaff() {

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) return null;

  const { data } = await supabase
    .from("staff")
    .select("*")
    .eq("auth_user_id", auth.user.id)
    .single();

  return data;

}