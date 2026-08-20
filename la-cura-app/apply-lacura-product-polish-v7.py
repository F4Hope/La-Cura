from pathlib import Path
import re
import sys

root = Path.cwd()

globals_path = root / "app" / "globals.css"
tabs_path = root / "components" / "ResidentClinicalTabs.tsx"
resident_i18n_path = root / "lib" / "i18n" / "resident.ts"

required = [globals_path, tabs_path, resident_i18n_path]
missing = [str(p) for p in required if not p.exists()]
if missing:
    print("ERROR: Run this from /workspaces/La-Cura/la-cura-app")
    print("Missing:", ", ".join(missing))
    sys.exit(1)

# 1. Natural-case resident tab labels.
resident_i18n = resident_i18n_path.read_text()

label_replacements = {
    '"DASH"': '"Dashboard"',
    '"PROFILE"': '"Profile"',
    '"CENSUS"': '"Census"',
    '"MED DIAG"': '"Med. diagnosis"',
    '"ALLERGIES"': '"Allergies"',
    '"IMMUN"': '"Immunizations"',
    '"ORDERS"': '"Orders"',
    '"WTS/VITALS"': '"Vitals / weight"',
    '"RESULTS"': '"Results"',
    '"ASSMNTS"': '"Assessments"',
    '"THERAPY"': '"Therapy"',
    '"PROG NOTES"': '"Progress notes"',
    '"CARE PLAN"': '"Care plan"',
    '"TASKS"': '"Tasks"',
    '"MISC"': '"Misc"',
    '"TABLEAU"': '"Tableau"',
    '"PROFIL"': '"Profil"',
    '"RECENSEMENT"': '"Recensement"',
    '"DIAG MÉD."': '"Diag. méd."',
    '"VACCINS"': '"Vaccins"',
    '"ORDONNANCES"': '"Ordonnances"',
    '"POIDS/S.VITAUX"': '"Poids / vitaux"',
    '"RÉSULTATS"': '"Résultats"',
    '"ÉVALUATIONS"': '"Évaluations"',
    '"THÉRAPIE"': '"Thérapie"',
    '"NOTES ÉVOL."': '"Notes évol."',
    '"PLAN SOINS"': '"Plan de soins"',
    '"TÂCHES"': '"Tâches"',
    '"DIVERS"': '"Divers"',
}

for old, new in label_replacements.items():
    resident_i18n = resident_i18n.replace(old, new)

resident_i18n_path.write_text(resident_i18n)

# 2. Ensure a stable class exists on the resident tab bar.
tabs = tabs_path.read_text()

if "resident-clinical-tabs" not in tabs:
    old = 'className="border-b border-[#C9D3CE] bg-[#F8F7F2]"'
    new = 'className="resident-clinical-tabs border-b border-[#C9D3CE] bg-[#F8F7F2]"'
    if old in tabs:
        tabs = tabs.replace(old, new, 1)
    else:
        tabs = re.sub(
            r'className="([^"]*border-b[^"]*bg-\[#F8F7F2\][^"]*)"',
            lambda m: f'className="resident-clinical-tabs {m.group(1)}"',
            tabs,
            count=1,
        )

tabs_path.write_text(tabs)

# 3. Stronger authenticated-product polish.
css = globals_path.read_text()

css = re.sub(
    r'\n?/\* LA-CURA PRODUCT POLISH V7 START \*/.*?/\* LA-CURA PRODUCT POLISH V7 END \*/\n?',
    "\n",
    css,
    flags=re.S,
)

