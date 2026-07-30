"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type Resident = {
  id: number;
  full_name: string;
  room: string;
  age: number;
};

type Props = {
  onResidentSelected: (resident: Resident) => void;
};

export default function ResidentSearch({
  onResidentSelected,
}: Props) {

  const [search, setSearch] = useState("");

  const [residents, setResidents] = useState<Resident[]>([]);

  useEffect(() => {

    async function loadResidents() {

      const { data } = await supabase
        .from("residents")
        .select("id, full_name, room, age")
        .order("full_name");

      if (data) {

        setResidents(data as Resident[]);

      }

    }

    loadResidents();

  }, []);

  const filtered = residents.filter((resident) =>
    resident.full_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div>

      <input
        type="text"
        placeholder="Search resident..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-xl p-3 w-full"
      />

      {search && (

        <div className="border rounded-xl mt-2 bg-white shadow max-h-64 overflow-y-auto">

          {filtered.map((resident) => (

            <button
              key={resident.id}
              type="button"
              onClick={() => {

                onResidentSelected(resident);

                setSearch(resident.full_name);

              }}
              className="w-full text-left p-3 hover:bg-gray-100 border-b"
            >

              <div className="font-medium">

                {resident.full_name}

              </div>

              <div className="text-sm text-gray-500">

                Room {resident.room}

              </div>

            </button>

          ))}

        </div>

      )}

    </div>

  );

}