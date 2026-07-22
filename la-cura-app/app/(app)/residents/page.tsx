import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getResidents } from "@/lib/residents";


export default async function ResidentsPage() {

  const residents = await getResidents();


  return (

    <>

      <header className="bg-green-700 text-white p-5 shadow">

        <h1 className="text-3xl font-bold">
          Residents
        </h1>

        <p className="text-green-100">
          Manage all residents in the facility
        </p>

      </header>



      <section className="p-8">


        <div className="flex justify-between items-center mb-8">


          <div className="relative">

            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search residents..."
              className="pl-10 pr-4 py-3 w-80 rounded-xl border"
            />

          </div>



          <Link href="/add-resident">

            <button className="bg-green-700 text-white px-5 py-3 rounded-xl flex items-center gap-2">

              <Plus size={20}/>
              Add Resident

            </button>

          </Link>


        </div>



        <div className="bg-white rounded-2xl shadow overflow-hidden">


          <table className="w-full">


            <thead className="bg-green-700 text-white">

              <tr>

                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Room</th>
                <th className="p-4 text-left">Age</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Emergency Contact</th>

              </tr>

            </thead>



            <tbody>


              {residents.map((resident) => (

                <tr
                  key={resident.id}
                  className="border-b hover:bg-gray-50"
                >


                  <td className="p-4">

                    <Link
                      href={`/residents/${resident.id}`}
                      className="text-green-700 font-semibold hover:underline"
                    >

                      {resident.full_name}

                    </Link>

                  </td>


                  <td className="p-4">
                    {resident.room}
                  </td>


                  <td className="p-4">
                    {resident.age}
                  </td>


                  <td className="p-4">
                    {resident.status}
                  </td>


                  <td className="p-4">
                    {resident.emergency_contact}
                  </td>


                </tr>

              ))}


            </tbody>


          </table>



          {residents.length === 0 && (

            <div className="p-8 text-center text-gray-500">

              No residents found

            </div>

          )}


        </div>


      </section>


    </>

  );

}