import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-500 text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6">

        <div className="flex items-center gap-3">

          <Image
            src="/logo.png"
            alt="La-Cura Logo"
            width={55}
            height={55}
            priority
          />

          <span className="text-3xl font-bold">
            La-Cura
          </span>

        </div>

        <div className="flex items-center gap-8 text-lg">

          <a href="#">Home</a>
          <a href="#">Products</a>
          <a href="#">About</a>
          <a href="#">Contact</a>

          <Link
            href="/login"
            className="bg-white text-green-700 px-5 py-2 rounded-xl font-semibold hover:bg-green-100 transition"
          >
            Staff Login
          </Link>

        </div>

      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-8 py-28">

        <h1 className="text-7xl font-bold mb-6">
          Healthcare You Can Trust
        </h1>

        <p className="text-2xl max-w-3xl text-emerald-100 leading-relaxed">
          Delivering innovative medical products and compassionate healthcare
          solutions that improve lives across Cameroon and beyond.
        </p>

        <div className="mt-12 flex gap-6">

          <Link
            href="/login"
            className="bg-white text-emerald-700 px-8 py-4 rounded-xl text-xl font-semibold hover:scale-105 transition"
          >
            Staff Login
          </Link>

          <button className="border-2 border-white px-8 py-4 rounded-xl text-xl hover:bg-white hover:text-emerald-700 transition">
            Explore Products
          </button>

        </div>

      </section>

      {/* About */}
      <section className="py-24 px-8 bg-white">

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div>

            <h2 className="text-4xl font-bold text-green-900 mb-6">
              About La-Cura
            </h2>

            <p className="text-gray-700 text-lg leading-8">
              La-Cura is committed to improving healthcare by providing
              high-quality medical care, medical products, healthcare
              solutions, and professional services across Cameroon and beyond.
            </p>

            <p className="text-gray-700 text-lg leading-8 mt-6">
              We believe every person and community deserves access to
              reliable healthcare, delivered with compassion, innovation,
              and excellence.
            </p>

          </div>

          <div className="bg-green-100 rounded-3xl h-96 flex items-center justify-center">

            <span className="text-green-700 text-xl">
              Company Image Coming Soon
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}