"use client";

import { useState } from "react";

type Vital = {
  label: string;
  value: string;
  time?: string;
};

type Props = {
  vitals: Vital[];
};

export default function ResidentVitalsBox({
  vitals,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full border border-[#C9D3CE] bg-white text-left hover:bg-[#F7F8F5]"
      >
        <div className="grid grid-cols-5 divide-x divide-[#D7DFDB]">
          {vitals.map((vital) => (
            <div
              key={vital.label}
              className="px-3 py-2"
            >
              <p className="text-[9px] font-bold uppercase text-[#66766F]">
                {vital.label}
              </p>

              <p className="mt-1 text-[15px] font-bold text-[#073B2F]">
                {vital.value}
              </p>

              {vital.time && (
                <p className="text-[9px] text-[#7A8982]">
                  {vital.time}
                </p>
              )}
            </div>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="absolute right-0 top-full z-30 mt-1 w-[420px] border border-[#C9D3CE] bg-white shadow-sm">
          <div className="border-b bg-[#EDF1EE] px-3 py-2 text-[11px] font-bold uppercase text-[#30463C]">
            Vital History
          </div>

          <div className="divide-y divide-[#E0E6E3]">
            {vitals.map((vital) => (
              <div
                key={vital.label}
                className="flex justify-between px-3 py-2 text-xs"
              >
                <span>{vital.label}</span>
                <strong>{vital.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
