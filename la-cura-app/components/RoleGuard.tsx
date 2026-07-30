"use client";

import { useEffect, useState } from "react";
import { getCurrentStaff } from "@/lib/auth";

type Props = {
  allow: string[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allow,
  children,
}: Props) {

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {

    async function check() {

      const staff = await getCurrentStaff();

      if (!staff) {

        window.location.href = "/login";
        return;

      }

      setAllowed(allow.includes(staff.role));

      setLoading(false);

    }

    check();

  }, []);

  if (loading) {

    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );

  }

  if (!allowed) {

    return (

      <div className="min-h-screen flex flex-col justify-center items-center">

        <h1 className="text-4xl font-bold text-red-600">

          Access Denied

        </h1>

        <p className="mt-4">

          You do not have permission to access this page.

        </p>

      </div>

    );

  }

  return <>{children}</>;

}