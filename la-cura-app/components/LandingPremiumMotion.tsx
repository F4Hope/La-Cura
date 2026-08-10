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

/* =========================================================
   LA-CURA PREMIUM PALETTE

   Forest: #073B2F
   Ivory:  #F7F5EF
   Gold:   #D5A437
   Sage:   #E6EEE8
   Green:  #059669
   ========================================================= */

export function PremiumLandingStyles() {
  return (
    <style jsx global>{`
      :root {
        --lacura-forest: #073b2f;
        --lacura-forest-soft: #0d4a3a;
        --lacura-ivory: #f7f5ef;
        --lacura-gold: #d5a437;
        --lacura-sage: #e6eee8;
        --lacura-clinical: #059669;
      }

      html {
        scroll-behavior: smooth;
      }

      @keyframes premiumHeroEnter {
        from {
          opacity: 0;
          transform: translateY(32px);
          filter: blur(7px);
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
          transform: scale(1.01)
            translate3d(0, 0, 0);
        }

        50% {
          transform: scale(1.045)
            translate3d(
              -0.6%,
              -0.3%,
              0
            );
        }
      }

      @keyframes premiumUnderline {
        from {
          transform: scaleX(0);
          transform-origin: left;
        }

        to {
          transform: scaleX(1);
          transform-origin: left;
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
          opacity: 0.18;
          transform: scale(0.96);
        }

        50% {
          opacity: 0.38;
          transform: scale(1.05);
        }
      }

      @keyframes premiumOrbit {
        0%,
        100% {
          transform: translate3d(
              0,
              0,
              0
            )
            rotate(0deg);
        }

        50% {
          transform: translate3d(
              12px,
              -9px,
              0
            )
            rotate(4deg);
        }
      }

      .premium-hero-image {
        animation: premiumHeroImage
          19s ease-in-out infinite;
        will-change: transform;
      }

      .premium-nav {
        background: rgba(
          247,
          245,
          239,
          0.95
        ) !important;

        border-color: rgba(
          7,
          59,
          47,
          0.1
        ) !important;

        box-shadow:
          0 1px 0
            rgba(7, 59, 47, 0.04),
          0 14px 45px
            rgba(7, 59, 47, 0.05);
      }

      .premium-primary-button {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        background:
          var(--lacura-forest) !important;
        box-shadow:
          0 12px 30px
            rgba(7, 59, 47, 0.18);
      }

      .premium-primary-button:hover {
        background:
          var(
            --lacura-forest-soft
          ) !important;
      }

      .premium-primary-button::after {
        content: "";
        position: absolute;
        top: -50%;
        bottom: -50%;
        left: -45%;
        width: 28%;

        background: linear-gradient(
          90deg,
          transparent,
          rgba(
            255,
            255,
            255,
            0.3
          ),
          transparent
        );

        transform: skewX(-18deg);
        transition: left 750ms ease;
        pointer-events: none;
      }

      .premium-primary-button:hover::after {
        left: 125%;
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
        z-index: 2;
        pointer-events: none;

        background:
          linear-gradient(
            120deg,
            transparent 20%,
            rgba(
              255,
              255,
              255,
              0.5
            )
              48%,
            transparent 72%
          );

        transform:
          translateX(-140%);

        transition:
          transform 850ms ease;
      }

      .premium-card:hover::after {
        transform:
          translateX(140%);
      }

      .premium-orbit {
        animation:
          premiumOrbit 11s
          ease-in-out infinite;
      }

      .premium-about-image {
        transition:
          transform 900ms
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            ),
          filter 900ms ease;
      }

      .premium-about-image:hover {
        transform: scale(1.03);
        filter: saturate(1.04);
      }

      @media (
        prefers-reduced-motion:
          reduce
      ) {
        .premium-hero-image,
        .premium-orbit {
          animation:
            none !important;
        }

        .premium-card::after,
        .premium-primary-button::after {
          display: none;
        }
      }
    `}</style>
  );
}

/* =========================================================
   HERO TITLE
   Replays whenever it returns to the viewport
   ========================================================= */

