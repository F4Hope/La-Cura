"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useStaffSession,
} from "@/components/StaffSessionProvider";

import {
  supabase,
} from "@/lib/supabase/client";


export type AppLanguage =
  | "en"
  | "fr";


const english = {
  "brand.workspace":
    "Clinical Workspace",

  "staff.clinical":
    "Clinical Staff",

  "session.secure":
    "Secure clinical session",

  "account.my":
    "My account",

  "nav.home":
    "Home",

  "nav.residents":
    "Residents",

  "nav.clinical":
    "Clinical",

  "nav.carePlans":
    "Care Plans",

  "nav.recordVitals":
    "Record Vitals",

  "nav.nursingNotes":
    "Nursing Notes",

  "nav.incidentReports":
    "Incident Reports",

  "nav.medicationAdministration":
    "Medication Administration",

  "nav.appointments":
    "Appointments",

  "nav.medications":
    "Medications",

  "nav.reports":
    "Reports",

  "nav.admin":
    "Admin",

  "nav.staffManagement":
    "Staff Management",

  "nav.settings":
    "Settings",

  "nav.clinicalBrand":
    "La-Cura Clinical",

  "settings.language.title":
    "Language",

  "settings.language.description":
    "Choose the language used by your La-Cura interface. This preference is saved to your staff account.",

  "settings.language.english":
    "English",

  "settings.language.french":
    "Français",

  "settings.language.current":
    "Current interface language",

  "settings.language.saved":
    "Language preference saved.",

  "settings.language.error":
    "Language preference could not be saved.",

  "settings.language.personal":
    "Personal staff preference",

  "settings.language.clinicalData":
    "Clinical documentation entered by staff is not translated or altered.",
} as const;


export type TranslationKey =
  keyof typeof english;


const french:
  Record<
    TranslationKey,
    string
  > = {
  "brand.workspace":
    "Espace clinique",

  "staff.clinical":
    "Personnel clinique",

  "session.secure":
    "Session clinique sécurisée",

  "account.my":
    "Mon compte",

  "nav.home":
    "Accueil",

  "nav.residents":
    "Résidents",

  "nav.clinical":
    "Clinique",

  "nav.carePlans":
    "Plans de soins",

  "nav.recordVitals":
    "Saisir les signes vitaux",

  "nav.nursingNotes":
    "Notes infirmières",

  "nav.incidentReports":
    "Rapports d’incident",

  "nav.medicationAdministration":
    "Administration des médicaments",

  "nav.appointments":
    "Rendez-vous",

  "nav.medications":
    "Médicaments",

  "nav.reports":
    "Rapports",

  "nav.admin":
    "Admin",

  "nav.staffManagement":
    "Gestion du personnel",

  "nav.settings":
    "Paramètres",

  "nav.clinicalBrand":
    "La-Cura Clinique",

  "settings.language.title":
    "Langue",

  "settings.language.description":
    "Choisissez la langue utilisée par votre interface La-Cura. Cette préférence est enregistrée dans votre compte du personnel.",

  "settings.language.english":
    "English",

  "settings.language.french":
    "Français",

  "settings.language.current":
    "Langue actuelle de l’interface",

  "settings.language.saved":
    "Préférence linguistique enregistrée.",

  "settings.language.error":
    "La préférence linguistique n’a pas pu être enregistrée.",

  "settings.language.personal":
    "Préférence personnelle du personnel",

  "settings.language.clinicalData":
    "Les documents cliniques saisis par le personnel ne sont ni traduits ni modifiés.",
};


const dictionaries:
  Record<
    AppLanguage,
    Record<
      TranslationKey,
      string
    >
  > = {
  en: english,
  fr: french,
};


type LanguageContextValue = {
  language:
    AppLanguage;

  locale: string;

  saving: boolean;

  error: string;

  t: (
    key:
      TranslationKey
  ) => string;

  changeLanguage: (
    language:
      AppLanguage
  ) => Promise<boolean>;
};


