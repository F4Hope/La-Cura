"use client";

import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type VitalRecord = {
  temperature?: string | number | null;
  pulse?: string | number | null;
  systolic?: string | number | null;
  diastolic?: string | number | null;
  oxygen_saturation?: string | number | null;
  pain_score?: string | number | null;
  recorded_at?: string | null;
};


type Props = {
  vitals: VitalRecord[];
};


const metrics = [
  {
    key: "blood_pressure",
    label: "BP",
  },
  {
    key: "temperature",
    label: "Temp",
  },
  {
    key: "pulse",
    label: "Pulse",
  },
  {
    key: "oxygen",
    label: "O2",
  },
  {
    key: "pain",
    label: "Pain",
  },
];


export default function ResidentVitalsTrend({
  vitals,
}: Props) {

  const [selected, setSelected] =
    useState("blood_pressure");


  const data =
    [...vitals]
      .reverse()
      .map((item) => ({
        date: item.recorded_at
          ? new Date(
              item.recorded_at
            ).toLocaleDateString(
              "en",
              {
                month: "short",
                day: "numeric",
              }
            )
          : "—",

        systolic:
          item.systolic,

        diastolic:
          item.diastolic,

        temperature:
          item.temperature,

        pulse:
          item.pulse,

        oxygen:
          item.oxygen_saturation,

        pain:
          item.pain_score,
      }));


  return (
    <div className="border border-[#D3DCD7] bg-white p-3">

      <div className="flex gap-2 border-b pb-2">

        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() =>
              setSelected(metric.key)
            }
            className={
              selected === metric.key
                ? "bg-[#073B2F] px-2 py-1 text-[10px] font-bold text-white"
                : "bg-[#F1F4F2] px-2 py-1 text-[10px] font-bold"
            }
          >
            {metric.label}
          </button>
        ))}

      </div>


      <div className="mt-4 h-[260px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
            />

            <YAxis />

            <Tooltip />


            {selected === "blood_pressure" ? (
              <>
                <Line
                  dataKey="systolic"
                  stroke="#073B2F"
                  strokeWidth={2}
                  dot
                />

                <Line
                  dataKey="diastolic"
                  stroke="#64748B"
                  strokeWidth={2}
                  dot
                />
              </>
            ) : (
              <Line
                dataKey={selected}
                stroke="#073B2F"
                strokeWidth={2}
                dot
              />
            )}

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}
