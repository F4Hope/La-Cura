"use client";

import Image from "next/image";

import ResidentVitalsBox from "./ResidentVitalsBox";
import ResidentViewMode, {
  type ResidentViewMode as ViewMode,
} from "./ResidentViewMode";


type ResidentHeaderProps = {
  resident: {
    id: number;
    name: string;
    photo?: string | null;

    age?: string;
    sex?: string;
    room?: string;
    physician?: string;

    status?: string;

    allergies?: string;
    instructions?: string;

    diagnosis?: string;
    admission?: string;
    diet?: string;

    vitals: {
      label: string;
      value: string;
      time?: string;
    }[];
  };
};


export default function ResidentHeader({
  resident,
}: ResidentHeaderProps) {

  return (
    <section
      className="
        border
        border-[#C8D1CC]
        bg-white
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          border-b
          border-[#D8DFDB]
          px-4
          py-3
        "
      >

        <div
          className="
            flex
            gap-4
          "
        >

          <div
            className="
              relative
              h-20
              w-20
              overflow-hidden
              border
              border-[#C8D1CC]
              bg-[#EEF2EF]
            "
          >

            {resident.photo ? (

              <Image
                src={
                  resident.photo
                }
                alt={
                  resident.name
                }
                fill
                className="
                  object-cover
                "
              />

            ) : (

              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  text-2xl
                  font-bold
                  text-[#073B2F]
                "
              >
                {
                  resident.name.charAt(0)
                }
              </div>

            )}

          </div>


          <div>

            <h1
              className="
                text-xl
                font-bold
                text-[#142C25]
              "
            >
              {
                resident.name
              }
            </h1>


            <p
              className="
                text-xs
                text-[#68766F]
              "
            >
              Resident #
              {
                resident.id
              }
            </p>


            <div
              className="
                mt-3
                grid
                grid-cols-4
                gap-x-8
                text-xs
              "
            >

              <Info
                label="Age"
                value={
                  resident.age
                }
              />

              <Info
                label="Sex"
                value={
                  resident.sex
                }
              />

              <Info
                label="Room"
                value={
                  resident.room
                }
              />

              <Info
                label="Physician"
                value={
                  resident.physician
                }
              />

            </div>

          </div>

        </div>


        <ResidentViewMode />

      </div>


      <div
        className="
          px-4
          py-3
        "
      >

        <ResidentVitalsBox
          vitals={
            resident.vitals
          }
        />

      </div>


      <div
        className="
          grid
          grid-cols-4
          divide-x
          border-t
          border-[#D8DFDB]
          divide-[#D8DFDB]
        "
      >

        <Summary
          label="Diagnosis"
          value={
            resident.diagnosis
          }
        />


        <Summary
          label="Admission"
          value={
            resident.admission
          }
        />


        <Summary
          label="Diet"
          value={
            resident.diet
          }
        />


        <Summary
          label="Allergies"
          value={
            resident.allergies
          }
        />

      </div>


      <div
        className="
          bg-[#F8F8F5]
          px-4
          py-2
          text-xs
          text-[#44534D]
        "
      >

        <strong>
          Special Instructions:
        </strong>

        {" "}

        {
          resident.instructions ||
          "None recorded"
        }

      </div>


    </section>
  );
}



function Info({
  label,
  value,
}: {
  label:string;
  value?:string;
}) {

  return (

    <div>

      <p
        className="
          text-[10px]
          uppercase
          text-[#718078]
        "
      >
        {label}
      </p>

      <p
        className="
          font-semibold
          text-[#20362E]
        "
      >
        {
          value ||
          "—"
        }
      </p>

    </div>

  );
}



function Summary({
  label,
  value,
}: {
  label:string;
  value?:string;
}) {

  return (

    <div
      className="
        px-3
        py-2
      "
    >

      <p
        className="
          text-[10px]
          uppercase
          text-[#718078]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xs
          font-semibold
          text-[#243A32]
        "
      >
        {
          value ||
          "Not documented"
        }
      </p>

    </div>

  );
}
