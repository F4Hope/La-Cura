import { getCarePlans } from "@/lib/carePlans";

export default async function CarePlansPage() {
  const plans = await getCarePlans();

  return (
    <div>
      <header className="bg-green-700 text-white p-5 shadow">
        <h1 className="text-3xl font-bold">
          Care Plans
        </h1>

        <p className="text-green-100">
          Resident Care Plans
        </p>
      </header>

      <section className="p-8">

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-green-700 text-white">

              <tr>
                <th className="p-4 text-left">Resident</th>
                <th className="p-4 text-left">Diagnosis</th>
                <th className="p-4 text-left">Care Plan</th>
                <th className="p-4 text-left">Assigned Nurse</th>
                <th className="p-4 text-left">Review Date</th>
              </tr>

            </thead>

            <tbody>

              {plans.map((plan: any) => (

                <tr
                  key={plan.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">
                    {plan.resident_name}
                  </td>

                  <td className="p-4">
                    {plan.diagnosis}
                  </td>

                  <td className="p-4">
                    {plan.care_plan}
                  </td>

                  <td className="p-4">
                    {plan.assigned_nurse}
                  </td>

                  <td className="p-4">
                    {plan.review_date}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>
    </div>
  );
}