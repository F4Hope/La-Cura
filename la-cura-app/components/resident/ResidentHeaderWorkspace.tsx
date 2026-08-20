"use client";

import Image from "next/image";

import {
  useResidentWorkspace,
} from "./ResidentWorkspaceMode";


type Props = {
  name: string;
  photo?: string | null;
  room?: string | null;
  age?: string | number | null;
  gender?: string | null;
  physician?: string | null;
  diagnosis?: string | null;
  admission?: string | null;
  diet?: string | null;
  record?: string | null;
};


export default function ResidentHeaderWorkspace({
  name,
  photo,
  room,
  age,
  gender,
  physician,
  diagnosis,
  admission,
  diet,
  record,
}: Props) {

  const {
    mode,
  } = useResidentWorkspace();


  return (
    <section
      className="
        border
        border-[#C9D3CE]
        bg-white
      "
    >

      <div
        className={`
          flex
          gap-4
          p-4
          ${mode === "compact"
            ? "items-center"
            : "items-start"
          }
        `}
      >

        <div
          className="
            h-20
            w-20
            overflow-hidden
            border
            border-[#D2DBD6]
            bg-[#EEF2EE]
          "
        >
          {photo ? (
            <Image
              src={photo}
              alt={name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-xl
                font-bold
                text-[#073B2F]
              "
            >
              {name.charAt(0)}
            </div>
          )}
        </div>


        <div className="flex-1">

          <h1
            className="
              text-xl
              font-bold
              text-[#073B2F]
            "
          >
            {name}
          </h1>


          {mode !== "compact" && (

            <div
              className="
                mt-3
                grid
                gap-3
                text-xs
                md:grid-cols-4
              "
            >

              <div>
                <b>DOB / AGE</b>
                <br />
                {age || "Not recorded"}
              </div>

              <div>
                <b>SEX</b>
                <br />
                {gender || "Not recorded"}
              </div>

              <div>
                <b>ROOM</b>
                <br />
                {room || "Not recorded"}
              </div>

              <div>
                <b>PHYSICIAN</b>
                <br />
                {physician || "Not assigned"}
              </div>

            </div>

          )

          }

        </div>

      </div>


      {mode === "expanded" && (

        <div
          className="
            grid
            border-t
            border-[#D4DDD8]
            md:grid-cols-4
          "
        >

          <Info
            label="Diagnosis"
            value={diagnosis}
          />

          <Info
            label="Diet"
            value={diet}
          />

          <Info
            label="Admission"
            value={admission}
          />

          <Info
            label="Medical Record"
            value={record}
          />

        </div>

      )}

    </section>
  );
}


function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {

  return (
    <div
      className="
        border-r
        border-[#D4DDD8]
        px-3
        py-3
        text-xs
      "
    >
      <div
        className="
          font-bold
          uppercase
          text-[#738078]
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1
          font-semibold
          text-[#243A32]
        "
      >
        {value || "Not recorded"}
      </div>

    </div>
  );
}
