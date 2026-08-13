export type ResidentLanguage =
  | "en"
  | "fr";


const english = {
  "common.notRecorded":
    "Not recorded",

  "common.notAssigned":
    "Not assigned",

  "common.unassigned":
    "Unassigned",

  "common.years":
    "years",

  "common.add":
    "Add",

  "common.edit":
    "Edit",

  "common.view":
    "View",

  "common.save":
    "Save",

  "common.cancel":
    "Cancel",

  "common.active":
    "Active",

  "common.inactive":
    "Inactive",

  "common.pending":
    "Pending",

  "common.completed":
    "Completed",

  "common.noRecords":
    "No records found",


  "tabs.aria":
    "Resident clinical record",

  "tab.dash":
    "DASH",

  "tab.profile":
    "PROFILE",

  "tab.census":
    "CENSUS",

  "tab.medDiag":
    "MED DIAG",

  "tab.allergies":
    "ALLERGIES",

  "tab.immun":
    "IMMUN",

  "tab.orders":
    "ORDERS",

  "tab.vitals":
    "WTS/VITALS",

  "tab.results":
    "RESULTS",

  "tab.mds":
    "MDS",

  "tab.assmnts":
    "ASSMNTS",

  "tab.therapy":
    "THERAPY",

  "tab.progNotes":
    "PROG NOTES",

  "tab.carePlan":
    "CARE PLAN",

  "tab.tasks":
    "TASKS",

  "tab.misc":
    "MISC",


  "title.dash":
    "Resident Dashboard",

  "title.profile":
    "Resident Profile",

  "title.census":
    "Census Information",

  "title.medDiag":
    "Medical Diagnosis",

  "title.allergies":
    "Allergies",

  "title.immun":
    "Immunizations",

  "title.orders":
    "Orders",

  "title.vitals":
    "Weights / Vitals",

  "title.results":
    "Results",

  "title.mds":
    "MDS",

  "title.assmnts":
    "Assessments",

  "title.therapy":
    "Therapy",

  "title.progNotes":
    "Progress Notes",

  "title.carePlan":
    "Care Plan",

  "title.tasks":
    "Tasks",

  "title.misc":
    "Miscellaneous",


  "shell.residents":
    "Residents",

  "shell.recordVitals":
    "Record Vitals",

  "shell.addMedication":
    "Add Medication",

  "shell.progressNote":
    "Progress Note",

  "shell.incident":
    "Incident",

  "shell.residentNumber":
    "Resident #",

  "shell.dobAge":
    "DOB / Age",

  "shell.sex":
    "Sex",

  "shell.room":
    "Room",

  "shell.physician":
    "Physician",

  "shell.recentVitals":
    "Most Recent Vitals",

  "shell.noVitals":
    "No vitals recorded",

  "shell.bp":
    "BP",

  "shell.temp":
    "Temp",

  "shell.pulse":
    "Pulse",

  "shell.oxygen":
    "O₂",

  "shell.pain":
    "Pain",

  "shell.allergies":
    "Allergies:",

  "shell.noKnownAllergies":
    "No known allergies",

  "shell.specialInstructions":
    "Special Instructions:",

  "shell.noSpecialInstructions":
    "No special instructions recorded",

  "shell.admission":
    "Admission:",

  "shell.unnamedResident":
    "Unnamed Resident",


  "profile.demographics":
    "Demographics",

  "profile.residentName":
    "Resident Name",

  "profile.residentId":
    "Resident ID",

  "profile.dateOfBirth":
    "Date of Birth",

  "profile.age":
    "Age",

  "profile.sex":
    "Sex",

  "profile.bloodGroup":
    "Blood Group",

  "profile.contactCareTeam":
    "Contact / Care Team",

  "profile.primaryPhysician":
    "Primary Physician",

  "profile.nextOfKin":
    "Next of Kin",

  "profile.nextOfKinPhone":
    "Next of Kin Phone",

  "profile.emergencyContact":
    "Emergency Contact",

  "profile.room":
    "Room",

  "profile.status":
    "Status",


  "census.title":
    "Census / Admission",

  "census.currentStatus":
    "Current Status",

  "census.roomBed":
    "Room / Bed",

  "census.admissionDate":
    "Admission Date",

  "census.primaryPhysician":
    "Primary Physician",


  "diagnosis.title":
    "Medical Diagnoses",

  "diagnosis.current":
    "Current Diagnosis",

  "diagnosis.none":
    "No diagnosis recorded.",


  "carePlan.title":
    "Resident Care Plan",

  "carePlan.description":
    "Review problems, goals, interventions, and care-plan follow-up for this resident.",

  "carePlan.open":
    "Open Care Plans",


  "misc.title":
    "Resident Notes / Miscellaneous",

  "misc.none":
    "No miscellaneous resident notes recorded.",


  "empty.mds":
    "MDS assessment records will appear in this resident module.",

  "empty.assessments":
    "Resident assessments will appear here as assessment modules are added.",

  "empty.therapy":
    "Therapy documentation and treatment records will appear here.",

  "empty.tasks":
    "Resident-specific clinical tasks will appear here.",
} as const;


export type ResidentTextKey =
  keyof typeof english;


