from pathlib import Path
import re
import sys

root = Path.cwd()
auth_layout_path = root / "app" / "(app)" / "layout.tsx"
globals_path = root / "app" / "globals.css"

missing = [str(p) for p in (auth_layout_path, globals_path) if not p.exists()]
if missing:
    print("ERROR: Run this from /workspaces/La-Cura/la-cura-app")
    print("Missing:", ", ".join(missing))
    sys.exit(1)

# -----------------------------------------------------------------------------
# 1. Add a stable scope to the authenticated clinical application only.
#    Public landing/login styling remains separate.
# -----------------------------------------------------------------------------
auth_layout = auth_layout_path.read_text()

if "lacura-auth-app" not in auth_layout:
    # Current project wrapper.
    old = '<div className="min-h-screen bg-[#F7F5EF]">'
    new = '<div className="lacura-auth-app min-h-screen bg-[#F7F5EF]">'

    if old in auth_layout:
        auth_layout = auth_layout.replace(old, new, 1)
    else:
        # Safe fallback: locate the first min-h-screen wrapper in this app layout.
        auth_layout, count = re.subn(
            r'<div className="([^"]*min-h-screen[^"]*)">',
            lambda m: (
                m.group(0)
                if "lacura-auth-app" in m.group(1)
                else f'<div className="lacura-auth-app {m.group(1)}">'
            ),
            auth_layout,
            count=1,
        )
        if count == 0:
            raise SystemExit(
                "ERROR: Could not find the authenticated app wrapper in app/(app)/layout.tsx"
            )

auth_layout_path.write_text(auth_layout)

# -----------------------------------------------------------------------------
# 2. Append an authenticated-app-only anti-template refinement layer.
#    This intentionally avoids layout reconstruction, gradients, glass effects,
#    oversized shadows, pill-everything, and decorative animation.
# -----------------------------------------------------------------------------
css = globals_path.read_text()

# Safe to rerun.
css = re.sub(
    r'\n?/\* LA-CURA AUTHENTICATED ANTI-TEMPLATE V6 START \*/.*?/\* LA-CURA AUTHENTICATED ANTI-TEMPLATE V6 END \*/\n?',
    "\n",
    css,
    flags=re.S,
)