v7_css = r'''
/* LA-CURA PRODUCT POLISH V7 START */

.lacura-auth-app,
.role-theme-shell {
  --lc-v7-canvas: #f6f5f1;
  --lc-v7-surface: #ffffff;
  --lc-v7-line: #d5ddd8;
  --lc-v7-line-soft: #e7ebe8;
  --lc-v7-ink: #183129;
  --lc-v7-muted: #607169;
  --lc-v7-green: #0a604b;

  background: var(--lc-v7-canvas);
  color: var(--lc-v7-ink);
}

/* Replace legacy olive module bars with authored section markers. */
.lacura-auth-app [class*="bg-[#8FA47A]"],
.lacura-auth-app [class*="bg-[#91A47E]"],
.role-theme-shell [class*="bg-[#8FA47A]"],
.role-theme-shell [class*="bg-[#91A47E]"] {
  background: #eef3ef !important;
  color: #173d32 !important;
  border-color: #cbd7d1 !important;
  border-left: 3px solid var(--lc-v7-green) !important;
  font-weight: 650 !important;
  letter-spacing: -0.005em !important;
  text-transform: none !important;
  padding-left: 10px !important;
}

/* Toolbars become working surfaces rather than another card. */
.lacura-auth-app [class*="bg-[#F1F2ED]"],
.lacura-auth-app [class*="bg-[#F3F2ED]"],
.role-theme-shell [class*="bg-[#F1F2ED]"],
.role-theme-shell [class*="bg-[#F3F2ED]"] {
  background-color: #fbfbf8 !important;
  border-color: var(--lc-v7-line) !important;
}

/* Remove the stock blue spreadsheet look from clinical table headers. */
.lacura-auth-app [class*="bg-[#E5EEF4]"],
.lacura-auth-app [class*="bg-[#E7EDE9]"],
.role-theme-shell [class*="bg-[#E5EEF4]"],
.role-theme-shell [class*="bg-[#E7EDE9]"] {
  background-color: #edf2ef !important;
  color: #31483e !important;
}

.lacura-auth-app [class*="bg-[#FAFAF7]"],
.lacura-auth-app [class*="bg-[#F6F7F3]"],
.role-theme-shell [class*="bg-[#FAFAF7]"],
.role-theme-shell [class*="bg-[#F6F7F3]"] {
  background-color: #fbfcfa !important;
}

/* Clinical tables: less mechanical grid, clearer record rhythm. */
.lacura-auth-app table,
.role-theme-shell table {
  font-variant-numeric: tabular-nums;
}

.lacura-auth-app table thead th,
.role-theme-shell table thead th {
  background-color: #edf2ef;
  color: #34483f !important;
  font-weight: 650 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  border-color: #d8e0dc !important;
}

.lacura-auth-app table tbody td,
.role-theme-shell table tbody td {
  border-top-color: var(--lc-v7-line-soft) !important;
  border-bottom-color: var(--lc-v7-line-soft) !important;
  border-left-color: #edf0ee !important;
  border-right-color: #edf0ee !important;
}

.lacura-auth-app table tbody tr:nth-child(even),
.role-theme-shell table tbody tr:nth-child(even) {
  background-color: #fcfcfa !important;
}

.lacura-auth-app table tbody tr:hover,
.role-theme-shell table tbody tr:hover {
  background-color: #f3f8f5 !important;
}

/* Crisp clinical controls. */
.lacura-auth-app :where(input, select, textarea),
.role-theme-shell :where(input, select, textarea) {
  border-color: #c8d2cd !important;
  background-color: #ffffff !important;
  color: #21362e !important;
  border-radius: 4px;
}

.lacura-auth-app :where(input, select, textarea):focus,
.role-theme-shell :where(input, select, textarea):focus {
  border-color: var(--lc-v7-green) !important;
  box-shadow: 0 0 0 2px rgba(10, 96, 75, 0.09) !important;
}

/* -------------------------------------------------------------------------
   Resident tabs: same routes/order, more human and less component-template.
   ------------------------------------------------------------------------- */
.resident-clinical-tabs {
  background: #fbfbf8 !important;
  border-color: #d7dfda !important;
}

.resident-clinical-tabs a {
  background: transparent !important;
  border-right-color: #e5e9e6 !important;
  color: #52635b !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  filter: none !important;
}

/* Core resident information — green */
.resident-clinical-tabs a:not([href*="?tab="]),
.resident-clinical-tabs a[href*="tab=profile"],
.resident-clinical-tabs a[href*="tab=census"],
.resident-clinical-tabs a[href*="tab=mds"] {
  color: #326251 !important;
}

/* Diagnoses / allergies / tasks — amber */
.resident-clinical-tabs a[href*="tab=med-diag"],
.resident-clinical-tabs a[href*="tab=allergies"],
.resident-clinical-tabs a[href*="tab=tasks"] {
  color: #8a6725 !important;
}

/* Monitoring / orders / results — blue */
.resident-clinical-tabs a[href*="tab=immun"],
.resident-clinical-tabs a[href*="tab=orders"],
.resident-clinical-tabs a[href*="tab=vitals"],
.resident-clinical-tabs a[href*="tab=results"] {
  color: #3e6283 !important;
}

/* Assessments / therapy / notes / care plan — violet */
.resident-clinical-tabs a[href*="tab=assmnts"],
.resident-clinical-tabs a[href*="tab=therapy"],
.resident-clinical-tabs a[href*="tab=prog-notes"],
.resident-clinical-tabs a[href*="tab=care-plan"] {
  color: #6d5875 !important;
}

.resident-clinical-tabs a[href*="tab=misc"] {
  color: #5f6b70 !important;
}

/* Active tab: semantic tint + clean 2px marker. */
.resident-clinical-tabs a[aria-current="page"] {
  background: #ffffff !important;
  color: #173d32 !important;
  box-shadow: inset 0 -2px 0 var(--lc-v7-green) !important;
}

.resident-clinical-tabs a[aria-current="page"] > span[aria-hidden="true"] {
  display: none !important;
}

.resident-clinical-tabs a[href*="tab=med-diag"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=allergies"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=tasks"][aria-current="page"] {
  color: #765514 !important;
  background: #fffaf0 !important;
  box-shadow: inset 0 -2px 0 #b27a1d !important;
}

.resident-clinical-tabs a[href*="tab=immun"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=orders"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=vitals"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=results"][aria-current="page"] {
  color: #315b80 !important;
  background: #f5f9fd !important;
  box-shadow: inset 0 -2px 0 #3e78a9 !important;
}

.resident-clinical-tabs a[href*="tab=assmnts"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=therapy"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=prog-notes"][aria-current="page"],
.resident-clinical-tabs a[href*="tab=care-plan"][aria-current="page"] {
  color: #674b70 !important;
  background: #fbf8fc !important;
  box-shadow: inset 0 -2px 0 #7f5b89 !important;
}

.resident-clinical-tabs a[href*="tab=misc"][aria-current="page"] {
  color: #4f5d63 !important;
  background: #f7f8f8 !important;
  box-shadow: inset 0 -2px 0 #68777d !important;
}

.resident-clinical-tabs a:hover {
  background-color: #f5f7f5 !important;
  color: #173d32 !important;
}

/* LA-CURA PRODUCT POLISH V7 END */
'''

css = css.rstrip() + "\n\n" + v7_css.strip() + "\n"
globals_path.write_text(css)

print("Applied La-Cura Product Polish V7.")
print("Updated:")
print("  - app/globals.css")
print("  - components/ResidentClinicalTabs.tsx")
print("  - lib/i18n/resident.ts")
print()
print("Visible changes:")
print("  - Natural-case resident tabs")
print("  - Olive module bars become restrained section markers")
print("  - Clinical table headers become neutral green-gray")
print("  - Table rows get clearer record rhythm")
print("  - Active tabs carry semantic color; inactive tabs recede")
print("  - Controls get cleaner clinical focus styling")
print()
print("No routes, tab order, data logic, or clinical workflows were changed.")
print()
print("Next:")
print("  npm run build")
print("  git diff --check")
