"use client";

import {
  useResidentWorkspace,
} from "./ResidentWorkspaceMode";


export default function ResidentModeSelector() {

  const {
    mode,
    setMode,
  } =
    useResidentWorkspace();


  const modes = [
    {
      key:"expanded",
      label:"Expanded",
    },
    {
      key:"standard",
      label:"Standard",
    },
    {
      key:"compact",
      label:"Compact",
    },
  ];


  return (
    <div className="flex border border-[#C8D1CC] bg-white">

      {modes.map((item)=>(

        <button
          key={item.key}
          onClick={() =>
            setMode(
              item.key as any
            )
          }
          className={`
            px-3
            py-1
            text-[10px]
            font-bold
            ${
              mode === item.key
              ?
              "bg-[#073B2F] text-white"
              :
              "text-[#40534C]"
            }
          `}
        >
          {item.label}
        </button>

      ))}

    </div>
  );
}
