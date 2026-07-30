import { jsPDF } from "jspdf";

export type ResidentPdfData = {
  id: number | string;
  full_name?: string | null;
  room?: string | number | null;
  age?: string | number | null;
  gender?: string | null;
  date_of_birth?: string | null;
  admission_date?: string | null;
  status?: string | null;
  allergies?: unknown;
  diagnoses?: unknown;
  primary_physician?: string | null;
  physician?: string | null;
  emergency_contact?: string | null;
  emergency_contact_phone?: string | null;
  phone?: string | null;
  [key: string]: unknown;
};

export type ResidentTimelinePdfItem = {
  date?: string | null;
  type?: string | null;
  title?: string | null;
  subtitle?: string | null;
  icon?: string | null;
};

type GenerateResidentClinicalPdfOptions = {
  resident: ResidentPdfData;
  timeline: ResidentTimelinePdfItem[];
  reportingPeriod: string;
  generatedBy?: string;
};

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not documented";
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.map((item) => String(item)).join(", ")
      : "Not documented";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Not documented";
    }
  }

  return String(value);
}

function formatDate(value: unknown): string {
  if (!value) {
    return "Not documented";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: unknown): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function createSafeFileName(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function loadImageAsDataUrl(path: string): Promise<string> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load image: ${path}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read the La-Cura logo."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the La-Cura logo."));
    };

    reader.readAsDataURL(blob);
  });
}

