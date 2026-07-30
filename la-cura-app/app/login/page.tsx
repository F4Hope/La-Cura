"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  faArrowLeft,
  faEnvelope,
  faEye,
  faEyeSlash,
  faHeartPulse,
  faLock,
  faRightToBracket,
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: signInError } =
        await signIn(
          email.trim(),
          password
        );

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (rememberMe) {
        window.localStorage.setItem(
          "la-cura-remembered-email",
          email.trim()
        );
      } else {
        window.localStorage.removeItem(
          "la-cura-remembered-email"
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (caughtError) {
      console.error(
        "Login failed:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-700 to-emerald-500 px-5 py-10">
      <div className="absolute -left-24 -top-24 h-96 w-96 animate-pulse rounded-full bg-green-300/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-200/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white/95 p-7 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="mb-9 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 shadow-sm">
            <AppIcon
              icon={faHeartPulse}
              className="text-4xl text-green-700"
            />
          </div>

          <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-green-700">
            La-Cura
          </h1>

          <p className="mt-2 text-gray-500">
            Healthcare Management System
          </p>

          <h2 className="mt-8 text-3xl font-bold text-gray-800">
            Welcome Back
          </h2>

          <p className="mt-2 text-gray-500">
            Sign in with your staff account
            to continue
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-700"
            >
              Email
            </label>

            <div className="relative">
              <AppIcon
                icon={faEnvelope}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <AppIcon
                icon={faLock}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-12 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (currentValue) =>
                      !currentValue
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-green-700 focus:outline-none disabled:opacity-50"
              >
                <AppIcon
                  icon={
                    showPassword
                      ? faEyeSlash
                      : faEye
                  }
                  className="text-lg"
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
                disabled={loading}
                className="h-4 w-4 accent-green-700"
              />

              Remember Me
            </label>

            <button
              type="button"
              className="text-sm font-semibold text-green-700 transition hover:text-green-800 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AppIcon
                icon={faTriangleExclamation}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 py-3.5 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <AppIcon
                  icon={faSpinner}
                  className="text-lg"
                  spin
                />

                Signing In...
              </>
            ) : (
              <>
                <AppIcon
                  icon={faRightToBracket}
                  className="text-lg"
                />

                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs leading-5 text-gray-400">
          Authorized La-Cura staff access
          only. Clinical information is
          confidential.
        </p>
      </div>

      <Link
        href="/"
        aria-label="Return to La-Cura home page"
        className="fixed bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-white/20 sm:bottom-7 sm:left-7 sm:px-5 sm:py-3"
      >
        <AppIcon
          icon={faArrowLeft}
          className="text-sm"
        />

        Back to Home
      </Link>
    </main>
  );
}