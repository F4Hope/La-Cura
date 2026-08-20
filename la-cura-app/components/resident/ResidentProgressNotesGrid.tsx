"use client";

import { useState } from "react";


type Note = {
  id: number | string;
  date?: string | null;
  type?: string | null;
  author?: string | null;
  department?: string | null;
  title?: string | null;
  subtitle?: string | null;
};


type Props = {
  notes: Note[];
};


export default function ResidentProgressNotesGrid({
  notes,
}: Props) {

  const [expanded, setExpanded] =
    useState<number | string | null>(null);


  function printNote(note: Note) {

    const win =
      window.open(
        "",
        "_blank"
      );

    if (!win) return;


    win.document.write(`
      <html>
      <body>
      <h2>${note.type || "Clinical Note"}</h2>
      <p>
      ${note.title || ""}
      </p>
      <p>
      ${note.subtitle || ""}
      </p>
      </body>
      </html>
    `);


    win.document.close();

    win.print();
  }


  return (

    <section
      className="
        border
        border-[#C8D3CE]
        bg-white
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          bg-[#EDF2EE]
          px-4
          py-3
        "
      >

        <div>

          <h2
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-[#073B2F]
            "
          >
            Progress Notes
          </h2>

          <p
            className="
              text-xs
              text-[#64756D]
            "
          >
            Clinical documentation history
          </p>

        </div>


        <button
          className="
            border
            bg-white
            px-4
            py-2
            text-xs
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
            text-xs
          "
        >

          <thead
            className="
              bg-[#F7F8F6]
              text-[10px]
              uppercase
              text-[#66776F]
            "
          >

            <tr>

              <th className="px-3 py-2 text-left">
                Action
              </th>

              <th className="px-3 py-2 text-left">
                Date
              </th>

              <th className="px-3 py-2 text-left">
                Type
              </th>

              <th className="px-3 py-2 text-left">
                Author
              </th>

              <th className="px-3 py-2 text-left">
                Note
              </th>

            </tr>

          </thead>


          <tbody>

          {notes.map((note)=>(

            <>

            <tr
              key={note.id}
              className="
                border-t
                hover:bg-[#FAFBF8]
              "
            >

              <td className="px-3 py-3">

                <button
                  onClick={() =>
                    setExpanded(
                      expanded === note.id
                      ? null
                      : note.id
                    )
                  }
                  className="
                    mr-3
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


              <td className="px-3 py-3">
                {note.date || "—"}
              </td>


              <td className="px-3 py-3 font-semibold">
                {note.type || "—"}
              </td>


              <td className="px-3 py-3">
                {note.author || "—"}
              </td>


              <td className="max-w-xl px-3 py-3">

                <div className="truncate">
                  {note.title || "No details"}
                </div>

              </td>


            </tr>


            {expanded === note.id && (

              <tr
                key={`${note.id}-open`}
              >

                <td
                  colSpan={5}
                  className="
                    bg-[#F8FAF8]
                    px-5
                    py-4
                  "
                >

                  <div
                    className="
                      text-sm
                      leading-6
                      text-[#33483F]
                    "
                  >

                    {note.title}

                    <br />

                    {note.subtitle}

                  </div>

                </td>

              </tr>

            )}

            </>

          ))}

          </tbody>


        </table>

      </div>

    </section>

  );
}
