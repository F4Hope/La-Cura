"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-900 via-green-700 to-emerald-500 flex items-center justify-center px-6">

      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-300/20 blur-3xl animate-pulse"></div>

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-200/10 blur-3xl animate-pulse"></div>

      <div className="relative w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl p-10 animate-[fadeIn_0.8s_ease]">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-extrabold text-green-700 animate-[heartbeat_2.5s_ease-in-out_infinite]">
            La-Cura
          </h1>

          <p className="text-gray-500 mt-2">
            Healthcare Management System
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-8">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2">
            Sign in to continue
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <div>

            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-600 focus:ring-2 focus:ring-green-400 outline-none transition"
            />

          </div>

          <div>

            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-800 focus:border-green-600 focus:ring-2 focus:ring-green-400 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
              >
                {showPassword ? (
                  <EyeOff size={22} />
                ) : (
                  <Eye size={22} />
                )}
              </button>

            </div>

          </div>

          <div className="flex items-center justify-between">

            <label className="flex items-center gap-2 text-gray-600 text-sm">

              <input
                type="checkbox"
                className="accent-green-700"
              />

              Remember Me

            </label>

            <button
              type="button"
              className="text-green-700 hover:underline text-sm"
            >
              Forgot Password?
            </button>

          </div>

          {error && (
            <div className="rounded-xl bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-700 py-3 text-white font-semibold hover:bg-green-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

        </form>

      </div>

    </main>
  );
}