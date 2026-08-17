"use client";

import useAppUi from "@/components/i18n/useAppUi";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Stable",
    value: 18,
  },
  {
    name: "Needs Attention",
    value: 5,
  },
  {
    name: "Critical",
    value: 2,
  },
];

const COLORS = [
  "#16a34a",
  "#f59e0b",
  "#ef4444",
];

export default function ResidentStatusChart() {
  const { ui } =
    useAppUi();

  const localizedData =
    data.map((entry) => ({
      ...entry,
      name: ui(entry.name),
    }));


  return (

    <div className="bg-white rounded-[28px] shadow-xl p-8">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-900">

          {ui("Resident Status")}</h2>

        <p className="text-gray-500 mt-2">

          {ui("Overall health distribution")}</p>

      </div>

      <div className="h-[320px]">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={localizedData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
            >

              {localizedData.map((entry, index) => (

                <Cell
                  key={index}
                  fill={COLORS[index]}
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}