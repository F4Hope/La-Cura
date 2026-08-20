"use client";

import { useState } from "react";

export type ResidentViewMode =
  | "compact"
  | "standard"
  | "expanded";


type Props = {
  onChange?: (
    mode: ResidentViewMode
  ) => void;
};


const modes: {
  key: ResidentViewMode;
  label: string;
}[] = [
  {
    key: "expanded",
    label: "Expanded",
  },
  {
    key: "standard",
    label: "Standard",
  },
  {
    key: "compact",
    label: "Compact",
  },
];


export default function ResidentViewMode({
  onChange,
}: Props) {

  const [active, setActive] =
    useState<ResidentViewMode>(
      "standard"
    );


  function changeMode(
    mode: ResidentViewMode
  ) {

    setActive(mode);

    onChange?.(
      mode
    );
  }


  return (
    <div
      className="
        inline-flex
        border
        border-[#C8D1CC]
        bg-[#F7F7F3]
      "
    >

      {modes.map(
        (mode) => (

          <button
            key={
              mode.key
            }
            onClick={() =>
              changeMode(
                mode.key
              )
            }
            className={`
              px-3
              py-1.5
              text-[11px]
              font-semibold
              transition-none

              ${
                active === mode.key
                  ? 
                    "bg-white text-[#073B2F] border-b-2 border-[#073B2F]"
                  :
                    "text-[#56655F] hover:bg-white"
              }
            `}
          >
            {mode.label}
          </button>

        )
      )}

    </div>
  );
}
