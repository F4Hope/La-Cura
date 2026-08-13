"use client";

import {
  useState,
} from "react";

import {
  Check,
  Globe2,
  LoaderCircle,
} from "lucide-react";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import type {
  AppLanguage,
} from "@/components/i18n/LanguageProvider";


export default function StaffLanguageSettings() {
  const {
    language,
    saving,
    error,
    t,
    changeLanguage,
  } =
    useLanguage();


  const [
    success,
    setSuccess,
  ] = useState("");


  async function selectLanguage(
    next:
      AppLanguage
  ) {
    setSuccess("");


    const saved =
      await changeLanguage(
        next
      );


    if (saved) {
      setSuccess(
        next === "fr"
          ? "Préférence linguistique enregistrée."
          : "Language preference saved."
      );


      window.setTimeout(
        () => {
          setSuccess(
            ""
          );
        },
        3000
      );
    }
  }


  return (
    <section className="mb-5 border border-[#D6DFDA] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[#D6DFDA] bg-[#F5F6F2] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#CDD8D2] bg-white text-[#073B2F]">
            <Globe2
              size={18}
            />
          </div>

          <div>
            <h2 className="text-[14px] font-bold text-[#173128]">
              {t(
                "settings.language.title"
              )}
            </h2>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7A8982]">
              {t(
                "settings.language.personal"
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-bold uppercase text-[#7A8982]">
            {t(
              "settings.language.current"
            )}
          </p>

          <p className="mt-0.5 text-[11px] font-bold text-[#073B2F]">
            {language ===
            "fr"
              ? "Français"
              : "English"}
          </p>
        </div>
      </div>


      <div className="p-4">
        <p className="max-w-3xl text-[11px] leading-5 text-[#586A62]">
          {t(
            "settings.language.description"
          )}
        </p>


        <div className="mt-4 grid max-w-xl grid-cols-2 gap-2">
          <LanguageButton
            language="en"
            active={
              language ===
              "en"
            }
            disabled={
              saving
            }
            label="English"
            secondary="English"
            onClick={() =>
              void selectLanguage(
                "en"
              )
            }
          />


          <LanguageButton
            language="fr"
            active={
              language ===
              "fr"
            }
            disabled={
              saving
            }
            label="Français"
            secondary="French"
            onClick={() =>
              void selectLanguage(
                "fr"
              )
            }
          />
        </div>


        <div className="mt-4 border-l-2 border-[#D5A437] bg-[#FAF8F0] px-3 py-2">
          <p className="text-[10px] leading-5 text-[#5F665D]">
            {t(
              "settings.language.clinicalData"
            )}
          </p>
        </div>


        {saving && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-[#52675E]">
            <LoaderCircle
              size={12}
              className="animate-spin"
            />

            {language ===
            "fr"
              ? "Enregistrement..."
              : "Saving..."}
          </div>
        )}


        {success && (
          <div className="mt-3 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-800">
            <Check
              size={12}
            />

            {success}
          </div>
        )}


        {error && (
          <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}


function LanguageButton({
  language,
  active,
  disabled,
  label,
  secondary,
  onClick,
}: {
  language:
    AppLanguage;

  active:
    boolean;

  disabled:
    boolean;

  label:
    string;

  secondary:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      aria-pressed={
        active
      }
      className={`
        flex min-h-[62px]
        items-center
        justify-between
        border px-3 py-2
        text-left transition
        disabled:cursor-not-allowed
        disabled:opacity-60

        ${
          active
            ? "border-[#073B2F] bg-[#E8F0EB]"
            : "border-[#BCC9C2] bg-white hover:bg-[#F7F7F3]"
        }
      `}
    >
      <div>
        <p className="text-[12px] font-bold text-[#203A30]">
          {label}
        </p>

        <p className="mt-0.5 text-[9px] uppercase tracking-[0.07em] text-[#7B8982]">
          {secondary}
        </p>
      </div>


      <span
        className={`
          flex h-5 w-5
          items-center
          justify-center
          border

          ${
            active
              ? "border-[#073B2F] bg-[#073B2F] text-white"
              : "border-[#B7C4BD] bg-white text-transparent"
          }
        `}
      >
        <Check
          size={11}
        />
      </span>


      <span className="sr-only">
        {language}
      </span>
    </button>
  );
}
