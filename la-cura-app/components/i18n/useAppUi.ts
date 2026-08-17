"use client";

import {
  useCallback,
} from "react";

import {
  useOptionalLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  uiText,
} from "@/lib/i18n/appUi";

export default function useAppUi() {
  const languageContext =
    useOptionalLanguage();

  const language =
    languageContext?.language ??
    "en";

  const locale =
    languageContext?.locale ??
    "en-CM";

  const ui =
    useCallback(
      (value: string) =>
        uiText(
          language,
          value
        ),
      [language]
    );

  return {
    language,
    locale,
    ui,
  };
}
