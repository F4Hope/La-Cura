import { supabase } from "@/lib/supabase/client";

export default async function ResidentDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;


  const { data: resident, error } = await supabase
    .from("residents")
    .select("*")
    .eq("id", id)
    .single();


  if (error || !resident) {
    return (
      <div className="p-8">
        Resident not found
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100">


      <header className="bg-green-700 text-white p-6">

        <h1 className="text-3xl font-bold">
          Resident Profile
        </h1>

      </header>



      <section className="p-8">


        <div className="bg-white rounded-2xl shadow p-8 max-w-xl">


          <h2 className="text-2xl font-bold mb-6">
            {resident.full_name}
          </h2>


          <p className="mb-3">
            <b>Room:</b> {resident.room}
          </p>


          <p className="mb-3">
            <b>Age:</b> {resident.age}
          </p>


          <p className="mb-3">
            <b>Status:</b> {resident.status}
          </p>


          <p>
            <b>Emergency Contact:</b> {resident.emergency_contact}
          </p>


        </div>


      </section>


    </div>
  );
}