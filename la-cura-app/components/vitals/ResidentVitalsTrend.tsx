"use client";

import { useState } from "react";


type Vital = {
  label: string;
  value?: string | number | null;
};


type Props = {
  vitals: Vital[];
};


export default function ResidentVitalsTrend({
  vitals,
}: Props) {

  const [selected, setSelected] =
    useState<Vital | null>(null);


  return (
    <>
      <div
        className="
          grid
          grid-cols-5
          border
          border-[#D3DCD7]
          bg-white
        "
      >

        {vitals.map((vital) => (

          <button
            key={vital.label}
            onClick={() =>
              setSelected(vital)
            }
            className="
              border-r
              border-[#D3DCD7]
              px-3
              py-3
              text-left
              hover:bg-[#F2F6F3]
            "
          >

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                text-[#718078]
              "
            >
              {vital.label}
            </div>


            <div
              className="
                mt-1
                text-sm
                font-bold
                text-[#073B2F]
              "
            >
              {vital.value || "—"}
            </div>

          </button>

        ))}

      </div>


      {selected && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/30
          "
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="
              w-[420px]
              border
              border-[#C9D3CE]
              bg-white
              p-5
              shadow-xl
            "
            onClick={(e)=>e.stopPropagation()}
          >

            <h2
              className="
                text-lg
                font-bold
                text-[#073B2F]
              "
            >
              {selected.label} Trend
            </h2>


            <div
              className="
                mt-4
                h-32
                border
                border-dashed
                border-[#BFCBC5]
                flex
                items-center
                justify-center
                text-xs
                text-[#64756D]
              "
            >
              Trend graph will display here
            </div>


            <button
              onClick={() =>
                setSelected(null)
              }
              className="
                mt-4
                border
                px-4
                py-2
                text-xs
              "
            >
              Close
            </button>

          </div>

        </div>

      )}

    </>
  );
}
