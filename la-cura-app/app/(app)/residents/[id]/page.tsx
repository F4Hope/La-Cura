import { notFound } from "next/navigation";
import Link from "next/link";
import {
  User,
  BedDouble,
  Calendar,
  HeartPulse,
  Pill,
  FileText,
  ClipboardList,
  Activity,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { getResidentTimeline } from "@/lib/residentTimeline";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ResidentPage({ params }: Props) {

  const { id } = await params;

  const { data: resident } = await supabase
    .from("residents")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!resident) {

    notFound();

  }

  const timeline = await getResidentTimeline(Number(id));

  return (

    <div className="min-h-screen bg-gray-100">

      <header className="bg-green-700 text-white p-6">

        <h1 className="text-2xl md:text-4xl font-bold">

          {resident.full_name}

        </h1>

        <p className="text-green-100 mt-2">

          Room {resident.room} • {resident.age} Years

        </p>

      </header>

      <section className="p-4 md:p-8">

        <div className="bg-white rounded-2xl shadow p-6">

          <div className="flex items-center gap-4">

            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">

              <User
                size={40}
                className="text-green-700"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold">

                {resident.full_name}

              </h2>

              <p className="text-gray-500">

                {resident.gender}

              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">

            <div className="bg-gray-50 rounded-xl p-4">

              <BedDouble className="text-green-700"/>

              <p className="mt-2 text-gray-500">

                Room

              </p>

              <strong>

                {resident.room}

              </strong>

            </div>

            <div className="bg-gray-50 rounded-xl p-4">

              <Calendar className="text-blue-700"/>

              <p className="mt-2 text-gray-500">

                Age

              </p>

              <strong>

                {resident.age}

              </strong>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">

          <Link
            href="/add-vitals"
            className="bg-white rounded-2xl shadow p-5 text-center"
          >

            <HeartPulse
              className="mx-auto text-red-600"
              size={30}
            />

            <p className="mt-3 font-semibold">

              Record Vitals

            </p>

          </Link>

          <Link
            href="/add-medication"
            className="bg-white rounded-2xl shadow p-5 text-center"
          >

            <Pill
              className="mx-auto text-orange-600"
              size={30}
            />

            <p className="mt-3 font-semibold">

              Medication

            </p>

          </Link>

          <Link
            href="/add-nursing-note"
            className="bg-white rounded-2xl shadow p-5 text-center"
          >

            <FileText
              className="mx-auto text-blue-600"
              size={30}
            />

            <p className="mt-3 font-semibold">

              Nursing Note

            </p>

          </Link>

          <Link
            href="/care-plans"
            className="bg-white rounded-2xl shadow p-5 text-center"
          >

            <ClipboardList
              className="mx-auto text-purple-600"
              size={30}
            />

            <p className="mt-3 font-semibold">

              Care Plan

            </p>

          </Link>

        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">

          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">

            <Activity className="text-green-700"/>

            Clinical Timeline

          </h2>

          {timeline.length===0 && (

            <p className="text-gray-500">

              No clinical records available.

            </p>

          )}

          {timeline.map((item,index)=>(

            <div
              key={index}
              className="border-l-4 border-green-600 pl-5 mb-6"
            >

              <div className="font-bold">

                {item.icon} {item.type}

              </div>

              <div className="text-sm text-gray-500">

                {new Date(item.date).toLocaleString()}

              </div>

              <div className="mt-2 font-semibold">

                {item.title}

              </div>

              <div className="text-gray-600">

                {item.subtitle}

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>

  );

}