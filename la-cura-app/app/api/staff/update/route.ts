import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function POST(req:Request){

  const body=await req.json();

  const {id,...updates}=body;

  const {error}=await adminSupabase
    .from("staff")
    .update(updates)
    .eq("id",id);

  if(error){

    return NextResponse.json(
      {error:error.message},
      {status:400}
    );

  }

  return NextResponse.json({
    success:true
  });

}