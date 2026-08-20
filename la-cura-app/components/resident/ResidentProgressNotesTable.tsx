"use client";

import { useState } from "react";


type Note = {
  id: string | number;
  date?: string;
  type?: string;
  author?: string;
  department?: string;
  text?: string;
};


type Props = {
  notes: Note[];
};


export default function ResidentProgressNotesTable({
  notes,
}: Props) {

  const [open, setOpen] =
    useState<string | number | null>(null);


  function printNote(note: Note) {

    const windowPrint =
      window.open("", "_blank");

    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <body>
          <h2>Progress Note</h2>
          <p>${note.text || ""}</p>
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.print();
  }


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
          items-center
          justify-between
          border-b
          border-[#D5DDD9]
          bg-[#EDF1EE]
          px-3
          py-2
        "
      >

        <h2
          className="
            text-xs
            font-bold
            uppercase
            text-[#30463C]
          "
        >
          Progress Notes
        </h2>


        <button
          className="
            border
            border-[#AEBBB4]
            bg-white
            px-3
            py-1
            text-[11px]
            font-semibold
          "
        >
          Add Note
        </button>

      </div>


      <div className="overflow-x-auto">

        <table
          className="
            w-full
            text-left
            text-xs
          "
        >

          <thead
            className="
              bg-[#F7F8F5]
              text-[10px]
              uppercase
              text-[#65756E]
            "
          >

            <tr>

              <th className="px-3 py-2">
                Action
              </th>

              <th className="px-3 py-2">
                Date
              </th>

              <th className="px-3 py-2">
                Type
              </th>

              <th className="px-3 py-2">
                Department
              </th>

              <th className="px-3 py-2">
                Note
              </th>

            </tr>

          </thead>


          <tbody>

            {notes.map((note)=>(

              <tr
                key={note.id}
                className="
                  border-t
                  border-[#E1E6E3]
                  hover:bg-[#FAFBF8]
                "
              >

                <td
                  className="
                    px-3
                    py-2
                    whitespace-nowrap
                  "
                >

                  <button
                    onClick={() =>
                      setOpen(
                        open === note.id
                        ? null
                        : note.id
                      )
                    }
                    className="
                      mr-2
                      text-[#073B2F]
                      underline
                    "
                  >
                    View
                  </button>


                  <button
                    onClick={() =>
                      printNote(note)
                    }
                    className="
                      text-[#073B2F]
                      underline
                    "
                  >
                    Print
                  </button>

                </td>


                <td className="px-3 py-2">
                  {note.date || "—"}
                </td>


                <td className="px-3 py-2">
                  {note.type || "—"}
                </td>


                <td className="px-3 py-2">
                  {note.department || "—"}
                </td>


                <td className="max-w-xl px-3 py-2">

                  {open === note.id ? (

                    <div>
                      {note.text || "No details"}
                    </div>

                  ) : (

                    <div className="truncate">
                      {note.text || "No details"}
                    </div>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}
