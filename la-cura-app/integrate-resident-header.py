from pathlib import Path

path = Path("app/(app)/residents/[id]/page.tsx")

text = path.read_text()

# Add import
old_import = 'import ResidentClinicalTabs from "@/components/ResidentClinicalTabs";'

new_import = '''import ResidentClinicalTabs from "@/components/ResidentClinicalTabs";
import ResidentHeader from "@/components/resident/ResidentHeader";'''

if old_import in text and "ResidentHeader" not in text:
    text = text.replace(old_import, new_import)


# Find old resident header start
marker_start = """
      <section
        className="
          border-b
"""

if marker_start not in text:
    print("Old header marker not found.")
    print("No changes made.")
    exit()


# Only add import for now.
# The actual JSX replacement will be done after confirming the data object.
path.write_text(text)

print("ResidentHeader import added.")
print("Next step: connect resident data.")
