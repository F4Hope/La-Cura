import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faBookMedical,
  faCircleCheck,
  faClock,
  faDroplet,
  faHeartPulse,
  faPersonWalking,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import {
  getHealthTipBySlug,
  healthTipArticles,
  type HealthTipIcon,
} from "@/lib/healthTips";

type HealthTipPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const healthTipIcons: Record<
  HealthTipIcon,
  IconDefinition
> = {
  heart: faHeartPulse,
  hydration: faDroplet,
  habits: faPersonWalking,
};

export function generateStaticParams() {
  return healthTipArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: HealthTipPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHealthTipBySlug(slug);

  if (!article) {
    return {
      title: "Health Tip Not Found | La-Cura",
      description:
        "The requested La-Cura health article could not be found.",
    };
  }

  return {
    title: `${article.title} | La-Cura`,
    description: article.shortDescription,
  };
}

export default async function HealthTipPage({
  params,
}: HealthTipPageProps) {
  const { slug } = await params;
  const article = getHealthTipBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleIcon = healthTipIcons[article.icon];

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white shadow-xl">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />

        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-20">
          <Link
            href="/#tips"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-white/20"
          >
            <AppIcon icon={faArrowLeft} />

            Back to Health Tips
          </Link>

          <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
              <AppIcon
                icon={articleIcon}
                className="text-4xl"
              />
            </div>

            <div>
              <p className="font-semibold uppercase tracking-[5px] text-green-100">
                {article.category}
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {article.title}
              </h1>

              <div className="mt-6 flex items-center gap-2 text-green-100">
                <AppIcon icon={faClock} />

                <span>{article.readingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
        <section className="rounded-[32px] bg-white p-7 shadow-xl sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100">
              <AppIcon
                icon={faBookMedical}
                className="text-xl text-green-700"
              />
            </div>

            <p className="text-lg leading-9 text-gray-700">
              {article.introduction}
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] bg-white p-7 shadow-xl sm:p-10">
          <h2 className="text-3xl font-black text-gray-900">
            Key Actions
          </h2>

          <div className="mt-8 space-y-5">
            {article.keyActions.map((action) => (
              <div
                key={action}
                className="flex items-start gap-4"
              >
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <AppIcon
                    icon={faCircleCheck}
                    className="text-sm text-green-700"
                  />
                </div>

                <p className="leading-8 text-gray-700">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black text-gray-900">
            A Practical Daily Plan
          </h2>

          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {article.dailyPlan.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-7 shadow-lg"
              >
                <h3 className="text-xl font-bold text-green-700">
                  {item.title}
                </h3>

                <p className="mt-4 leading-8 text-gray-600">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-red-200 bg-red-50 p-7 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
              <AppIcon
                icon={faTriangleExclamation}
                className="text-xl text-red-600"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-red-800">
                Warning Signs
              </h2>

              <p className="mt-2 leading-7 text-red-700">
                Seek professional medical assessment when these
                symptoms are severe, sudden, persistent, or
                worsening.
              </p>
            </div>
          </div>

          <ul className="mt-7 space-y-4">
            {article.warningSigns.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-3 text-red-800"
              >
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-red-600" />

                <span className="leading-7">
                  {warning}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 rounded-2xl bg-white/80 p-5 font-semibold leading-7 text-red-800">
            {article.clinicalNote}
          </div>
        </section>

        <section className="mt-10 rounded-[32px] bg-gray-900 p-7 text-white shadow-xl sm:p-10">
          <h2 className="text-2xl font-black">
            Medical Disclaimer
          </h2>

          <p className="mt-4 leading-8 text-gray-300">
            This article provides general health education. It
            does not diagnose illness, replace a clinical
            examination, or replace advice from a physician,
            nurse, pharmacist, dietitian, or another qualified
            healthcare professional.
          </p>
        </section>

        <section className="mt-10 rounded-[32px] bg-white p-7 shadow-xl sm:p-10">
          <h2 className="text-2xl font-black text-gray-900">
            Authoritative Sources
          </h2>

          <p className="mt-3 leading-7 text-gray-500">
            Review the original public-health guidance used to
            prepare this article.
          </p>

          <div className="mt-6 space-y-4">
            {article.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 px-5 py-4 font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
              >
                <span>{source.label}</span>

                <AppIcon
                  icon={faArrowUpRightFromSquare}
                  className="shrink-0"
                />
              </a>
            ))}
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/#tips"
            className="inline-flex items-center gap-3 rounded-2xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            <AppIcon icon={faArrowLeft} />

            Return to La-Cura
          </Link>
        </div>
      </article>
    </main>
  );
}