export function AnimatedHeroTitle() {
  const ref =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    active,
    setActive,
  ] = useState(true);

  useEffect(() => {
    const node =
      ref.current;

    if (!node) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (reducedMotion.matches) {
      setActive(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setActive(
            entry.isIntersecting
          );
        },
        {
          threshold: 0.3,
        }
      );

    observer.observe(node);

    return () =>
      observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <h1 className="text-5xl font-black leading-[1.06] text-[#101828] sm:text-6xl lg:text-7xl">
        <span
          className="block"
          style={
            active
              ? {
                  animation:
                    "premiumHeroEnter 720ms cubic-bezier(0.16,1,0.3,1) 80ms both",
                }
              : {
                  opacity: 0,
                }
          }
        >
          Compassionate
        </span>

        <span
          className="block"
          style={
            active
              ? {
                  animation:
                    "premiumHeroEnter 720ms cubic-bezier(0.16,1,0.3,1) 210ms both",
                }
              : {
                  opacity: 0,
                }
          }
        >
          Care for
        </span>

        <span
          className="relative mt-1 block w-fit"
          style={
            active
              ? {
                  animation:
                    "premiumHeroEnter 720ms cubic-bezier(0.16,1,0.3,1) 340ms both",
                }
              : {
                  opacity: 0,
                }
          }
        >
          <span
            className="bg-[length:240%_100%] bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg,#073B2F 0%,#0D6953 30%,#D5A437 48%,#0D6953 64%,#073B2F 100%)",

              animation: active
                ? "premiumShimmer 7s linear 1.2s infinite"
                : "none",
            }}
          >
            Every Life
          </span>

          <span
            aria-hidden="true"
            className="absolute -bottom-2 left-1 h-[4px] w-[70%] rounded-full"
            style={{
              background:
                "linear-gradient(90deg,#073B2F,#D5A437,transparent)",

              animation: active
                ? "premiumUnderline 850ms cubic-bezier(0.16,1,0.3,1) 850ms both"
                : "none",
            }}
          />
        </span>
      </h1>
    </div>
  );
}

/* =========================================================
   REUSABLE SCROLL REVEAL

   IMPORTANT:
   It does NOT disconnect after the first appearance.
   It resets when leaving the viewport.
   ========================================================= */

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

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (reducedMotion.matches) {
      setVisible(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setVisible(
            entry.isIntersecting
          );
        },
        {
          threshold: 0.14,
          rootMargin:
            "20px 0px -50px 0px",
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
        <span className="font-bold uppercase tracking-[5px] text-[#D5A437]">
          {eyebrow}
        </span>

        <h2 className="mt-5 text-4xl font-black leading-tight text-[#10231E] sm:text-5xl">
          {title}
        </h2>

        <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-[#073B2F]" />

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
          {description}
        </p>
      </div>
    </RevealOnScroll>
  );
}

/* =========================================================
   MOVING CARE RAIL
   ========================================================= */

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
    <section className="overflow-hidden border-y border-[#073B2F]/10 bg-[#073B2F] py-4">
      <div
        className="flex w-max items-center"
        style={{
          animation:
            "premiumMarquee 36s linear infinite",
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
                <div className="flex items-center gap-3 px-8 text-sm font-semibold text-[#F7F5EF] sm:px-10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#D5A437]">
                    <Icon
                      size={17}
                    />
                  </span>

                  {
                    item.label
                  }
                </div>

                <span className="h-1.5 w-1.5 rounded-full bg-[#D5A437]" />
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

/* =========================================================
   STATISTICS — ALSO REPLAY
   ========================================================= */

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
    active,
    setActive,
  ] = useState(false);

  const [
    value,
    setValue,
  ] = useState(0);

  useEffect(() => {
    const node =
      ref.current;

    if (!node) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setActive(
            entry.isIntersecting
          );

          if (
            !entry.isIntersecting
          ) {
            setValue(0);
          }
        },
        {
          threshold: 0.3,
        }
      );

    observer.observe(node);

    return () =>
      observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (reducedMotion.matches) {
      setValue(target);
      return;
    }

    const duration = 1100;
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
    active,
    target,
  ]);

  return (
    <div
      ref={ref}
      className="relative"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D5A437]/10 blur-2xl"
        style={{
          animation:
            "premiumGlow 4.5s ease-in-out infinite",
        }}
      />

      <p className="relative text-5xl font-black text-white">
        {value}
        {suffix}
      </p>

      <p className="relative mt-3 text-[#E6EEE8]">
        {label}
      </p>
    </div>
  );
}

export function ClinicalPulseAccent() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[#073B2F]/15 bg-[#F7F5EF]/90 px-4 py-2 text-sm font-bold text-[#073B2F] shadow-sm backdrop-blur">
      <Activity
        size={16}
        className="motion-safe:animate-pulse"
      />

      Care in motion
    </div>
  );
}