const french:
  Record<
    ResidentTextKey,
    string
  > = {
  "common.notRecorded":
    "Non renseigné",

  "common.notAssigned":
    "Non attribué",

  "common.unassigned":
    "Non attribuée",

  "common.years":
    "ans",

  "common.add":
    "Ajouter",

  "common.edit":
    "Modifier",

  "common.view":
    "Afficher",

  "common.save":
    "Enregistrer",

  "common.cancel":
    "Annuler",

  "common.active":
    "Actif",

  "common.inactive":
    "Inactif",

  "common.pending":
    "En attente",

  "common.completed":
    "Terminé",

  "common.noRecords":
    "Aucun dossier trouvé",


  "tabs.aria":
    "Dossier clinique du résident",

  "tab.dash":
    "TABLEAU",

  "tab.profile":
    "PROFIL",

  "tab.census":
    "RECENSEMENT",

  "tab.medDiag":
    "DIAG MÉD.",

  "tab.allergies":
    "ALLERGIES",

  "tab.immun":
    "VACCINS",

  "tab.orders":
    "ORDONNANCES",

  "tab.vitals":
    "POIDS/S.VITAUX",

  "tab.results":
    "RÉSULTATS",

  "tab.mds":
    "MDS",

  "tab.assmnts":
    "ÉVALUATIONS",

  "tab.therapy":
    "THÉRAPIE",

  "tab.progNotes":
    "NOTES ÉVOL.",

  "tab.carePlan":
    "PLAN SOINS",

  "tab.tasks":
    "TÂCHES",

  "tab.misc":
    "DIVERS",


  "title.dash":
    "Tableau de bord du résident",

  "title.profile":
    "Profil du résident",

  "title.census":
    "Informations de séjour",

  "title.medDiag":
    "Diagnostic médical",

  "title.allergies":
    "Allergies",

  "title.immun":
    "Vaccinations",

  "title.orders":
    "Ordonnances",

  "title.vitals":
    "Poids / Signes vitaux",

  "title.results":
    "Résultats",

  "title.mds":
    "MDS",

  "title.assmnts":
    "Évaluations",

  "title.therapy":
    "Thérapie",

  "title.progNotes":
    "Notes d’évolution",

  "title.carePlan":
    "Plan de soins",

  "title.tasks":
    "Tâches",

  "title.misc":
    "Divers",


  "shell.residents":
    "Résidents",

  "shell.recordVitals":
    "Saisir les signes vitaux",

  "shell.addMedication":
    "Ajouter un médicament",

  "shell.progressNote":
    "Note d’évolution",

  "shell.incident":
    "Incident",

  "shell.residentNumber":
    "Résident n°",

  "shell.dobAge":
    "Date de naissance / Âge",

  "shell.sex":
    "Sexe",

  "shell.room":
    "Chambre",

  "shell.physician":
    "Médecin",

  "shell.recentVitals":
    "Derniers signes vitaux",

  "shell.noVitals":
    "Aucun signe vital enregistré",

  "shell.bp":
    "TA",

  "shell.temp":
    "Temp.",

  "shell.pulse":
    "Pouls",

  "shell.oxygen":
    "O₂",

  "shell.pain":
    "Douleur",

  "shell.allergies":
    "Allergies :",

  "shell.noKnownAllergies":
    "Aucune allergie connue",

  "shell.specialInstructions":
    "Consignes particulières :",

  "shell.noSpecialInstructions":
    "Aucune consigne particulière enregistrée",

  "shell.admission":
    "Admission :",

  "shell.unnamedResident":
    "Résident sans nom",


  "profile.demographics":
    "Données démographiques",

  "profile.residentName":
    "Nom du résident",

  "profile.residentId":
    "ID du résident",

  "profile.dateOfBirth":
    "Date de naissance",

  "profile.age":
    "Âge",

  "profile.sex":
    "Sexe",

  "profile.bloodGroup":
    "Groupe sanguin",

  "profile.contactCareTeam":
    "Contact / Équipe de soins",

  "profile.primaryPhysician":
    "Médecin traitant",

  "profile.nextOfKin":
    "Proche parent",

  "profile.nextOfKinPhone":
    "Téléphone du proche",

  "profile.emergencyContact":
    "Contact d’urgence",

  "profile.room":
    "Chambre",

  "profile.status":
    "Statut",


  "census.title":
    "Recensement / Admission",

  "census.currentStatus":
    "Statut actuel",

  "census.roomBed":
    "Chambre / Lit",

  "census.admissionDate":
    "Date d’admission",

  "census.primaryPhysician":
    "Médecin traitant",


  "diagnosis.title":
    "Diagnostics médicaux",

  "diagnosis.current":
    "Diagnostic actuel",

  "diagnosis.none":
    "Aucun diagnostic enregistré.",


  "carePlan.title":
    "Plan de soins du résident",

  "carePlan.description":
    "Consulter les problèmes, les objectifs, les interventions et le suivi du plan de soins de ce résident.",

  "carePlan.open":
    "Ouvrir les plans de soins",


  "misc.title":
    "Notes du résident / Divers",

  "misc.none":
    "Aucune note diverse enregistrée pour ce résident.",


  "empty.mds":
    "Les évaluations MDS apparaîtront dans ce module du résident.",

  "empty.assessments":
    "Les évaluations du résident apparaîtront ici à mesure que les modules seront ajoutés.",

  "empty.therapy":
    "La documentation et les traitements de thérapie apparaîtront ici.",

  "empty.tasks":
    "Les tâches cliniques propres à ce résident apparaîtront ici.",
};


const dictionaries:
  Record<
    ResidentLanguage,
    Record<
      ResidentTextKey,
      string
    >
  > = {
  en: english,
  fr: french,
};


export function normalizeResidentLanguage(
  value: unknown
): ResidentLanguage {
  return (
    typeof value === "string" &&
    value
      .trim()
      .toLowerCase() === "fr"
  )
    ? "fr"
    : "en";
}


export function residentLocale(
  language:
    ResidentLanguage
) {
  return language === "fr"
    ? "fr-CM"
    : "en-CM";
}


export function residentText(
  language:
    ResidentLanguage,

  key:
    ResidentTextKey
) {
  return (
    dictionaries[
      language
    ][key] ??
    english[key]
  );
}
