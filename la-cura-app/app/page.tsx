import Image from "next/image";
import Link from "next/link";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import {
  faAppleWhole,
  faArrowRight,
  faChartLine,
  faCircleCheck,
  faClock,
  faDroplet,
  faEnvelope,
  faGlobe,
  faHeart,
  faHeartPulse,
  faKitMedical,
  faLaptopMedical,
  faLocationDot,
  faPersonCane,
  faPersonWalking,
  faPhone,
  faPills,
  faQuoteLeft,
  faShieldHalved,
  faStar,
  faStethoscope,
  faUserNurse,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";
import InstallLaCuraButton from "@/components/InstallLaCuraButton";
import {
  ClinicalWorkspaceTabs,
  HeroFloatingIcons,
} from "@/components/LandingMotion";
import {
  AnimatedHeroTitle,
  AnimatedStatistics,
  CareMotionRail,
  MotionSectionHeading,
  PremiumLandingStyles,
} from "@/components/LandingPremiumMotion";

type Feature = {
  title: string;
  description: string;
  icon: IconDefinition;
};

type Service = {
  title: string;
  description: string;
  icon: IconDefinition;
};

type Product = {
  title: string;
  description: string;
  icon: IconDefinition;
};

type Testimonial = {
  initials: string;
  name: string;
  role: string;
  message: string;
};

type HealthTip = {
  slug: string;
  title: string;
  description: string;
  icon: IconDefinition;
};

const trustFeatures: Feature[] = [
  {
    title: "Trusted Care",
    description:
      "Professional healthcare delivered with compassion, dignity, and excellence for every patient.",
    icon: faShieldHalved,
  },
  {
    title: "Expert Team",
    description:
      "Experienced nurses and caregivers committed to providing high-quality healthcare services.",
    icon: faUsers,
  },
  {
    title: "Patient First",
    description:
      "Every decision is centered on improving comfort, safety, independence, and quality of life.",
    icon: faHeart,
  },
];

const services: Service[] = [
  {
    title: "Nursing Care",
    description:
      "Compassionate nursing care focused on safety, dignity, treatment adherence, and recovery.",
    icon: faUserNurse,
  },
  {
    title: "Elderly Care",
    description:
      "Supportive long-term care that promotes independence, comfort, and meaningful daily living.",
    icon: faPersonCane,
  },
  {
    title: "Medical Products",
    description:
      "Reliable medical equipment and patient-care products for homes and healthcare facilities.",
    icon: faStethoscope,
  },
  {
    title: "Healthcare Technology",
    description:
      "Digital systems that help healthcare teams document, coordinate, and deliver safer care.",
    icon: faLaptopMedical,
  },
];

const products: Product[] = [
  {
    title: "Medical Equipment",
    description:
      "Reliable diagnostic and clinical equipment designed to support effective patient assessment and treatment.",
    icon: faStethoscope,
  },
  {
    title: "Patient Care Supplies",
    description:
      "Everyday healthcare essentials that help caregivers provide safe, comfortable, and dignified care.",
    icon: faKitMedical,
  },
  {
    title: "Digital Health Solutions",
    description:
      "Modern healthcare technology that supports better documentation, coordination, and clinical decision-making.",
    icon: faChartLine,
  },
];

const testimonials: Testimonial[] = [
  {
    initials: "JM",
    name: "John M.",
    role: "Family Member",
    message:
      "The nurses at La-Cura treated my mother with care and respect. Our family always felt informed and supported.",
  },
  {
    initials: "JA",
    name: "Juliet A.",
    role: "Patient",
    message:
      "Their professionalism and digital healthcare system make communication simple and reassuring.",
  },
  {
    initials: "FN",
    name: "Francis N.",
    role: "Community Member",
    message:
      "La-Cura provides healthcare with compassion. Every interaction has been professional, respectful, and helpful.",
  },
];

const healthTips: HealthTip[] = [
  {
    slug: "heart-health",
    title: "Keep Your Heart Healthy",
    description:
      "Walk regularly, reduce excess salt, eat balanced meals, and attend routine health examinations.",
    icon: faHeartPulse,
  },
  {
    slug: "stay-hydrated",
    title: "Stay Hydrated",
    description:
      "Drink water throughout the day and increase fluid intake during hot weather or physical activity.",
    icon: faDroplet,
  },
  {
    slug: "healthy-habits",
    title: "Build Healthy Habits",
    description:
      "Combine regular movement, nutritious foods, adequate sleep, and medication adherence.",
    icon: faPersonWalking,
  },
];

const statistics = [
  {
    value: "500+",
    label: "Patients to Be Served",
  },
  {
    value: "25+",
    label: "Healthcare Professionals to Onboard",
  },
  {
    value: "24/7",
    label: "Healthcare Support",
  },
  {
    value: "100%",
    label: "Patient Focused",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <PremiumLandingStyles />
      <header className="premium-nav fixed inset-x-0 top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex h-20 items-center justify-between lg:h-24">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-3 sm:gap-4"
              aria-label="La-Cura home"
            >
              <Image
                src="/logo.png"
                alt="La-Cura logo"
                width={64}
                height={64}
                priority
                className="h-14 w-14 object-contain sm:h-16 sm:w-16"
              />

              <div className="min-w-0">
                <p className="text-2xl font-black text-green-700 sm:text-4xl">
                  La-Cura
                </p>

                <p className="hidden text-sm text-gray-500 sm:block">
                  Compassionate Care, Every Life
                </p>
              </div>
            </Link>

            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-7 xl:flex"
            >
              <a
                href="#home"
                className="font-semibold text-green-700"
              >
                Home
              </a>

              <a
                href="#services"
                className="font-semibold text-gray-700 transition hover:text-green-700"
              >
                Services
              </a>

              <a
                href="#products"
                className="font-semibold text-gray-700 transition hover:text-green-700"
              >
                Products
              </a>

              <a
                href="#about"
                className="font-semibold text-gray-700 transition hover:text-green-700"
              >
                About
              </a>

              <a
                href="#tips"
                className="font-semibold text-gray-700 transition hover:text-green-700"
              >
                Health Tips
              </a>

              <a
                href="#contact"
                className="font-semibold text-gray-700 transition hover:text-green-700"
              >
                Contact
              </a>
            </nav>

            <Link
              href="/login"
              className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 sm:px-8 sm:text-base"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      <section
        id="home"
        className="relative scroll-mt-24 pt-20 lg:pt-24"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Healthcare professional providing compassionate care"
            fill
            priority
            sizes="100vw"
            className="premium-hero-image object-cover object-center lg:object-right"
          />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.98)_38%,rgba(255,255,255,0.78)_56%,rgba(255,255,255,0.18)_78%,rgba(255,255,255,0.04)_100%)]" />

        <HeroFloatingIcons />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex min-h-[760px] items-center py-24 lg:min-h-[860px]">
            <div className="max-w-[720px]">
              <div className="mb-7 inline-flex items-center gap-3 rounded-full bg-green-100 px-5 py-3 text-green-700 shadow-sm">
                <AppIcon
                  icon={faHeart}
                  className="text-lg"
                />

                <span className="font-semibold">
                  Trusted Healthcare Since Day One
                </span>
              </div>

              <AnimatedHeroTitle />

              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl lg:leading-9">
                Delivering nursing care, elderly care,
                healthcare technology, and quality medical
                products across Cameroon.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link
                  href="/login"
                  className="premium-primary-button inline-flex items-center justify-center gap-3 rounded-2xl bg-green-700 px-8 py-4 text-lg font-bold text-white transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-200 sm:px-10 sm:py-5"
                >
                  Staff Login

                  <AppIcon
                    icon={faArrowRight}
                    className="text-lg"
                  />
                </Link>

                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/75 px-6 py-4 text-base font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-green-300 hover:bg-white hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 sm:px-7"
                >
                  Explore Services
                </a>

                <InstallLaCuraButton />
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="relative z-20 -mt-6 pb-20 lg:-mt-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-7 md:grid-cols-3">
            {trustFeatures.map((feature) => (
              <article
                key={feature.title}
                className="premium-card rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-100 transition duration-300 hover:-translate-y-2 hover:shadow-2xl lg:p-8"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                  <AppIcon
                    icon={feature.icon}
                    className="text-3xl text-green-700"
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {feature.title}
                </h2>

                <p className="mt-4 leading-8 text-gray-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CareMotionRail />

      <section
        id="services"
        className="scroll-mt-24 bg-gradient-to-b from-white to-green-50 py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <MotionSectionHeading
            eyebrow="Our Services"
            title="Healthcare Solutions You Can Trust"
            description="We combine compassionate care with practical healthcare solutions designed to improve lives across Cameroon."
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.title}
                className="premium-card rounded-3xl bg-white p-8 shadow-xl transition duration-300 hover:-translate-y-3 hover:shadow-2xl lg:p-10"
              >
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                  <AppIcon
                    icon={service.icon}
                    className="text-3xl text-green-700"
                  />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  {service.title}
                </h3>

                <p className="mt-4 leading-8 text-gray-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ClinicalWorkspaceTabs />

      <section
        id="about"
        className="scroll-mt-24 bg-white py-24 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-[500px] overflow-hidden rounded-[40px] shadow-2xl">
            <Image
              src="/images/hero.png"
              alt="La-Cura healthcare services"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="premium-about-image object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-green-950/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3">
                <AppIcon
                  icon={faHeartPulse}
                  className="text-2xl"
                />

                <p className="text-xl font-bold">
                  Compassionate Care, Every Life
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="font-semibold uppercase tracking-[6px] text-green-700">
              About La-Cura
            </span>

            <h2 className="mt-5 text-4xl font-black leading-tight text-gray-900 sm:text-5xl">
              Care Built Around People
            </h2>

            <p className="mt-7 text-lg leading-9 text-gray-600">
              La-Cura is committed to supporting patients,
              families, caregivers, and healthcare organizations
              with compassionate clinical services and reliable
              healthcare solutions.
            </p>

            <p className="mt-5 text-lg leading-9 text-gray-600">
              Our approach combines professional care,
              dependable medical resources, and technology that
              supports safer documentation and stronger care
              coordination.
            </p>

            <div className="mt-8 space-y-4">
              <CheckItem text="Patient-centered and respectful care" />
              <CheckItem text="Qualified healthcare professionals" />
              <CheckItem text="Reliable clinical documentation systems" />
              <CheckItem text="Commitment to safety and quality improvement" />
            </div>

            <a
              href="#contact"
              className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Contact La-Cura

              <AppIcon
                icon={faArrowRight}
                className="text-base"
              />
            </a>
          </div>
        </div>
      </section>

      <section
        id="products"
        className="scroll-mt-24 bg-slate-50 py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <MotionSectionHeading
            eyebrow="Medical Products"
            title="Reliable Products for Better Care"
            description="We provide medical equipment, patient-care supplies, and healthcare technology that support safer and more efficient care."
          />

          <div className="mt-16 grid gap-9 lg:mt-20 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.title}
                className="premium-card group overflow-hidden rounded-[32px] bg-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex h-64 items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                  <AppIcon
                    icon={product.icon}
                    className="text-7xl text-green-700 transition duration-300 group-hover:scale-110"
                  />
                </div>

                <div className="p-8 lg:p-10">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {product.title}
                  </h3>

                  <p className="mt-5 leading-8 text-gray-600">
                    {product.description}
                  </p>

                  <a
                    href="#contact"
                    className="mt-8 inline-flex items-center gap-3 font-bold text-green-700 transition hover:gap-4"
                  >
                    Learn More

                    <AppIcon
                      icon={faArrowRight}
                      className="text-base"
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <MotionSectionHeading
            eyebrow="Testimonials"
            title="Families Trust La-Cura"
            description="The confidence of patients, families, and communities is central to the work we do."
          />

          <div className="mt-16 grid gap-9 lg:mt-20 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="premium-card rounded-[32px] bg-slate-50 p-8 shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl lg:p-10"
              >
                <AppIcon
                  icon={faQuoteLeft}
                  className="text-3xl text-green-200"
                />

                <div
                  className="mt-5 flex gap-1 text-amber-500"
                  aria-label="Five-star review"
                >
                  {Array.from({ length: 5 }).map(
                    (_, index) => (
                      <AppIcon
                        key={index}
                        icon={faStar}
                        className="text-sm"
                      />
                    )
                  )}
                </div>

                <p className="mt-6 leading-8 text-gray-700">
                  “{testimonial.message}”
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-700 text-xl font-bold text-white">
                    {testimonial.initials}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h3>

                    <p className="text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tips"
        className="scroll-mt-24 bg-gradient-to-b from-green-50 to-white py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <MotionSectionHeading
            eyebrow="Health Tips"
            title="Healthy Living Starts Here"
            description="Small, consistent health habits can support long-term well-being and a better quality of life."
          />

          <div className="mt-16 grid gap-9 lg:mt-20 lg:grid-cols-3">
            {healthTips.map((tip) => (
              <article
                key={tip.title}
                className="premium-card group overflow-hidden rounded-[32px] bg-white shadow-xl transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="h-3 bg-green-700" />

                <div className="p-8 lg:p-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                    <AppIcon
                      icon={tip.icon}
                      className="text-3xl text-green-700 transition group-hover:scale-110"
                    />
                  </div>

                  <h3 className="mt-7 text-2xl font-bold text-gray-900">
                    {tip.title}
                  </h3>

                  <p className="mt-5 leading-8 text-gray-600">
                    {tip.description}
                  </p>

                  <Link
                    href={`/health-tips/${tip.slug}`}
                    className="mt-8 inline-flex items-center gap-3 font-bold text-green-700 transition hover:gap-4 focus:outline-none focus:ring-4 focus:ring-green-100"
                  >
                    Read More

                    <AppIcon
                      icon={faArrowRight}
                      className="text-base"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm font-semibold text-green-800">
            <HealthBadge
              icon={faAppleWhole}
              text="Balanced Nutrition"
            />

            <HealthBadge
              icon={faPersonWalking}
              text="Regular Movement"
            />

            <HealthBadge
              icon={faPills}
              text="Medication Adherence"
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-green-600 py-24 text-center lg:py-28">
        <div className="premium-orbit absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />

        <div className="premium-orbit absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <h2 className="text-4xl font-black text-white sm:text-5xl">
            Building Healthier Communities Together
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-green-100 sm:text-xl">
            Connect with La-Cura to learn more about our care
            services, medical products, and healthcare technology.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-white px-10 py-5 text-lg font-bold text-green-700 shadow-xl transition hover:scale-105"
            >
              Staff Login
            </Link>

            <a
              href="#contact"
              className="rounded-2xl border-2 border-white px-10 py-5 text-lg font-bold text-white transition hover:bg-white hover:text-green-700"
            >
              Contact Us
            </a>
          </div>

          <AnimatedStatistics />
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 bg-white py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <MotionSectionHeading
            eyebrow="Contact Us"
            title="We Would Love to Hear From You"
            description="Contact La-Cura with questions about our healthcare services, medical products, or digital healthcare solutions."
          />

          <div className="mt-16 grid gap-14 lg:mt-20 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-7">
              <ContactCard
                icon={faPhone}
                title="Phone"
                value="+237 675 073 439"
                href="tel:+237675073439"
              />

              <ContactCard
                icon={faEnvelope}
                title="Email"
                value="info@lacurahealth.com"
                href="mailto:info@lacurahealth.com"
              />

              <ContactCard
                icon={faLocationDot}
                title="Location"
                value="Cameroon"
              />

              <ContactCard
                icon={faClock}
                title="Availability"
                value="Healthcare support available 24/7"
              />
            </div>

            <div className="rounded-[40px] bg-slate-50 p-7 shadow-xl sm:p-10">
              <h3 className="text-3xl font-black text-gray-900">
                Send Us a Message
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                Complete the form and a La-Cura representative
                will respond to your inquiry.
              </p>

              <form className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block font-semibold text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white p-5 font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white p-5 font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block font-semibold text-gray-700"
                  >
                    Message
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    required
                    placeholder="Tell us how we can help you..."
                    className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-white p-5 font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-green-700 py-5 text-lg font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
                >
                  <AppIcon
                    icon={faEnvelope}
                    className="text-lg"
                  />

                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 pb-10 pt-20 text-white lg:pt-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-16">
            <div>
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.png"
                  alt="La-Cura logo"
                  width={60}
                  height={60}
                  className="h-15 w-15 object-contain"
                />

                <h2 className="text-4xl font-black text-green-400">
                  La-Cura
                </h2>
              </div>

              <p className="mt-8 leading-8 text-gray-400">
                Delivering compassionate nursing care, elderly
                care, healthcare technology, and quality medical
                products for healthier communities.
              </p>
            </div>

            <FooterColumn
              title="Services"
              links={[
                {
                  label: "Nursing Care",
                  href: "#services",
                },
                {
                  label: "Elderly Care",
                  href: "#services",
                },
                {
                  label: "Healthcare Technology",
                  href: "#services",
                },
                {
                  label: "Medical Products",
                  href: "#products",
                },
              ]}
            />

            <FooterColumn
              title="Quick Links"
              links={[
                {
                  label: "Home",
                  href: "#home",
                },
                {
                  label: "About",
                  href: "#about",
                },
                {
                  label: "Health Tips",
                  href: "#tips",
                },
                {
                  label: "Contact",
                  href: "#contact",
                },
              ]}
            />

            <div>
              <h3 className="text-2xl font-bold">
                Contact
              </h3>

              <ul className="mt-8 space-y-5 text-gray-400">
                <li className="flex items-start gap-3">
                  <AppIcon
                    icon={faPhone}
                    className="mt-1 text-green-400"
                  />

                  <a
                    href="tel:+237675073439"
                    className="transition hover:text-white"
                  >
                    +237 675 073 439
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <AppIcon
                    icon={faEnvelope}
                    className="mt-1 text-green-400"
                  />

                  <a
                    href="mailto:info@lacurahealth.com"
                    className="break-all transition hover:text-white"
                  >
                    info@lacurahealth.com
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <AppIcon
                    icon={faLocationDot}
                    className="mt-1 text-green-400"
                  />

                  <span>Cameroon</span>
                </li>

                <li className="flex items-start gap-3">
                  <AppIcon
                    icon={faClock}
                    className="mt-1 text-green-400"
                  />

                  <span>Open 24/7</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-8 md:flex-row lg:mt-20">
            <p className="text-center text-gray-500">
              © {new Date().getFullYear()} La-Cura Healthcare.
              All Rights Reserved.
            </p>

            <div className="flex gap-3">
              <FooterIcon
                href="tel:+237675073439"
                label="Call La-Cura"
                icon={faPhone}
              />

              <FooterIcon
                href="mailto:info@lacurahealth.com"
                label="Email La-Cura"
                icon={faEnvelope}
              />

              <FooterIcon
                href="#home"
                label="Visit La-Cura home"
                icon={faGlobe}
              />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <span className="font-semibold uppercase tracking-[6px] text-green-700">
        {eyebrow}
      </span>

      <h2 className="mt-5 text-4xl font-black leading-tight text-gray-900 sm:text-5xl">
        {title}
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl sm:leading-9">
        {description}
      </p>
    </div>
  );
}

type CheckItemProps = {
  text: string;
};

function CheckItem({ text }: CheckItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
        <AppIcon
          icon={faCircleCheck}
          className="text-sm text-green-700"
        />
      </div>

      <p className="font-medium text-gray-700">
        {text}
      </p>
    </div>
  );
}

type HealthBadgeProps = {
  icon: IconDefinition;
  text: string;
};

function HealthBadge({
  icon,
  text,
}: HealthBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-3">
      <AppIcon icon={icon} />

      <span>{text}</span>
    </div>
  );
}

type ContactCardProps = {
  icon: IconDefinition;
  title: string;
  value: string;
  href?: string;
};

function ContactCard({
  icon,
  title,
  value,
  href,
}: ContactCardProps) {
  const content = (
    <>
      <h3 className="text-2xl font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-3 text-lg text-gray-600">
        {value}
      </p>
    </>
  );

  return (
    <article className="flex items-start gap-5 rounded-3xl bg-green-50 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:gap-6 sm:p-8">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
        <AppIcon
          icon={icon}
          className="text-2xl"
        />
      </div>

      <div className="min-w-0">
        {href ? (
          <a
            href={href}
            className="group block"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </article>
  );
}

type FooterColumnProps = {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-2xl font-bold">
        {title}
      </h3>

      <ul className="mt-8 space-y-5 text-gray-400">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type FooterIconProps = {
  href: string;
  label: string;
  icon: IconDefinition;
};

function FooterIcon({
  href,
  label,
  icon,
}: FooterIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 transition hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-900"
    >
      <AppIcon icon={icon} />
    </a>
  );
}