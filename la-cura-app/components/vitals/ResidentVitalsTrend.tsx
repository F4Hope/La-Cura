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
    useState("7");


  const filteredHistory =
    useMemo(() => {

      const days =
        Number(range);

      return history.slice(
        0,
        days === 30
          ? 30
          : days
      );

    }, [
      history,
      range,
    ]);


  function getValue(
    vital: VitalCard,
    row: VitalRecord
  ) {

    switch(vital.key){

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
          bg-[#CBD6D1]
        "
      >

        {vitals.map((v)=>(

          <button
            key={v.label}
            onClick={() =>
              setSelected(v)
            }
            className="
              bg-white
              p-3
              text-left
              transition
              hover:bg-[#EEF4F0]
            "
          >

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                text-[#6A7B73]
              "
            >
              {v.label}
            </div>


            <div
              className="
                mt-1
                text-sm
                font-bold
                text-[#073B2F]
              "
            >
              {v.value || "—"}
            </div>

          </button>

        ))}

      </div>


      {selected && (

        <div
          className="
            fixed
            inset-0
            z-[100]
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
              w-[650px]
              bg-white
              shadow-2xl
            "
            onClick={(e)=>
              e.stopPropagation()
            }
          >

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-5
                py-4
              "
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

              {["1","7","30"].map((x)=>(

                <button
                  key={x}
                  onClick={() =>
                    setRange(x)
                  }
                  className={`
                    border
                    px-3
                    py-1
                    text-xs
                    ${
                      range===x
                      ? "bg-[#073B2F] text-white"
                      : "bg-white"
                    }
                  `}
                >
                  {x} Days
                </button>

              ))}

              <button
                onClick={() =>
                  window.print()
                }
                className="
                  ml-auto
                  border
                  px-3
                  py-1
                  text-xs
                "
              >
                Print
              </button>

            </div>


            <div
              className="
                m-5
                flex
                h-44
                items-end
                gap-4
                border
                bg-[#F7F8F5]
                p-5
              "
            >

              {filteredHistory.map(
                (row,index)=>(

                <div
                  key={index}
                  className="
                    flex
                    h-full
                    flex-1
                    items-end
                  "
                >

                  <div
                    className="
                      w-full
                      bg-[#073B2F]
                    "
                    style={{
                      height:
                        `${30 + index * 12}px`,
                    }}
                  />

                </div>

              ))}

            </div>


            <div
              className="
                border-t
              "
            >

              {filteredHistory.map(
                (row,index)=>(

                <div
                  key={index}
                  className="
                    grid
                    grid-cols-3
                    border-b
                    px-5
                    py-2
                    text-xs
                  "
                >

                  <span>
                    {row.recorded_at || "—"}
                  </span>

                  <span>
                    {getValue(
                      selected,
                      row
                    )}
                  </span>

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
