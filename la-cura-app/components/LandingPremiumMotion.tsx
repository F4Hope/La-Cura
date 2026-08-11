"use client";

import type {
  CSSProperties,
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
   LA-CURA PREMIUM MOTION SYSTEM
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

      @keyframes premiumLetterEnter {
        from {
          opacity: 0;
          transform: translateY(0.72em)
            rotateX(-45deg);
          filter: blur(6px);
        }

        to {
          opacity: 1;
          transform: translateY(0)
            rotateX(0deg);
          filter: blur(0);
        }
      }

      @keyframes premiumEyebrowEnter {
        from {
          opacity: 0;
          transform: translateY(12px);
          letter-spacing: 0.45em;
        }

        to {
          opacity: 1;
          transform: translateY(0);
          letter-spacing: 0.28em;
        }
      }

      @keyframes premiumBodyEnter {
        from {
          opacity: 0;
          transform: translateY(20px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes premiumUnderline {
        from {
          transform: scaleX(0);
          transform-origin: left;
          opacity: 0;
        }

        to {
          transform: scaleX(1);
          transform-origin: left;
          opacity: 1;
        }
      }

      @keyframes premiumGoldSweep {
        0% {
          background-position: 180% center;
        }

        100% {
          background-position: -180% center;
        }
      }

        12% {
          opacity: 0.9;
        }

        55% {
          opacity: 1;
        }

        100% {
          background-position: -80% center;
          opacity: 0;
        }
      }

        4% {
          opacity: 0.15;
        }

        9% {
          opacity: 0.95;
        }

        24% {
          background-position: -75% center;
          opacity: 1;
        }

        30% {
          opacity: 0;
        }

        100% {
          background-position: -75% center;
          opacity: 0;
        }
      }

      @keyframes premiumGoldCycle {
        0% {
          background-position: 180% center;
          opacity: 0;
        }

        3% {
          opacity: 1;
        }

        45% {
          background-position: -80% center;
          opacity: 1;
        }

        48% {
          background-position: -80% center;
          opacity: 0;
        }

        49% {
          background-position: 180% center;
          opacity: 0;
        }

        52% {
          opacity: 1;
        }

        97% {
          background-position: -80% center;
          opacity: 1;
        }

        100% {
          background-position: -80% center;
          opacity: 0;
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
          opacity: 0.16;
          transform: scale(0.96);
        }

        50% {
          opacity: 0.4;
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

      .premium-letter {
        display: inline-block;
        transform-origin: center bottom;
        backface-visibility: hidden;
        will-change:
          opacity,
          transform,
          filter;
      }

      .premium-hero-image {
        filter: contrast(1.07) saturate(1.08) brightness(0.98);
        animation: premiumHeroImage
          19s ease-in-out infinite;
        will-change: transform;
      }

      .premium-nav {
        background: rgba(
          247,
          245,
          239,
          0.96
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

        transition:
          left 750ms ease;

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

      .premium-card {
        transition:
          transform 320ms cubic-bezier(0.16,1,0.3,1),
          box-shadow 320ms ease;
      }

      .premium-card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 20px 44px rgba(7, 59, 47, 0.09);
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
              0.48
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
        .premium-letter {
          animation:
            none !important;

          opacity: 1 !important;

          transform:
            none !important;

          filter:
            none !important;
        }

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
   REPLAYABLE VIEWPORT OBSERVER
   ========================================================= */

function useReplayInView(
  threshold = 0.2
) {
  const ref =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    active,
    setActive,
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

    if (
      reducedMotion.matches
    ) {
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
          threshold,
          rootMargin:
            "20px 0px -40px 0px",
        }
      );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return {
    ref,
    active,
  };
}

/* =========================================================
   LETTER-BY-LETTER TEXT
   ========================================================= */

type LetterRevealProps = {
  text: string;
  active: boolean;
  startDelay?: number;
  letterDelay?: number;
  duration?: number;
  className?: string;
};

function LetterReveal({
  text,
  active,
  startDelay = 0,
  letterDelay = 28,
  duration = 520,
  className = "",
}: LetterRevealProps) {
  let characterIndex = 0;

  const words =
    text.split(" ");

  return (
    <span
      aria-label={text}
      className={className}
    >
      {words.map(
        (
          word,
          wordIndex
        ) => {
          const letters =
            word.split("");

          return (
            <span
              key={`${word}-${wordIndex}`}
              aria-hidden="true"
              className="inline-block whitespace-nowrap"
            >
              {letters.map(
                (
                  letter,
                  index
                ) => {
                  const delay =
                    startDelay +
                    characterIndex *
                      letterDelay;

                  characterIndex +=
                    1;

                  const style:
                    CSSProperties =
                    active
                      ? {
                          animation:
                            `premiumLetterEnter ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
                        }
                      : {
                          opacity:
                            0,
                          transform:
                            "translateY(0.72em) rotateX(-45deg)",
                          filter:
                            "blur(6px)",
                        };

                  return (
                    <span
                      key={`${letter}-${index}`}
                      className="premium-letter"
                      style={
                        style
                      }
                    >
                      {letter}
                    </span>
                  );
                }
              )}

              {wordIndex <
                words.length -
                  1 && (
                <span
                  aria-hidden="true"
                  className="inline-block w-[0.27em]"
                />
              )}
            </span>
          );
        }
      )}
    </span>
  );
}

/* =========================================================
   HERO TITLE
   ========================================================= */

export function AnimatedHeroTitle() {
  const {
    ref,
    active,
  } = useReplayInView(
    0.28
  );

  return (
    <div ref={ref}>
      <h1 className="text-5xl font-black leading-[1.04] tracking-[-0.035em] text-[#10231E] sm:text-6xl lg:text-[72px]">
        <span className="block">
          <LetterReveal
            text="Compassionate"
            active={active}
            startDelay={60}
            letterDelay={28}
          />
        </span>

        <span className="block">
          <LetterReveal
            text="Care for"
            active={active}
            startDelay={360}
            letterDelay={32}
          />
        </span>

        <span className="relative mt-2 block w-fit text-[#073B2F]">
          <LetterReveal
            text="Every Life"
            active={active}
            startDelay={580}
            letterDelay={34}
          />

          <span
            aria-hidden="true"
            className="premium-gold-glimpse pointer-events-none absolute inset-0 whitespace-nowrap bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(110deg, transparent 34%, transparent 43%, #FFF4C7 47%, #E8C45C 50%, #D5A437 52%, #FFF4C7 56%, transparent 63%, transparent 100%)",

              backgroundSize:
                "260% 100%",

              animation: active
                ? "premiumGoldCycle 4.6s linear 1.1s infinite"
                : "none",
            }}
          >
            Every Life
          </span>

          <span
            aria-hidden="true"
            className="absolute -bottom-3 left-1 h-[4px] w-[72%] rounded-full"
            style={{
              background:
                "linear-gradient(90deg,#D5A437 0%,#D5A437 55%,rgba(213,164,55,0) 100%)",

              animation: active
                ? "premiumUnderline 900ms cubic-bezier(0.16,1,0.3,1) 1250ms both"
                : "none",

              opacity: active
                ? undefined
                : 0,
            }}
          />
        </span>
      </h1>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
   EACH SECTION REPLAYS LETTER-BY-LETTER
   ========================================================= */

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
  const {
    ref,
    active,
  } = useReplayInView(
    0.25
  );

  const titleCharacterCount =
    title.replace(
      /\s/g,
      ""
    ).length;

  const descriptionDelay =
    Math.min(
      450 +
        titleCharacterCount *
          22,
      1250
    );

  return (
    <div ref={ref}>
      <div className="mx-auto max-w-4xl text-center">
        <span
          className="inline-block text-xs font-black uppercase text-[#D5A437] sm:text-sm"
          style={
            active
              ? {
                  animation:
                    "premiumEyebrowEnter 600ms cubic-bezier(0.16,1,0.3,1) 40ms both",
                }
              : {
                  opacity: 0,
                  transform:
                    "translateY(12px)",
                }
          }
        >
          {eyebrow}
        </span>

        <h2 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.03em] text-[#10231E] sm:text-5xl lg:text-[54px]">
          <LetterReveal
            text={title}
            active={active}
            startDelay={150}
            letterDelay={24}
            duration={500}
          />
        </h2>

        <div
          className="mx-auto mt-5 h-[3px] w-16 rounded-full bg-[#D5A437]"
          style={{
            animation: active
              ? `premiumUnderline 700ms cubic-bezier(0.16,1,0.3,1) ${descriptionDelay - 120}ms both`
              : "none",

            opacity: active
              ? undefined
              : 0,
          }}
        />

        <p
          className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9"
          style={
            active
              ? {
                  animation:
                    `premiumBodyEnter 700ms cubic-bezier(0.16,1,0.3,1) ${descriptionDelay}ms both`,
                }
              : {
                  opacity: 0,
                  transform:
                    "translateY(20px)",
                }
          }
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   GENERIC SCROLL REVEAL
   ========================================================= */

type RevealOnScrollProps = {
  children: ReactNode;
  delay?: number;
};

export function RevealOnScroll({
  children,
  delay = 0,
}: RevealOnScrollProps) {
  const {
    ref,
    active,
  } = useReplayInView(
    0.14
  );

  return (
    <div
      ref={ref}
      style={{
        transitionDelay:
          `${delay}ms`,
      }}
      className={`transition-all duration-700 ease-out ${
        active
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      }`}
    >
      {children}
    </div>
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
          (
            item,
            index
          ) => {
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
   REPLAYABLE STATISTICS
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

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (
      reducedMotion.matches
    ) {
      setValue(target);
      return;
    }

    const duration =
      1100;

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

      if (
        progress < 1
      ) {
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

    return () => {
      cancelAnimationFrame(
        frame
      );
    };
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