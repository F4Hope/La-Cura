import ResidentsDirectory from "@/components/ResidentsDirectory";

import { getResidents } from "@/lib/residents";

export const dynamic = "force-dynamic";

export default async function ResidentsPage() {
  const residents = await getResidents();

  return (
    <ResidentsDirectory
      residents={residents}
    />
  );
}