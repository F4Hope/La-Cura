"use client";

import useAppUi from "@/components/i18n/useAppUi";

import {
  faCalendarDays,
  faHandSparkles,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

function getGreeting(): string {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good Morning";
  }

  if (currentHour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export default function WelcomeBanner() {
  const { ui, locale } =
    useAppUi();

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="mb-10">
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-green-700 via-green-600 to-green-500 p-8 text-white shadow-2xl md:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 left-1/2 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[5px] text-green-100">
              {ui("Welcome Back")}</p>

            <div className="mt-4 flex items-center gap-4">
              <h2 className="text-4xl font-black md:text-5xl">
                {ui(getGreeting())}
              </h2>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <AppIcon
                  icon={faHandSparkles}
                  className="text-2xl text-white"
                />
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-green-100">
              {ui("Thank you for caring for your residents today. Every medication administered, every vital sign recorded, and every interaction improves someone&apos;s quality of life.")}</p>
          </div>

          <div className="min-w-0 rounded-3xl bg-white/15 px-7 py-6 backdrop-blur-xl lg:min-w-[320px]">
            <div className="flex items-center gap-3">
              <AppIcon
                icon={faCalendarDays}
                className="text-xl"
              />

              <span className="font-semibold">
                {ui("Today&apos;s Date")}</span>
            </div>

            <p className="mt-4 text-2xl font-black">
              {formattedDate}
            </p>

            <div className="mt-6 border-t border-white/20 pt-5">
              <p className="leading-6 text-green-100">
                {ui("Remember to review today&apos;s scheduled medications and clinical alerts before beginning rounds.")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}