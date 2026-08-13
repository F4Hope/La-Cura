export type AllergyLanguage =
  | "en"
  | "fr";


export type AllergyTypeValue =
  | "Medication"
  | "Food"
  | "Environmental"
  | "Other";


export type AllergySeverityValue =
  | "Unknown"
  | "Mild"
  | "Moderate"
  | "Severe";


export type AllergyStatusValue =
  | "Active"
  | "Inactive";


const english = {
  newAllergy:
    "New Allergy",

  searchPlaceholder:
    "Search allergies...",

  refresh:
    "Refresh",

  all:
    "All",

  activeAllergies:
    "Active Allergies",

  actions:
    "Actions",

  allergen:
    "Allergen",

  type:
    "Type",

  allergyType:
    "Allergy Type",

  reaction:
    "Reaction",

  severity:
    "Severity",

  status:
    "Status",

  onset:
    "Onset",

  onsetDate:
    "Onset Date",

  revision:
    "Revision",

  view:
    "View",

  editRevise:
    "Edit / Revise",

  inactivate:
    "Inactivate",

  reactivate:
    "Reactivate",

  history:
    "History",

  noMatchingRecords:
    "No allergy records match the selected filters.",

  emptyListWarning:
    "Do not interpret an empty structured allergy list as confirmation of no known allergies.",

  allergyDetails:
    "Allergy Details",

  source:
    "Source",

  informationSource:
    "Information Source",

  recordedBy:
    "Recorded By",

  clinicalNotes:
    "Clinical Notes",

  noNotes:
    "No notes recorded.",

  allergyHistory:
    "Allergy History",

  dateTime:
    "Date / Time",

  action:
    "Action",

  previous:
    "Previous",

  new:
    "New",

  staff:
    "Staff",

  noHistory:
    "No allergy history is available.",

  resident:
    "Resident",

  reviseAllergy:
    "Revise Allergy",

  saveRevision:
    "Save Revision",

  saveAllergy:
    "Save Allergy",

  cancel:
    "Cancel",

  close:
    "Close",

  allergenRequired:
    "Allergen is required.",

  loadError:
    "Resident allergies could not be loaded.",

  saveError:
    "The allergy record could not be saved.",

  statusError:
    "The allergy status could not be changed.",

  allergenPlaceholder:
    "Penicillin, shellfish, latex...",

  reactionPlaceholder:
    "Rash, swelling, anaphylaxis...",

  sourcePlaceholder:
    "Resident, family, hospital record...",
} as const;


export type AllergyTextKey =
  keyof typeof english;


const french:
  Record<
    AllergyTextKey,
    string
  > = {
  newAllergy:
    "Nouvelle allergie",

  searchPlaceholder:
    "Rechercher des allergies...",

  refresh:
    "Actualiser",

  all:
    "Tous",

  activeAllergies:
    "Allergies actives",

  actions:
    "Actions",

  allergen:
    "Allergène",

  type:
    "Type",

  allergyType:
    "Type d’allergie",

  reaction:
    "Réaction",

  severity:
    "Gravité",

  status:
    "Statut",

  onset:
    "Début",

  onsetDate:
    "Date de début",

  revision:
    "Révision",

  view:
    "Afficher",

  editRevise:
    "Modifier / Réviser",

  inactivate:
    "Désactiver",

  reactivate:
    "Réactiver",

  history:
    "Historique",

  noMatchingRecords:
    "Aucun dossier d’allergie ne correspond aux filtres sélectionnés.",

  emptyListWarning:
    "Ne pas interpréter une liste structurée vide comme la confirmation de l’absence d’allergies connues.",

  allergyDetails:
    "Détails de l’allergie",

  source:
    "Source",

  informationSource:
    "Source de l’information",

  recordedBy:
    "Enregistré par",

  clinicalNotes:
    "Notes cliniques",

  noNotes:
    "Aucune note enregistrée.",

  allergyHistory:
    "Historique de l’allergie",

  dateTime:
    "Date / Heure",

  action:
    "Action",

  previous:
    "Précédent",

  new:
    "Nouveau",

  staff:
    "Personnel",

  noHistory:
    "Aucun historique d’allergie n’est disponible.",

  resident:
    "Résident",

  reviseAllergy:
    "Réviser l’allergie",

  saveRevision:
    "Enregistrer la révision",

  saveAllergy:
    "Enregistrer l’allergie",

  cancel:
    "Annuler",

  close:
    "Fermer",

  allergenRequired:
    "L’allergène est obligatoire.",

  loadError:
    "Les allergies du résident n’ont pas pu être chargées.",

  saveError:
    "Le dossier d’allergie n’a pas pu être enregistré.",

  statusError:
    "Le statut de l’allergie n’a pas pu être modifié.",

  allergenPlaceholder:
    "Pénicilline, crustacés, latex...",

  reactionPlaceholder:
    "Éruption cutanée, gonflement, anaphylaxie...",

  sourcePlaceholder:
    "Résident, famille, dossier hospitalier...",
};


export function allergyText(
  language:
    AllergyLanguage,

  key:
    AllergyTextKey
) {
  return language ===
    "fr"
    ? french[key]
    : english[key];
}


export function allergyLocale(
  language:
    AllergyLanguage
) {
  return language ===
    "fr"
    ? "fr-CM"
    : "en-CM";
}


export function allergyTypeLabel(
  language:
    AllergyLanguage,

  value:
    string
) {
  if (
    language ===
    "fr"
  ) {
    switch (
      value
    ) {
      case "Medication":
        return "Médicament";

      case "Food":
        return "Alimentaire";

      case "Environmental":
        return "Environnementale";

      case "Other":
        return "Autre";
    }
  }


  return value;
}


export function allergySeverityLabel(
  language:
    AllergyLanguage,

  value:
    string
) {
  if (
    language ===
    "fr"
  ) {
    switch (
      value
    ) {
      case "Unknown":
        return "Inconnue";

      case "Mild":
        return "Légère";

      case "Moderate":
        return "Modérée";

      case "Severe":
        return "Sévère";
    }
  }


  return value;
}


export function allergyStatusLabel(
  language:
    AllergyLanguage,

  value:
    string
) {
  if (
    language ===
    "fr"
  ) {
    switch (
      value
    ) {
      case "Active":
        return "Active";

      case "Inactive":
        return "Inactive";
    }
  }


  return value;
}


export function allergyStatusConfirmation(
  language:
    AllergyLanguage,

  status:
    AllergyStatusValue,

  allergen:
    string
) {
  if (
    language ===
    "fr"
  ) {
    return status ===
      "Inactive"
      ? `Désactiver l’allergie à « ${allergen} » ?`
      : `Réactiver l’allergie à « ${allergen} » ?`;
  }


  return status ===
    "Inactive"
    ? `Inactivate the allergy to "${allergen}"?`
    : `Reactivate the allergy to "${allergen}"?`;
}


export function allergyHistoryActionLabel(
  language:
    AllergyLanguage,

  value:
    string
) {
  if (
    language !==
    "fr"
  ) {
    return value;
  }


  switch (
    value
  ) {
    case "Created":
      return "Créée";

    case "Revised":
      return "Révisée";

    case "Status Changed":
      return "Statut modifié";

    case "Inactivated":
      return "Désactivée";

    case "Reactivated":
      return "Réactivée";

    default:
      return value;
  }
}
