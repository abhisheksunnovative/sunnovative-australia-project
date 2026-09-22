with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# 1. Update the groupings in the top definition
# We want to create bdeSettingsItems and epcSettingsItems, and remove them from allMenuItems so they aren't repeated.
# Actually, the code renders topLevelMenuItems by filtering out epcSequenceIds.
# Let's just redefine the epcSequenceItems and create a new bdeSequenceItems list.

# Replace epcSequenceItems definition
old_epc_sequence = '''  const epcSequenceItems = [
    { name: "KYC & Agreement", id: "kyc-agreement", step: 1 },
    { name: "Partner Qualification", id: "qualification", step: 2 },
    { name: "Ratings & Benefits", id: "ratings-benefits", step: 3 },
    { name: "EPC Partner Settings", id: "epc-settings", step: 4 },
    { name: "Rewards & Incentives", id: "epc-rewards", step: 5 },
  ];'''

new_epc_sequence = '''  const epcSequenceItems = [
    { name: "EPC Rates for Brands", id: "epc-rates-brands" },
    { name: "EPC System Settings", id: "epc-system-settings" },
    { name: "Plans & Subscriptions", id: "subscriptions" },
    { name: "Trust Badge EPC", id: "trust-badge-epc" },
    { name: "EPC Partner Settings", id: "epc-settings" },
  ];'''

content = content.replace(old_epc_sequence, new_epc_sequence)

# Create bdeSequenceItems definition just after epcSequenceIds definition
bde_insert = '''
  const bdeSequenceItems = [
    { name: "BDE Management", id: "bde-management" },
    { name: "BDE Onboarding", id: "bde-onboarding" },
    { name: "BDE Uploaded Leads", id: "bde-leads-admin" }
  ];
  const bdeSequenceIds = bdeSequenceItems.map((item) => item.id);
'''

# Find 'const epcSequenceIds = epcSequenceItems.map((item) => item.id);' and insert bde definitions after
content = content.replace('  const epcSequenceIds = epcSequenceItems.map((item) => item.id);', '  const epcSequenceIds = epcSequenceItems.map((item) => item.id);' + bde_insert)

# Now we need to filter them out of topLevelMenuItems so they don't appear twice
old_top_level = '''  const topLevelMenuItems = filteredMenuItems.filter(
    (item) => !epcSequenceIds.includes(item.id),
  );'''

new_top_level = '''  const topLevelMenuItems = filteredMenuItems.filter(
    (item) => !epcSequenceIds.includes(item.id) && !bdeSequenceIds.includes(item.id)
  );'''

content = content.replace(old_top_level, new_top_level)

# Add states for bde settings open
content = content.replace('const [epcSettingsOpen, setEpcSettingsOpen] = useState(true);', 'const [epcSettingsOpen, setEpcSettingsOpen] = useState(false);\n  const [bdeSettingsOpen, setBdeSettingsOpen] = useState(false);')

# Add auto-expand logic for bde
auto_expand_bde = '''    if (bdeSequenceIds.includes(currentTab)) {
      setBdeSettingsOpen(true);
    }'''

content = content.replace('    if (epcSequenceIds.includes(currentTab)) {\n      setEpcSettingsOpen(true);\n    }', '    if (epcSequenceIds.includes(currentTab)) {\n      setEpcSettingsOpen(true);\n    }\n' + auto_expand_bde)

# Now inject the DropdownGroup for BDE Settings.
# The EPC settings is already there (DropdownGroup label="EPC Settings").
# Let's insert BDE Settings right after EPC Settings.

bde_dropdown = '''
          {/* BDE Settings Dropdown */}
          {!isVeneet && (
            <DropdownGroup
              label="BDE Settings"
              icon={<Users className="w-5 h-5 text-orange-200" />}
              isOpen={bdeSettingsOpen}
              setIsOpen={setBdeSettingsOpen}
              items={bdeSequenceItems}
              activeIds={bdeSequenceIds}
            />
          )}
'''

# We will inject this right after the EPC Settings dropdown block
epc_dropdown_code = '''          {!isVeneet && (
            <DropdownGroup
              label="EPC Settings"
              icon={<Settings className="w-5 h-5 text-orange-200" />}
              isOpen={epcSettingsOpen}
              setIsOpen={setEpcSettingsOpen}
              items={epcSequenceItems}
              activeIds={epcSequenceIds}
              showStep
            />
          )}'''

epc_dropdown_code_new = epc_dropdown_code.replace('showStep', '') # Remove showStep since it's not a sequence anymore

content = content.replace(epc_dropdown_code, epc_dropdown_code_new + bde_dropdown)

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MainLayout Groupings!")
