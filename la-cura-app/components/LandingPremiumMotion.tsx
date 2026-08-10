"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Activity,
  HeartPulse,
  LockKeyhole,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export function PremiumLandingStyles() {
  return (
    <style jsx global>{`
      @keyframes premiumHeroEnter {
        from {
          opacity: 0;
          transform: translateY(34px);
          filter: blur(8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }

      @keyframes premiumShimmer {
        0% {
          background-position: 200% center;
        }

        100% {
          background-position: -200% center;
        }
      }

      @keyframes premiumHeroImage {
        0%,
        100% {
          transform: scale(1.02) translate3d(0, 0, 0);
        }

        50% {
          transform: scale(1.075) translate3d(-1.25%, -0.6%, 0);
        }
      }

      @keyframes premiumPulseLine {
        0% {
          transform: scaleX(0);
          transform-origin: left;
          opacity: 0;
        }

        35% {
          opacity: 1;
        }

        100% {
          transform: scaleX(1);
          transform-origin: left;
          opacity: 1;
        }
      }

      @keyframes premiumMarquee {
        from {
          transform: translateX(0);
        }

        to {
          transform: translateX(-50%);
        }
      }

      @keyframes premiumGlow {
        0%,
        100% {
          opacity: 0.22;
          transform: scale(0.96);
        }

        50% {
          opacity: 0.45;
          transform: scale(1.05);
        }
      }

      @keyframes premiumOrbit {
        0% {
          transform: translate3d(0, 0, 0) rotate(0deg);
        }

        50% {
          transform: translate3d(16px, -12px, 0) rotate(5deg);
        }

        100% {
          transform: translate3d(0, 0, 0) rotate(0deg);
        }
      }

      .premium-hero-image {
        animation: premiumHeroImage 18s ease-in-out infinite;
        will-change: transform;
      }

      .premium-nav {
        box-shadow:
          0 1px 0 rgba(15, 23, 42, 0.04),
          0 12px 40px rgba(15, 23, 42, 0.04);
      }

      .premium-card {
        position: relative;
        isolation: isolate;
        overflow: hidden;
      }

      .premium-card::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
          120deg,
          transparent 20%,
          rgba(255, 255, 255, 0.52) 48%,
          transparent 72%
        );
        transform: translateX(-140%);
        transition: transform 850ms ease;
        z-index: 2;
      }

      .premium-card:hover::after {
        transform: translateX(140%);
      }

      .premium-primary-button {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .premium-primary-button::after {
        content: "";
        position: absolute;
        top: -50%;
        bottom: -50%;
        width: 34%;
        left: -50%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.32),
          transparent
        );
        transform: skewX(-18deg);
        transition: left 700ms ease;
        pointer-events: none;
      }

      .premium-primary-button:hover::after {
        left: 125%;
      }

      .premium-orbit {
        animation: premiumOrbit 10s ease-in-out infinite;
      }

      .premium-about-image {
        transition:
          transform 1000ms cubic-bezier(0.16, 1, 0.3, 1),
          filter 1000ms ease;
      }

      .premium-about-image:hover {
        transform: scale(1.035);
        filter: saturate(1.05);
      }

      @media (prefers-reduced-motion: reduce) {
        .premium-hero-image,
        .premium-orbit {
          animation: none !important;
        }

        .premium-card::after,
        .premium-primary-button::after {
          display: none;
        }
      }
    `}</style>
  );
}

export function AnimatedHeroTitle() {
  return (
    <h1 className="text-5xl font-black leading-[1.08] text-gray-900 sm:text-6xl lg:text-7xl">
      <span
        className="block opacity-0 motion-reduce:opacity-100"
        style={{
          animation:
            "premiumHeroEnter 760ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards",
        }}
      >
        Compassionate
      </span>

      <span
        className="block opacity-0 motion-reduce:opacity-100"
        style={{
          animation:
            "premiumHeroEnter 760ms cubic-bezier(0.16, 1, 0.3, 1) 260ms forwards",
        }}
      >
        Care for
      </span>

      <span
        className="relative mt-1 block w-fit opacity-0 motion-reduce:opacity-100"
        style={{
          animation:
            "premiumHeroEnter 760ms cubic-bezier(0.16, 1, 0.3, 1) 400ms forwards",
        }}
      >
        <span
          className="bg-[length:220%_100%] bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #047857 0%, #16a34a 32%, #86efac 48%, #047857 64%, #047857 100%)",
            animation:
              "premiumShimmer 6.5s linear 1.3s infinite",
          }}
        >
          Every Life
        </span>

        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-1 h-[5px] w-[72%] rounded-full bg-gradient-to-r from-green-700 via-green-500 to-transparent"
          style={{
            animation:
              "premiumPulseLine 900ms cubic-bezier(0.16, 1, 0.3, 1) 1s both",
          }}
        />
      </span>
    </h1>
  );
}

type MotionSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function MotionSectionHeading({
  eyebrow,
  title,
  description,
}: MotionSectionHeadingProps) {
  return (
    <RevealOnScroll>
      <div className="mx-auto max-w-4xl text-center">
        <span className="font-semibold uppercase tracking-[6px] text-green-700">
          {eyebrow}
        </span>

        <h2 className="mt-5 text-4xl font-black leading-tight text-gray-900 sm:text-5xl">
          {title}
        </h2>

        <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-green-600" />

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl sm:leading-9">
          {description}
        </p>
      </div>
    </RevealOnScroll>
  );
}

type RevealOnScrollProps = {
  children: ReactNode;
  delay?: number;
};

export function RevealOnScroll({
  children,
  delay = 0,
}: RevealOnScrollProps) {
  const ref =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    const node =
      ref.current;

    if (!node) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (mediaQuery.matches) {
      setVisible(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting
          ) {
            setVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.14,
          rootMargin:
            "0px 0px -50px 0px",
        }
      );

    observer.observe(node);

    return () =>
      observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay:
          `${delay}ms`,
      }}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

const railItems = [
  {
    label:
      "Resident-Centered Care",
    icon: Users,
  },
  {
    label:
      "Medication Safety",
    icon: Pill,
  },
  {
    label:
      "Real-Time Vitals",
    icon: HeartPulse,
  },
  {
    label:
      "Secure Documentation",
    icon: LockKeyhole,
  },
  {
    label:
      "Clinical Coordination",
    icon: Stethoscope,
  },
  {
    label:
      "Role-Based Access",
    icon: ShieldCheck,
  },
];

export function CareMotionRail() {
  const repeated = [
    ...railItems,
    ...railItems,
  ];

  return (
    <section className="overflow-hidden border-y border-green-100 bg-white py-4">
      <div
        className="flex w-max items-center"
        style={{
          animation:
            "premiumMarquee 34s linear infinite",
        }}
      >
        {repeated.map(
          (item, index) => {
            const Icon =
              item.icon;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex shrink-0 items-center"
              >
                <div className="flex items-center gap-3 px-7 text-sm font-bold text-slate-700 sm:px-10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
                    <Icon
                      size={17}
                    />
                  </span>

                  {
                    item.label
                  }
                </div>

                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

const animatedStatistics = [
  {
    target: 500,
    suffix: "+",
    label:
      "Patients to Be Served",
  },
  {
    target: 25,
    suffix: "+",
    label:
      "Healthcare Professionals to Onboard",
  },
  {
    target: 24,
    suffix: "/7",
    label:
      "Healthcare Support",
  },
  {
    target: 100,
    suffix: "%",
    label:
      "Patient Focused",
  },
];

export function AnimatedStatistics() {
  return (
    <div className="mt-20 grid gap-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
      {animatedStatistics.map(
        (statistic) => (
          <AnimatedStatistic
            key={
              statistic.label
            }
            {...statistic}
          />
        )
      )}
    </div>
  );
}

function AnimatedStatistic({
  target,
  suffix,
  label,
}: {
  target: number;
  suffix: string;
  label: string;
}) {
  const ref =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    value,
    setValue,
  ] = useState(0);

  const [
    started,
    setStarted,
  ] = useState(false);

  useEffect(() => {
    const node =
      ref.current;

    if (!node) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting
          ) {
            setStarted(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.35,
        }
      );

    observer.observe(node);

    return () =>
      observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (mediaQuery.matches) {
      setValue(target);
      return;
    }

    const duration = 1200;
    const start =
      performance.now();

    let frame = 0;

    const animate = (
      now: number
    ) => {
      const progress =
        Math.min(
          (now - start) /
            duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      setValue(
        Math.round(
          target * eased
        )
      );

      if (progress < 1) {
        frame =
          requestAnimationFrame(
            animate
          );
      }
    };

    frame =
      requestAnimationFrame(
        animate
      );

    return () =>
      cancelAnimationFrame(
        frame
      );
  }, [
    started,
    target,
  ]);

  return (
    <div
      ref={ref}
      className="relative"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
        style={{
          animation:
            "premiumGlow 4.5s ease-in-out infinite",
        }}
      />

      <p className="relative text-5xl font-black text-white">
        {value}
        {suffix}
      </p>

      <p className="relative mt-3 text-green-100">
        {label}
      </p>
    </div>
  );
}

export function HeroScrollCue() {
  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-800/60 xl:flex">
      <span>
        Explore
      </span>

      <div className="relative h-11 w-px overflow-hidden bg-green-900/15">
        <div className="absolute inset-x-0 top-0 h-5 bg-green-700 motion-safe:animate-bounce" />
      </div>
    </div>
  );
}

export function ClinicalPulseAccent() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-bold text-green-800 shadow-sm backdrop-blur">
      <Activity
        size={16}
        className="motion-safe:animate-pulse"
      />

      Care in motion
    </div>
  );
}
