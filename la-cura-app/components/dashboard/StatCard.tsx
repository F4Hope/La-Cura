import Link from "next/link";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type StatCardProps = {
  title: string;
  value: number | string;
  href: string;
  icon: IconDefinition;
  color: string;
};

export default function StatCard({
  title,
  value,
  href,
  icon,
  color,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-100"
    >
      <div className={`h-2 ${color}`} />

      <div className="p-7">
        <div className="flex items-center justify-between gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${color} shadow-sm`}
          >
            <AppIcon
              icon={icon}
              className="text-2xl text-white"
            />
          </div>

          <div className="text-right">
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Total
            </p>

            <h2 className="text-4xl font-black text-gray-900">
              {value}
            </h2>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-gray-500 transition group-hover:text-green-700">
            <span>View and manage</span>

            <AppIcon
              icon={faArrowRight}
              className="text-sm transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/20 opacity-0 transition duration-500 group-hover:opacity-100" />
    </Link>
  );
}