import CarePlanClinicalTable, {
  type CarePlanRecord,
} from "@/components/CarePlanClinicalTable";

import {
  getCarePlans,
} from "@/lib/carePlans";

export const dynamic =
  "force-dynamic";


export default async function CarePlansPage() {
  const plans =
    await getCarePlans();

  return (
    <CarePlanClinicalTable
      plans={
        plans as CarePlanRecord[]
      }
    />
  );
}
