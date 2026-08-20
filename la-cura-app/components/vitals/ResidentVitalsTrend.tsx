"use client";

import { useMemo, useState } from "react";


type VitalRecord = {
  recorded_at?: string | null;
  systolic?: number | null;
  diastolic?: number | null;
  temperature?: number | null;
  pulse?: number | null;
  oxygen_saturation?: number | null;
  pain_score?: number | null;
};


type VitalCard = {
  label: string;
  key:
    | "bp"
    | "temperature"
    | "pulse"
    | "oxygen"
    | "pain";
  value?: string | number | null;
};


type Props = {
  vitals: VitalCard[];
  history: VitalRecord[];
};


export default function ResidentVitalsTrend({
  vitals,
  history,
}: Props) {

  const [selected, setSelected] =
    useState<VitalCard | null>(null);

  const [range, setRange] =
    useState(7);


  const rows =
    useMemo(() => {
      return history.slice(
        0,
        range
      );
    }, [
      history,
      range,
    ]);


  function valueFor(
    vital: VitalCard,
    row: VitalRecord
  ) {

    switch(vital.key) {

      case "bp":
        return row.systolic &&
          row.diastolic
          ? `${row.systolic}/${row.diastolic}`
          : "—";

      case "temperature":
        return row.temperature
          ? `${row.temperature}°C`
          : "—";

      case "pulse":
        return row.pulse ?? "—";

      case "oxygen":
        return row.oxygen_saturation
          ? `${row.oxygen_saturation}%`
          : "—";

      case "pain":
        return row.pain_score ?? "—";
    }
  }


  return (
    <>

      <div
        className="
          grid
          grid-cols-5
          gap-px
          bg-[#C9D3CE]
        "
      >

        {vitals.map((vital)=>(

          <button
            key={vital.label}
            onClick={() =>
              setSelected(vital)
            }
            className="
              bg-white
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
                text-[#687970]
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
            bg-black/40
          "
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="
              w-[720px]
              max-w-[95vw]
              bg-white
              shadow-xl
            "
            onClick={(e)=>
              e.stopPropagation()
            }
          >

            <div
              className="
                flex
                justify-between
                border-b
                bg-[#073B2F]
                px-5
                py-4
                text-white
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                  "
                >
                  {selected.label} Trend
                </h2>

                <p
                  className="
                    text-xs
                    opacity-80
                  "
                >
                  Vital history review
                </p>

              </div>


              <button
                onClick={() =>
                  setSelected(null)
                }
              >
                ✕
              </button>

            </div>


            <div
              className="
                flex
                gap-2
                border-b
                p-3
              "
            >

              {[1,7,30].map((days)=>(

                <button
                  key={days}
                  onClick={() =>
                    setRange(days)
                  }
                  className={`
                    border
                    px-3
                    py-1
                    text-xs
                    ${
                      range === days
                      ? "bg-[#D5A437] font-bold"
                      : ""
                    }
                  `}
                >
                  {days} Days
                </button>

              ))}


              <button
                className="
                  ml-auto
                  border
                  px-3
                  py-1
                  text-xs
                "
                onClick={() =>
                  window.print()
                }
              >
                Print
              </button>

            </div>


            <div
              className="
                max-h-[420px]
                overflow-auto
              "
            >

              {rows.length === 0 && (

                <div
                  className="
                    p-8
                    text-center
                    text-sm
                    text-[#65756D]
                  "
                >
                  No vital history available
                </div>

              )}


              {rows.map((row,index)=>(

                <div
                  key={index}
                  className="
                    grid
                    grid-cols-3
                    border-b
                    px-5
                    py-3
                    text-xs
                  "
                >

                  <span>
                    {row.recorded_at || "—"}
                  </span>

                  <strong>
                    {valueFor(
                      selected,
                      row
                    )}
                  </strong>

                  <span>
                    Clinical Record
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </>
  );
}
