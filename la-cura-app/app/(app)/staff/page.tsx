"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  UserCog,
  Stethoscope,
} from "lucide-react";

import { getStaff } from "@/lib/staff";

import AddStaffModal from "@/components/AddStaffModal";
import EditStaffModal from "@/components/EditStaffModal";
import DeactivateStaffButton from "@/components/DeactivateStaffButton";
import ResetPasswordButton from "@/components/ResetPasswordButton";

export default function StaffPage() {

  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {

    const data = await getStaff();

    setStaff(data);

  }

  const filtered = useMemo(() => {

    return staff.filter((person) =>
      person.full_name.toLowerCase().includes(search.toLowerCase()) ||
      person.email.toLowerCase().includes(search.toLowerCase()) ||
      person.role.toLowerCase().includes(search.toLowerCase())
    );

  }, [staff, search]);

  const nurses = staff.filter((s) => s.role === "Nurse").length;
  const physicians = staff.filter((s) => s.role === "Physician").length;
  const administrators = staff.filter((s) => s.role === "Administrator").length;

  return (

    <div className="min-h-screen bg-slate-100">

      {/* HERO */}

      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 rounded-b-[40px] shadow-2xl">

        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10"></div>

        <div className="absolute -bottom-24 left-1/2 w-80 h-80 rounded-full bg-white/5"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-14">

          <div className="flex flex-col lg:flex-row justify-between gap-10">

            <div>

              <span className="uppercase tracking-[5px] text-green-100 font-semibold">

                Staff Management

              </span>

              <h1 className="text-5xl font-black text-white mt-4">

                Healthcare Team

              </h1>

              <p className="text-green-100 text-xl mt-5 max-w-2xl leading-9">

                Manage administrators, nurses and physicians
                responsible for delivering exceptional care.

              </p>

            </div>

            <div className="bg-white/15 backdrop-blur-xl rounded-[30px] p-8 min-w-[350px]">

              <div className="grid grid-cols-2 gap-8">

                <div>

                  <Users className="text-white mb-3" size={32} />

                  <h2 className="text-4xl font-black text-white">

                    {staff.length}

                  </h2>

                  <p className="text-green-100">

                    Total Staff

                  </p>

                </div>

                <div>

                  <UserCog className="text-white mb-3" size={32} />

                  <h2 className="text-4xl font-black text-white">

                    {administrators}

                  </h2>

                  <p className="text-green-100">

                    Administrators

                  </p>

                </div>

                <div>

                  <ShieldCheck className="text-white mb-3" size={32} />

                  <h2 className="text-4xl font-black text-white">

                    {nurses}

                  </h2>

                  <p className="text-green-100">

                    Nurses

                  </p>

                </div>

                <div>

                  <Stethoscope className="text-white mb-3" size={32} />

                  <h2 className="text-4xl font-black text-white">

                    {physicians}

                  </h2>

                  <p className="text-green-100">

                    Physicians

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <main className="max-w-7xl mx-auto px-8 py-10">

        <div className="flex flex-col lg:flex-row gap-5 justify-between items-center mb-10">

          <div className="relative w-full lg:w-[450px]">

            <Search
              className="absolute left-5 top-5 text-gray-400"
              size={22}
            />

            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search staff..."
              className="w-full h-16 rounded-2xl bg-white border border-gray-200 pl-14 pr-6 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          <button
            onClick={()=>setAddOpen(true)}
            className="h-16 px-8 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold flex items-center gap-3 shadow-xl transition"
          >

            <UserPlus size={22}/>

            Add Staff

          </button>

        </div>
                {/* ================= STAFF DIRECTORY ================= */}

        {filtered.length === 0 ? (

          <div className="bg-white rounded-[30px] shadow-xl py-24 text-center">

            <ShieldCheck
              size={70}
              className="mx-auto text-green-600"
            />

            <h2 className="text-3xl font-black text-gray-900 mt-8">

              No Staff Found

            </h2>

            <p className="text-gray-500 mt-4 text-lg">

              There are currently no staff members matching your search.

            </p>

          </div>

        ) : (

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">

            {filtered.map((person) => (

              <div
                key={person.id}
                className="group bg-white rounded-[30px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >

                <div className="h-2 bg-green-600"></div>

                <div className="p-8">

                  {/* Avatar */}

                  <div className="flex items-center gap-5">

                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-white text-3xl font-black">

                      {person.full_name?.charAt(0)}

                    </div>

                    <div>

                      <h2 className="text-2xl font-black text-gray-900">

                        {person.full_name}

                      </h2>

                      <p className="text-gray-500 mt-2">

                        {person.email}

                      </p>

                    </div>

                  </div>

                  {/* Role */}

                  <div className="mt-8 flex items-center justify-between">

                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">

                      {person.role}

                    </span>

                    {person.active ? (

                      <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">

                        Active

                      </span>

                    ) : (

                      <span className="px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold">

                        Inactive

                      </span>

                    )}

                  </div>

                  {/* Actions */}

                  <div className="grid grid-cols-2 gap-3 mt-8">

                    <button
                      onClick={()=>{
                        setSelectedStaff(person);
                        setEditOpen(true);
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold transition"
                    >

                      Edit

                    </button>

                    <ResetPasswordButton
                      email={person.email}
                    />

                  </div>

                  <div className="mt-3">

                    <DeactivateStaffButton
                      id={person.id}
                      active={person.active}
                    />

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}
              </main>

      {/* ================= MODALS ================= */}

      <AddStaffModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          loadStaff();
        }}
      />

      <EditStaffModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          loadStaff();
        }}
        staff={selectedStaff}
      />

    </div>

  );

}