type Props = {
  diagnosis?: string | null;
  admission?: string | null;
  diet?: string | null;
  record?: string | null;
};


export default function ResidentClinicalSummary({
  diagnosis,
  admission,
  diet,
  record,
}: Props) {

  const items = [
    {
      label: "Diagnosis",
      value: diagnosis,
    },
    {
      label: "Admission",
      value: admission,
    },
    {
      label: "Diet",
      value: diet,
    },
    {
      label: "Medical Record",
      value: record,
    },
  ];


  return (
    <div
      className="
        grid
        border-t
        border-[#D4DDD8]
        bg-white
        md:grid-cols-4
      "
    >

      {items.map((item) => (

        <div
          key={item.label}
          className="
            border-r
            border-[#D4DDD8]
            px-3
            py-2
            last:border-r-0
          "
        >

          <p
            className="
              text-[10px]
              font-bold
              uppercase
              text-[#718078]
            "
          >
            {item.label}
          </p>


          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              text-[#263A32]
            "
          >
            {item.value || "Not documented"}
          </p>

        </div>

      ))}

    </div>
  );
}