const LanguageContext =
  createContext<
    LanguageContextValue | undefined
  >(undefined);


function parseLanguage(
  value: unknown
): AppLanguage | null {
  const normalized =
    typeof value ===
      "string"
      ? value
          .trim()
          .toLowerCase()
      : "";

  if (
    normalized === "en" ||
    normalized === "fr"
  ) {
    return normalized;
  }

  return null;
}


function getErrorMessage(
  value: unknown
) {
  if (
    value instanceof Error
  ) {
    return value.message;
  }

  if (
    value &&
    typeof value ===
      "object"
  ) {
    const record =
      value as Record<
        string,
        unknown
      >;

    if (
      typeof record.message ===
        "string"
    ) {
      return record.message;
    }
  }

  return "";
}


export default function LanguageProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const router =
    useRouter();

  const {
    staff,
    refreshStaff,
  } =
    useStaffSession();


  const staffRecord =
    (staff ??
      {}) as Record<
      string,
      unknown
    >;


  const staffId =
    Number(
      staffRecord.id
    );


  const sessionLanguage =
    parseLanguage(
      staffRecord.preferred_language
    );


  const [
    language,
    setLanguage,
  ] =
    useState<AppLanguage>(
      sessionLanguage ??
        "en"
    );


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    if (
      sessionLanguage
    ) {
      setLanguage(
        sessionLanguage
      );

      return;
    }


    if (
      !Number.isInteger(
        staffId
      ) ||
      staffId <= 0
    ) {
      return;
    }


    let active =
      true;


    async function loadLanguage() {
      const {
        data,
        error:
          loadError,
      } =
        await supabase
          .from(
            "staff"
          )
          .select(
            "preferred_language"
          )
          .eq(
            "id",
            staffId
          )
          .maybeSingle();


      if (
        !active ||
        loadError
      ) {
        return;
      }


      const stored =
        parseLanguage(
          data
            ?.preferred_language
        );


      if (stored) {
        setLanguage(
          stored
        );
      }
    }


    void loadLanguage();


    return () => {
      active =
        false;
    };
  }, [
    sessionLanguage,
    staffId,
  ]);


  useEffect(() => {
    document.documentElement.lang =
      language;

    document.documentElement.dataset.language =
      language;
  }, [
    language,
  ]);


  const changeLanguage =
    useCallback(
      async (
        nextLanguage:
          AppLanguage
      ) => {
        if (
          saving
        ) {
          return false;
        }


        if (
          nextLanguage ===
          language
        ) {
          return true;
        }


        const previous =
          language;


        setLanguage(
          nextLanguage
        );

        setSaving(true);

        setError("");


        try {
          const {
            error:
              updateError,
          } =
            await supabase.rpc(
              "la_cura_set_preferred_language",
              {
                p_language:
                  nextLanguage,
              }
            );


          if (
            updateError
          ) {
            throw updateError;
          }


          await refreshStaff();

          router.refresh();


          return true;
        } catch (
          caughtError
        ) {
          console.error(
            "Unable to save staff language preference:",
            caughtError
          );


          setLanguage(
            previous
          );


          setError(
            getErrorMessage(
              caughtError
            ) ||
              english[
                "settings.language.error"
              ]
          );


          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        language,
        refreshStaff,
        router,
        saving,
      ]
    );


  const value =
    useMemo<
      LanguageContextValue
    >(
      () => ({
        language,

        locale:
          language ===
          "fr"
            ? "fr-CM"
            : "en-CM",

        saving,

        error,

        t: (
          key:
            TranslationKey
        ) =>
          dictionaries[
            language
          ][key] ??
          english[key],

        changeLanguage,
      }),
      [
        language,
        saving,
        error,
        changeLanguage,
      ]
    );


  return (
    <LanguageContext.Provider
      value={
        value
      }
    >
      {children}
    </LanguageContext.Provider>
  );
}


export function useOptionalLanguage() {
  return useContext(
    LanguageContext
  );
}


export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    );


  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }


  return context;
}
