"use client";

import { useMemo, useState } from "react";


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

  const [expanded,setExpanded] =
    useState<number|string|null>(null);

  const [search,setSearch] =
    useState("");

  const [filter,setFilter] =
    useState("All");


  const filtered =
    useMemo(()=>{

      return notes.filter((note)=>{

        const matchesSearch =
          `${note.type}
          ${note.title}
          ${note.subtitle}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );


        const matchesType =
          filter === "All" ||
          note.type === filter;


        return (
          matchesSearch &&
          matchesType
        );

      });

    },[
      notes,
      search,
      filter
    ]);


  function printReport(){

    const win =
      window.open(
        "",
        "_blank"
      );

    if(!win) return;


    win.document.write(`
      <h1>Progress Notes Report</h1>
      ${filtered.map(note=>`
        <hr/>
        <h3>${note.type || ""}</h3>
        <p>${note.title || ""}</p>
        <p>${note.subtitle || ""}</p>
      `).join("")}
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
          border-b
          bg-[#E7EDE9]
          p-3
        "
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
          "
        >

          <div>

            <h2
              className="
                text-sm
                font-bold
                uppercase
                text-[#073B2F]
              "
            >
              Progress Notes
            </h2>

            <p
              className="
                text-xs
                text-[#687970]
              "
            >
              Clinical documentation history
            </p>

          </div>


          <button
            onClick={printReport}
            className="
              border
              bg-white
              px-3
              py-1.5
              text-xs
              font-semibold
            "
          >
            Print Report
          </button>

        </div>


        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >

          <input
            value={search}
            onChange={(e)=>
              setSearch(e.target.value)
            }
            placeholder="Search notes..."
            className="
              border
              px-3
              py-1.5
              text-xs
            "
          />


          <select
            value={filter}
            onChange={(e)=>
              setFilter(e.target.value)
            }
            className="
              border
              px-3
              py-1.5
              text-xs
            "
          >

            <option>
              All
            </option>

            {Array.from(
              new Set(
                notes.map(
                  n=>n.type
                )
              )
            )
            .filter(Boolean)
            .map(type=>(

              <option
                key={type}
              >
                {type}
              </option>

            ))}

          </select>

        </div>

      </div>


      <div
        className="
          overflow-x-auto
        "
      >

        <table
          className="
            w-full
            text-xs
          "
        >

          <thead
            className="
              bg-[#F6F7F4]
              text-[10px]
              uppercase
              text-[#64756D]
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

          {filtered.map((note)=>(

            <>

              <tr
                key={note.id}
                className="
                  border-t
                  hover:bg-[#FAFBF8]
                "
              >

                <td
                  className="
                    whitespace-nowrap
                    px-3
                    py-3
                  "
                >

                  <button
                    onClick={()=>
                      setExpanded(
                        expanded===note.id
                        ? null
                        : note.id
                      )
                    }
                    className="
                      mr-3
                      underline
                    "
                  >
                    View
                  </button>

                </td>


                <td className="px-3 py-3">
                  {note.date || "—"}
                </td>


                <td
                  className="
                    px-3
                    py-3
                    font-semibold
                  "
                >
                  {note.type || "—"}
                </td>


                <td className="px-3 py-3">
                  {note.author || "—"}
                </td>


                <td className="max-w-xl px-3 py-3">

                  <div className="truncate">
                    {note.title || "—"}
                  </div>

                </td>


              </tr>


              {expanded===note.id && (

                <tr>

                  <td
                    colSpan={5}
                    className="
                      bg-[#F8FAF8]
                      px-5
                      py-4
                      leading-6
                    "
                  >

                    <strong>
                      Details
                    </strong>

                    <br/>

                    {note.title}

                    <br/>

                    {note.subtitle}

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
