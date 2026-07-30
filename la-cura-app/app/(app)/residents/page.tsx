import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  UserPlus,
} from "lucide-react";

import { getResidents } from "@/lib/residents";

export default async function ResidentsPage() {

  const residents = await getResidents();

  return (

    <div className="min-h-screen bg-slate-100">

      {/* HERO */}

      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 rounded-b-[40px] shadow-2xl">

        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-white/10"></div>

        <div className="absolute -bottom-28 left-1/2 w-80 h-80 rounded-full bg-white/5"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-14">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            {/* LEFT */}

            <div>

              <span className="uppercase tracking-[5px] text-green-100 font-semibold">

                Resident Management

              </span>

              <h1 className="text-5xl font-black text-white mt-4">

                Residents

              </h1>

              <p className="text-green-100 text-xl mt-5 max-w-2xl leading-9">

                View, manage and monitor every resident from one
                centralized healthcare dashboard.

              </p>

            </div>

            {/* RIGHT */}

            <div className="bg-white/15 backdrop-blur-xl rounded-[30px] p-8 min-w-[320px]">

              <div className="grid grid-cols-2 gap-8">

                <div>

                  <Users
                    className="text-white mb-3"
                    size={34}
                  />

                  <h2 className="text-4xl font-black text-white">

                    {residents.length}

                  </h2>

                  <p className="text-green-100 mt-2">

                    Residents

                  </p>

                </div>

                <div>

                  <UserPlus
                    className="text-white mb-3"
                    size={34}
                  />

                  <h2 className="text-4xl font-black text-white">

                    24

                  </h2>

                  <p className="text-green-100 mt-2">

                    New This Month

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* SEARCH */}

        <div className="flex flex-col lg:flex-row gap-5 justify-between items-center mb-10">

          <div className="relative w-full lg:w-[450px]">

            <Search
              size={22}
              className="absolute left-5 top-5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search residents..."
              className="w-full h-16 rounded-2xl bg-white border border-gray-200 pl-14 pr-6 text-gray-700 placeholder:text-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          <Link href="/add-resident">

            <button className="h-16 px-8 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold flex items-center gap-3 shadow-xl transition">

              <Plus size={22} />

              Add Resident

            </button>

          </Link>

        </div>
                {/* ================= RESIDENT CARDS ================= */}

        {residents.length === 0 ? (

          <div className="bg-white rounded-[30px] shadow-xl py-24 text-center">

            <Users
              size={70}
              className="mx-auto text-green-600"
            />

            <h2 className="text-3xl font-black text-gray-900 mt-8">

              No Residents Yet

            </h2>

            <p className="text-gray-500 mt-4 text-lg">

              Start by adding your first resident to La-Cura.

            </p>

            <Link
              href="/add-resident"
              className="inline-flex items-center gap-3 mt-10 bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-bold transition"
            >

              <Plus size={20} />

              Add Resident

            </Link>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

            {residents.map((resident: any) => (

              <Link
                key={resident.id}
                href={`/residents/${resident.id}`}
                className="group bg-white rounded-[30px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >

                {/* Top Accent */}

                <div className="h-2 bg-green-600"></div>

                <div className="p-8">

                  {/* Avatar */}

                  <div className="flex items-center gap-5">

                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-white text-3xl font-black">

                      {resident.full_name?.charAt(0)}

                    </div>

                    <div>

                      <h2 className="text-2xl font-black text-gray-900">

                        {resident.full_name}

                      </h2>

                      <p className="text-gray-500 mt-2">

                        {resident.age} Years Old

                      </p>

                    </div>

                  </div>

                  {/* Status */}

                  <div className="mt-8">

                    <span className="inline-flex px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">

                      {resident.status}

                    </span>

                  </div>

                  {/* Details */}

                  <div className="grid grid-cols-2 gap-5 mt-8">

                    <div className="bg-gray-50 rounded-2xl p-4">

                      <p className="text-gray-400 text-sm">

                        Room

                      </p>

                      <h3 className="text-lg font-bold mt-1">

                        {resident.room}

                      </h3>

                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4">

                      <p className="text-gray-400 text-sm">

                        Contact

                      </p>

                      <h3 className="text-sm font-bold mt-1 break-words">

                        {resident.emergency_contact}

                      </h3>

                    </div>

                  </div>

                  {/* Footer */}

                  <div className="mt-8 flex items-center justify-between">

                    <span className="text-green-700 font-bold">

                      View Profile

                    </span>

                    <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-700 group-hover:text-white transition flex items-center justify-center">

                      →

                    </div>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}
              </main>

    </div>

  );

}