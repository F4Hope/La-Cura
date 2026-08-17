export type DiagnosisLanguage = "en" | "fr";

export type DiagnosisStatus = "Active" | "Resolved";
export type DiagnosisType = "Primary" | "Secondary";
export type DiagnosisCodeSystem = "ICD-10" | "ICD-11" | "Other";

const fr: Record<string, string> = {
  "Medical Diagnoses": "Diagnostics médicaux",
  "New Diagnosis": "Nouveau diagnostic",
  "Search diagnoses...": "Rechercher des diagnostics...",
  "All Statuses": "Tous les statuts",
  "All Types": "Tous les types",
  "Refresh": "Actualiser",
  "Active Diagnoses": "Diagnostics actifs",
  "Primary Diagnosis": "Diagnostic principal",
  "Resolved Diagnoses": "Diagnostics résolus",
  "Actions": "Actions",
  "Diagnosis": "Diagnostic",
  "Code": "Code",
  "Type": "Type",
  "Status": "Statut",
  "Onset Date": "Date de début",
  "Diagnosed By": "Diagnostiqué par",
  "Updated": "Mis à jour",
  "View": "Voir",
  "Edit / Revise": "Modifier / Réviser",
  "Mark Resolved": "Marquer comme résolu",
  "Reactivate": "Réactiver",
  "History": "Historique",
  "No diagnosis records match the selected filters.": "Aucun diagnostic ne correspond aux filtres sélectionnés.",
  "Diagnosis Details": "Détails du diagnostic",
  "Code System": "Système de codification",
  "Diagnosis Code": "Code du diagnostic",
  "Resolution Date": "Date de résolution",
  "Source": "Source",
  "Clinical Notes": "Notes cliniques",
  "Created By": "Créé par",
  "Revision": "Révision",
  "Close": "Fermer",
  "Diagnosis History": "Historique du diagnostic",
  "Date / Time": "Date / Heure",
  "Action": "Action",
  "Previous": "Précédent",
  "New": "Nouveau",
  "Staff": "Personnel",
  "No revision history is available.": "Aucun historique de révision n’est disponible.",
  "Resident": "Résident",
  "Revise Diagnosis": "Réviser le diagnostic",
  "Diagnosis Information": "Informations sur le diagnostic",
  "Diagnosis / Problem": "Diagnostic / Problème",
  "Primary": "Principal",
  "Secondary": "Secondaire",
  "Active": "Actif",
  "Resolved": "Résolu",
  "Other": "Autre",
  "Optional. Use the classification documented by the clinician.": "Facultatif. Utilisez la classification documentée par le clinicien.",
  "Clinical Context": "Contexte clinique",
  "Date diagnosed or first recognized": "Date du diagnostic ou de la première identification",
  "Physician or clinician": "Médecin ou clinicien",
  "Facility, hospital record, referral, etc.": "Établissement, dossier hospitalier, référence, etc.",
  "Save Diagnosis": "Enregistrer le diagnostic",
  "Save Revision": "Enregistrer la révision",
  "Saving...": "Enregistrement...",
  "Cancel": "Annuler",
  "Diagnosis is required.": "Le diagnostic est obligatoire.",
  "Resolution date is required for a resolved diagnosis.": "La date de résolution est obligatoire pour un diagnostic résolu.",
  "The diagnosis record could not be saved.": "Le diagnostic n’a pas pu être enregistré.",
  "Resolve Diagnosis": "Résoudre le diagnostic",
  "Resolve": "Résoudre",
  "Resolution date": "Date de résolution",
  "Optional note": "Note facultative",
  "Reopen Diagnosis": "Réactiver le diagnostic",
  "Reopen": "Réactiver",
  "This diagnosis will return to Active status.": "Ce diagnostic repassera au statut Actif.",
  "Only physicians and administrators can add or revise diagnoses.": "Seuls les médecins et les administrateurs peuvent ajouter ou réviser les diagnostics.",
  "Nurses have read-only access to the diagnosis record.": "Les infirmier(ère)s disposent d’un accès en lecture seule au dossier des diagnostics.",
  "Current staff access could not be verified.": "L’accès du membre du personnel connecté n’a pas pu être vérifié.",
  "Created": "Créé",
  "Revised": "Révisé",
  "Reactivated": "Réactivé",
  "Imported": "Importé",
  "Primary changed": "Diagnostic principal modifié",
  "Recorded clinical diagnosis": "Diagnostic clinique enregistré",
  "Not recorded": "Non renseigné",
};

export function diagnosisText(
  language: DiagnosisLanguage,
  value: string
) {
  return language === "fr"
    ? fr[value] ?? value
    : value;
}

export function diagnosisLocale(
  language: DiagnosisLanguage
) {
  return language === "fr" ? "fr-CM" : "en-CM";
}

export function diagnosisStatusLabel(
  language: DiagnosisLanguage,
  value: DiagnosisStatus | string
) {
  return diagnosisText(language, value);
}

export function diagnosisTypeLabel(
  language: DiagnosisLanguage,
  value: DiagnosisType | string
) {
  return diagnosisText(language, value);
}

export function diagnosisCodeSystemLabel(
  language: DiagnosisLanguage,
  value: DiagnosisCodeSystem | string
) {
  return diagnosisText(language, value);
}