v6_css = r'''
/* LA-CURA AUTHENTICATED ANTI-TEMPLATE V6 START */

/* --------------------------------------------------------------------------
   PRODUCT FOUNDATION
   Quiet hierarchy instead of a one-token dashboard template.
   -------------------------------------------------------------------------- */
.lacura-auth-app {
  --lc-canvas: #f5f4ef;
  --lc-panel: #ffffff;
  --lc-panel-soft: #fafaf7;
  --lc-line: #d8dfdb;
  --lc-line-soft: #e5e9e6;
  --lc-ink: #1c2a24;
  --lc-ink-soft: #43534c;
  --lc-muted: #687770;

  background-color: var(--lc-canvas);
  color: var(--lc-ink);
}

.lacura-auth-app :where(h1, h2, h3, h4) {
  letter-spacing: -0.012em;
  text-wrap: balance;
}

.lacura-auth-app :where(p, td, dd, li) {
  text-wrap: pretty;
}

/* Existing Tailwind uppercase utilities were making almost every clinical
   label look mechanically identical. Keep compact metadata, but restore the
   source copy's natural case and reduce tracking. */
.lacura-auth-app .uppercase {
  text-transform: none !important;
  letter-spacing: 0.018em !important;
}

.lacura-auth-app :where(.text-gray-500, .text-slate-500) {
  color: var(--lc-muted) !important;
}

.lacura-auth-app :where(.text-gray-600, .text-slate-600) {
  color: var(--lc-ink-soft) !important;
}

/* Clinical measurements should scan as data, not prose. */
.lacura-auth-app :where(table, [class*="clinical"], [class*="vital"]) {
  font-variant-numeric: tabular-nums;
}

/* --------------------------------------------------------------------------
   PANELS AND DIVIDERS
   Softer structural boundaries; no generic card shadow sprayed everywhere.
   -------------------------------------------------------------------------- */
.lacura-auth-app :where(section, article, aside)[class*="border"][class*="bg-white"] {
  border-color: var(--lc-line) !important;
}

/* Common legacy panel tints become quieter neutrals while preserving the
   clinical blue used for data-table headers. */
.lacura-auth-app [class*="bg-[#E7EDE9]"] {
  background-color: #f0f3f1 !important;
}

.lacura-auth-app [class*="bg-[#EDF1EE]"],
.lacura-auth-app [class*="bg-[#EEF2EF]"],
.lacura-auth-app [class*="bg-[#E8EEEA]"] {
  background-color: #f3f5f3 !important;
}

.lacura-auth-app [class*="bg-[#FBFAF7]"] {
  background-color: #fdfdfb !important;
}

.lacura-auth-app [class*="bg-[#F8F7F2]"] {
  background-color: #faf9f5 !important;
}

/* --------------------------------------------------------------------------
   TABLES
   Dense clinical records remain dense, but row rhythm and hierarchy no longer
   look like a generated spreadsheet component repeated across the product.
   -------------------------------------------------------------------------- */
.lacura-auth-app table {
  border-color: var(--lc-line) !important;
}

.lacura-auth-app thead tr:not([class*="bg-green"]):not([class*="bg-red"]) {
  color: #35473f !important;
}

.lacura-auth-app thead th {
  font-weight: 600 !important;
  letter-spacing: 0.012em !important;
  text-transform: none !important;
  border-color: #d7dfdb !important;
}

.lacura-auth-app tbody td {
  border-color: var(--lc-line-soft) !important;
  color: #3f4f48;
}

.lacura-auth-app tbody tr {
  transition: background-color 120ms ease;
}

.lacura-auth-app tbody tr:not([class*="bg-"]):nth-child(even) {
  background-color: #fcfcfa;
}

.lacura-auth-app tbody tr:not([class*="bg-"]):hover {
  background-color: #f5f9f7;
}

/* --------------------------------------------------------------------------
   FORMS AND ACTIONS
   Product-like focus behavior, without turning every control into a pill.
   -------------------------------------------------------------------------- */
.lacura-auth-app :where(input, select, textarea) {
  border-color: #cbd5d0;
  background-color: #ffffff;
  color: var(--lc-ink);
}

.lacura-auth-app :where(input, select, textarea)::placeholder {
  color: #8a9791;
}

.lacura-auth-app :where(input, select, textarea):focus {
  outline: none;
  border-color: var(--role-600) !important;
  box-shadow: 0 0 0 2px rgba(7, 59, 47, 0.08);
}

.lacura-auth-app :where(button, a)[class*="border"] {
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease;
}

.lacura-auth-app :where(button, a):focus-visible {
  outline: 2px solid var(--role-600);
  outline-offset: 2px;
}

/* --------------------------------------------------------------------------
   RESIDENT TAB BAR
   Keep the approved semantic families, but make inactive tabs quieter so the
   selected clinical workspace reads immediately instead of as a rainbow row.
   -------------------------------------------------------------------------- */
.resident-clinical-tabs a:not([aria-current="page"]) {
  filter: saturate(0.78);
}

.resident-clinical-tabs a[aria-current="page"] {
  filter: none;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.45);
}

.resident-clinical-tabs a:hover {
  filter: none;
}

/* --------------------------------------------------------------------------
   ACCESSIBILITY / REDUCED MOTION
   -------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .lacura-auth-app *,
  .lacura-auth-app *::before,
  .lacura-auth-app *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

/* LA-CURA AUTHENTICATED ANTI-TEMPLATE V6 END */
'''

css = css.rstrip() + "\n\n" + v6_css.strip() + "\n"
globals_path.write_text(css)

print("Applied La-Cura authenticated anti-template refinement V6.")
print("Updated:")
print("  - app/(app)/layout.tsx")
print("  - app/globals.css")
print()
print("No routes, data logic, layout structure, or clinical workflows were changed.")
print()
print("Next:")
print("  npm run build")
print("  git diff --check")
print("  git status")
