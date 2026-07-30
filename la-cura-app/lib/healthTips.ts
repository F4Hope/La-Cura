export type HealthTipIcon =
  | "heart"
  | "hydration"
  | "habits";

export type HealthTipSection = {
  title: string;
  content: string;
};

export type HealthTipSource = {
  label: string;
  url: string;
};

export type HealthTipArticle = {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  readingTime: string;
  icon: HealthTipIcon;
  introduction: string;
  keyActions: string[];
  dailyPlan: HealthTipSection[];
  warningSigns: string[];
  clinicalNote: string;
  sources: HealthTipSource[];
};

export const healthTipArticles: HealthTipArticle[] = [
  {
    slug: "heart-health",
    title: "Keep Your Heart Healthy",
    shortDescription:
      "Practical steps that support blood pressure, cholesterol, circulation, and long-term cardiovascular health.",
    category: "Heart Health",
    readingTime: "5-minute read",
    icon: "heart",
    introduction:
      "Heart health is influenced by physical activity, nutrition, tobacco exposure, sleep, blood pressure, cholesterol, blood sugar, and medication adherence. Small changes practiced consistently can reduce cardiovascular risk and improve overall well-being.",
    keyActions: [
      "Aim for regular physical activity. Adults should generally work toward 150 to 300 minutes of moderate-intensity aerobic activity each week, based on their health and physical ability.",
      "Include muscle-strengthening activities on at least two days each week when medically appropriate.",
      "Choose meals built around vegetables, fruits, whole grains, beans, fish, lean proteins, and minimally processed foods.",
      "Limit excess sodium, saturated fat, added sugar, and highly processed foods.",
      "Do not smoke or use tobacco products. Ask a healthcare professional for support with quitting.",
      "Know your blood pressure, cholesterol, and blood sugar results and follow the monitoring schedule recommended by your clinician.",
      "Take prescribed medications exactly as directed. Do not stop heart or blood-pressure medication without discussing it with the prescriber.",
      "Most adults should aim for at least seven hours of sleep each night.",
    ],
    dailyPlan: [
      {
        title: "Morning",
        content:
          "Take prescribed morning medications, drink water unless you have a fluid restriction, and choose a breakfast containing fiber and protein.",
      },
      {
        title: "During the day",
        content:
          "Break up long periods of sitting. Walking, household activity, cycling, gardening, and structured exercise can all contribute to weekly activity.",
      },
      {
        title: "Meals",
        content:
          "Fill a substantial part of the plate with vegetables, add a lean protein source, and choose whole grains or other high-fiber carbohydrates.",
      },
      {
        title: "Evening",
        content:
          "Review medications, prepare for consistent sleep, and document blood pressure or blood sugar when monitoring has been prescribed.",
      },
    ],
    warningSigns: [
      "Chest pain, pressure, squeezing, or discomfort.",
      "Shortness of breath that is new, severe, or occurs with chest discomfort.",
      "Pain or discomfort involving the arm, shoulder, jaw, neck, or back.",
      "Sudden weakness or numbness of the face, arm, or leg, especially on one side.",
      "Sudden confusion, difficulty speaking, loss of balance, or a severe unexplained headache.",
    ],
    clinicalNote:
      "Heart-attack and stroke symptoms require immediate emergency assessment. Do not wait for symptoms to resolve and do not drive yourself when emergency transport is available.",
    sources: [
      {
        label: "CDC — Preventing Heart Disease",
        url: "https://www.cdc.gov/heart-disease/prevention/index.html",
      },
      {
        label: "CDC — Heart Attack Symptoms",
        url: "https://www.cdc.gov/heart-disease/about/heart-attack.html",
      },
      {
        label: "CDC — Signs and Symptoms of Stroke",
        url: "https://www.cdc.gov/stroke/signs-symptoms/index.html",
      },
      {
        label: "WHO — Physical Activity",
        url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      },
    ],
  },
  {
    slug: "stay-hydrated",
    title: "Stay Hydrated",
    shortDescription:
      "Learn how to maintain safe fluid intake and recognize possible signs of dehydration.",
    category: "Hydration",
    readingTime: "4-minute read",
    icon: "hydration",
    introduction:
      "The body needs fluid to regulate temperature, transport nutrients, support digestion, and maintain normal organ function. Fluid requirements vary according to age, climate, activity, pregnancy, illness, diet, and medical conditions.",
    keyActions: [
      "Drink safe water regularly throughout the day rather than waiting until you feel extremely thirsty.",
      "Increase fluid intake during hot weather, exercise, fever, vomiting, or diarrhea unless a clinician has prescribed a fluid restriction.",
      "Keep water accessible at work, during travel, and near older adults who may not notice thirst as readily.",
      "Choose water instead of sugar-sweetened beverages for routine hydration.",
      "Foods such as fruit, vegetables, soups, and yogurt can also contribute to total fluid intake.",
      "Urine that becomes much darker or substantially less frequent can be a sign that more fluid may be needed.",
      "People with heart failure, kidney disease, liver disease, or prescribed fluid restrictions should follow their individualized clinical plan.",
      "Use water from a safe, treated, or otherwise reliable drinking source.",
    ],
    dailyPlan: [
      {
        title: "After waking",
        content:
          "Drink water unless you have been instructed to limit fluids. Refill a clean bottle or container for the day.",
      },
      {
        title: "With meals",
        content:
          "Include a drink with meals and consider water-rich foods such as fruit, vegetables, and soup.",
      },
      {
        title: "During heat or activity",
        content:
          "Take regular drinking breaks. Do not rely only on thirst when working or exercising in hot conditions.",
      },
      {
        title: "Before bed",
        content:
          "Review whether you experienced unusual thirst, dizziness, dark urine, or reduced urination during the day.",
      },
    ],
    warningSigns: [
      "Very dark urine or urinating much less than usual.",
      "Persistent dizziness, fainting, unusual weakness, or confusion.",
      "A very dry mouth accompanied by worsening fatigue or headache.",
      "Inability to keep fluids down because of repeated vomiting.",
      "Ongoing diarrhea, fever, or heavy sweating with poor fluid intake.",
      "Signs of dehydration in an infant, frail older adult, or seriously ill person.",
    ],
    clinicalNote:
      "Severe dehydration can become a medical emergency. People who are confused, fainting, unable to drink, or producing very little urine should receive prompt medical assessment.",
    sources: [
      {
        label: "CDC — About Water and Healthier Drinks",
        url: "https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html",
      },
      {
        label: "CDC — About Drinking Water",
        url: "https://www.cdc.gov/drinking-water/about/",
      },
      {
        label: "NHS — Dehydration",
        url: "https://www.nhs.uk/conditions/dehydration/",
      },
    ],
  },
  {
    slug: "healthy-habits",
    title: "Build Healthy Habits",
    shortDescription:
      "A practical framework for combining activity, nutrition, sleep, medication adherence, and preventive care.",
    category: "Healthy Living",
    readingTime: "6-minute read",
    icon: "habits",
    introduction:
      "Healthy routines are most effective when they are realistic, specific, and repeated consistently. Rather than changing everything at once, select one or two measurable behaviors and build from them.",
    keyActions: [
      "Begin with a small goal such as a 10-minute walk, one additional serving of vegetables, or a consistent bedtime.",
      "Work toward 150 to 300 minutes of moderate-intensity aerobic activity each week when medically appropriate.",
      "Include muscle-strengthening activities at least twice weekly and balance activities when fall prevention is important.",
      "Plan meals around vegetables, fruit, whole grains, beans, and appropriate protein sources.",
      "Most adults should aim for at least seven hours of sleep and maintain consistent sleeping and waking times.",
      "Take medication at the prescribed dose and time. Use reminders or a medication schedule when needed.",
      "Avoid tobacco and limit exposure to secondhand smoke.",
      "Attend preventive examinations and recommended blood-pressure, diabetes, cholesterol, dental, vision, and cancer screening.",
    ],
    dailyPlan: [
      {
        title: "Choose one priority",
        content:
          "Select one behavior that matters most, such as walking after lunch or taking evening medication at the same time each day.",
      },
      {
        title: "Make it measurable",
        content:
          "Define the action clearly. For example: walk for 15 minutes on Monday, Wednesday, and Friday.",
      },
      {
        title: "Reduce barriers",
        content:
          "Prepare medications, walking shoes, healthy foods, or water before they are needed.",
      },
      {
        title: "Review progress",
        content:
          "At the end of each week, identify what worked, adjust what did not, and gradually increase the goal.",
      },
    ],
    warningSigns: [
      "Chest pain, severe shortness of breath, fainting, or new neurological symptoms during activity.",
      "Persistent sleep difficulty that affects daytime function or safety.",
      "Repeated missed medication doses or uncertainty about how medication should be taken.",
      "Frequent falls, worsening weakness, or inability to complete usual daily activities.",
      "Major changes in mood, appetite, weight, or energy that continue over time.",
    ],
    clinicalNote:
      "People with chronic disease, pregnancy, recent surgery, physical limitations, or long periods of inactivity should discuss major exercise or dietary changes with a qualified healthcare professional.",
    sources: [
      {
        label: "WHO — Physical Activity",
        url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      },
      {
        label: "CDC — Preventing Chronic Diseases",
        url: "https://www.cdc.gov/chronic-disease/prevention/index.html",
      },
      {
        label: "CDC — About Sleep",
        url: "https://www.cdc.gov/sleep/about/index.html",
      },
      {
        label: "CDC — Sleep and Heart Health",
        url: "https://www.cdc.gov/heart-disease/about/sleep-and-heart-health.html",
      },
    ],
  },
];

export function getHealthTipBySlug(
  slug: string
): HealthTipArticle | undefined {
  return healthTipArticles.find(
    (article) => article.slug === slug
  );
}