export async function generateResidentClinicalPdf({
  resident,
  timeline,
  reportingPeriod,
  generatedBy = "La-Cura Staff",
}: GenerateResidentClinicalPdfOptions): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const leftMargin = 42;
  const rightMargin = 42;
  const topMargin = 38;
  const bottomMargin = 54;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  let logoDataUrl: string | null = null;
  let cursorY = topMargin;

  try {
    logoDataUrl = await loadImageAsDataUrl("/logo.png");
  } catch (error) {
    console.warn("La-Cura logo could not be loaded:", error);
  }

  function drawPageHeader() {
    if (logoDataUrl) {
      pdf.addImage(
        logoDataUrl,
        "PNG",
        leftMargin,
        topMargin,
        52,
        52
      );
    }

    const brandX = logoDataUrl
      ? leftMargin + 66
      : leftMargin;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(21, 128, 61);
    pdf.text("LA-CURA", brandX, topMargin + 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.text(
      "Clinical Care Management System",
      brandX,
      topMargin + 36
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(15, 23, 42);
    pdf.text(
      "Resident Clinical Summary",
      pageWidth - rightMargin,
      topMargin + 18,
      {
        align: "right",
      }
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      `Reporting period: ${reportingPeriod}`,
      pageWidth - rightMargin,
      topMargin + 36,
      {
        align: "right",
      }
    );

    pdf.setDrawColor(22, 163, 74);
    pdf.setLineWidth(1.25);
    pdf.line(
      leftMargin,
      topMargin + 66,
      pageWidth - rightMargin,
      topMargin + 66
    );

    cursorY = topMargin + 88;
  }

  function ensureSpace(requiredHeight: number) {
    if (
      cursorY + requiredHeight <=
      pageHeight - bottomMargin
    ) {
      return;
    }

    pdf.addPage();
    drawPageHeader();
  }

  function drawSectionTitle(title: string) {
    ensureSpace(38);

    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(
      leftMargin,
      cursorY,
      contentWidth,
      27,
      5,
      5,
      "F"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(21, 128, 61);
    pdf.text(title, leftMargin + 11, cursorY + 18);

    cursorY += 38;
  }

  function drawTwoColumnRow(
    leftLabel: string,
    leftValue: unknown,
    rightLabel: string,
    rightValue: unknown
  ) {
    const columnGap = 20;
    const columnWidth =
      (contentWidth - columnGap) / 2;
    const rightColumnX =
      leftMargin + columnWidth + columnGap;

    const leftLines = pdf.splitTextToSize(
      normalizeValue(leftValue),
      columnWidth
    );

    const rightLines = pdf.splitTextToSize(
      normalizeValue(rightValue),
      columnWidth
    );

    const maximumLines = Math.max(
      leftLines.length,
      rightLines.length
    );

    const requiredHeight = 38 + maximumLines * 10;

    ensureSpace(requiredHeight);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);

    pdf.text(
      leftLabel.toUpperCase(),
      leftMargin,
      cursorY
    );

    pdf.text(
      rightLabel.toUpperCase(),
      rightColumnX,
      cursorY
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);

    pdf.text(leftLines, leftMargin, cursorY + 15);
    pdf.text(
      rightLines,
      rightColumnX,
      cursorY + 15
    );

    cursorY += 22 + maximumLines * 10;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(
      leftMargin,
      cursorY,
      pageWidth - rightMargin,
      cursorY
    );

    cursorY += 13;
  }

  function drawFullWidthRow(
    label: string,
    value: unknown
  ) {
    const lines = pdf.splitTextToSize(
      normalizeValue(value),
      contentWidth
    );

    const requiredHeight = 38 + lines.length * 11;

    ensureSpace(requiredHeight);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(label.toUpperCase(), leftMargin, cursorY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(lines, leftMargin, cursorY + 15);

    cursorY += 22 + lines.length * 11;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(
      leftMargin,
      cursorY,
      pageWidth - rightMargin,
      cursorY
    );

    cursorY += 13;
  }

  function drawTimelineEntry(
    item: ResidentTimelinePdfItem,
    index: number
  ) {
    const type = normalizeValue(item.type);
    const title = normalizeValue(item.title);

    const subtitle =
      item.subtitle === null ||
      item.subtitle === undefined ||
      item.subtitle === ""
        ? ""
        : String(item.subtitle);

    const titleLines = pdf.splitTextToSize(
      title,
      contentWidth - 46
    );

    const subtitleLines = subtitle
      ? pdf.splitTextToSize(
          subtitle,
          contentWidth - 46
        )
      : [];

    const requiredHeight =
      54 +
      titleLines.length * 11 +
      subtitleLines.length * 10;

    ensureSpace(requiredHeight);

    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(
      leftMargin,
      cursorY,
      contentWidth,
      requiredHeight - 9,
      6,
      6,
      "F"
    );

    pdf.setFillColor(22, 163, 74);
    pdf.circle(
      leftMargin + 16,
      cursorY + 18,
      4,
      "F"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(21, 128, 61);
    pdf.text(
      `${index + 1}. ${type}`,
      leftMargin + 29,
      cursorY + 17
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      formatDateTime(item.date),
      pageWidth - rightMargin - 10,
      cursorY + 17,
      {
        align: "right",
      }
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(
      titleLines,
      leftMargin + 29,
      cursorY + 36
    );

    const subtitleY =
      cursorY + 38 + titleLines.length * 11;

    if (subtitleLines.length > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(
        subtitleLines,
        leftMargin + 29,
        subtitleY
      );
    }

    cursorY += requiredHeight;
  }

  drawPageHeader();

  drawSectionTitle("Resident Information");

  drawTwoColumnRow(
    "Resident Name",
    resident.full_name,
    "Resident ID",
    resident.id
  );

  drawTwoColumnRow(
    "Room",
    resident.room,
    "Age",
    resident.age
  );

  drawTwoColumnRow(
    "Gender",
    resident.gender,
    "Status",
    resident.status
  );

  drawTwoColumnRow(
    "Date of Birth",
    formatDate(resident.date_of_birth),
    "Admission Date",
    formatDate(resident.admission_date)
  );

  drawTwoColumnRow(
    "Primary Physician",
    resident.primary_physician ??
      resident.physician,
    "Resident Phone",
    resident.phone
  );

  drawTwoColumnRow(
    "Emergency Contact",
    resident.emergency_contact,
    "Emergency Contact Phone",
    resident.emergency_contact_phone
  );

  drawFullWidthRow(
    "Known Allergies",
    resident.allergies
  );

  drawFullWidthRow(
    "Diagnoses",
    resident.diagnoses
  );

  drawSectionTitle("Clinical Timeline");

  if (timeline.length === 0) {
    ensureSpace(58);

    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(
      leftMargin,
      cursorY,
      contentWidth,
      44,
      6,
      6,
      "F"
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);

    pdf.text(
      "No clinical records were found for the selected reporting period.",
      leftMargin + 12,
      cursorY + 27
    );

    cursorY += 58;
  } else {
    timeline.forEach((item, index) => {
      drawTimelineEntry(item, index);
    });
  }

  ensureSpace(66);

  cursorY += 6;

  pdf.setDrawColor(203, 213, 225);
  pdf.line(
    leftMargin,
    cursorY,
    pageWidth - rightMargin,
    cursorY
  );

  cursorY += 18;

  const generatedAt = new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date());

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);

  pdf.text(
    `Generated: ${generatedAt}`,
    leftMargin,
    cursorY
  );

  pdf.text(
    `Generated by: ${generatedBy}`,
    pageWidth - rightMargin,
    cursorY,
    {
      align: "right",
    }
  );

  const pageCount = pdf.getNumberOfPages();

  for (
    let pageNumber = 1;
    pageNumber <= pageCount;
    pageNumber += 1
  ) {
    pdf.setPage(pageNumber);

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);

    pdf.line(
      leftMargin,
      pageHeight - 34,
      pageWidth - rightMargin,
      pageHeight - 34
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);

    pdf.text(
      "CONFIDENTIAL CLINICAL DOCUMENT — For authorized use only.",
      leftMargin,
      pageHeight - 20
    );

    pdf.text(
      `Page ${pageNumber} of ${pageCount}`,
      pageWidth - rightMargin,
      pageHeight - 20,
      {
        align: "right",
      }
    );
  }

  const residentName =
    resident.full_name?.trim() ||
    `resident-${resident.id}`;

  const fileName = `${createSafeFileName(
    residentName
  )}-clinical-report.pdf`;

  pdf.save(fileName);
}