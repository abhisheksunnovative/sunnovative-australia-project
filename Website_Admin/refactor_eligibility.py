import re

# Update MainLayout.jsx
with open('D:/sunnovative-australia-website/Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    main_layout = f.read()

main_layout = main_layout.replace('{ name: "State-wise Subsidy", id: "eligibility-state-subsidy" },', '{ name: "Subsidy / STC Config", id: "eligibility-state-subsidy" },')
main_layout = re.sub(r'^\s*\{ name: "Inverter Types", id: "eligibility-inverters" \},\n', '', main_layout, flags=re.MULTILINE)

with open('D:/sunnovative-australia-website/Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(main_layout)

# Update CustomerEligibilityScreen.jsx
with open('D:/sunnovative-australia-website/Website_Admin/src/components/CustomerEligibilityScreen.jsx', 'r', encoding='utf-8') as f:
    screen = f.read()

# Remove Inverter Types from SECTION_TITLES
screen = re.sub(r'^\s*inverterTypes: "Inverter Types",\n', '', screen, flags=re.MULTILINE)

# Remove Inverter Types section
inverter_section_pattern = r'\{\s*show\("inverterTypes"\)\s*&&\s*\(\s*<SectionCard title="Inverter Configuration".*?</SectionCard>\s*\)\s*\}'
screen = re.sub(inverter_section_pattern, '', screen, flags=re.DOTALL)

# Fix STC and Subsidy logic
# Find "const pageTitle ="
title_replace = '''
  let pageTitle = section ? SECTION_TITLES[section] || "Customer Eligibility" : "Customer Eligibility Settings";
  if (section === "stateSubsidy") {
    pageTitle = selectedCountry === "australia" ? "STC Rebate Configuration" : "State-wise Subsidy";
  }
'''
screen = re.sub(r'const pageTitle = section \? SECTION_TITLES\[section\] \|\| "Customer Eligibility" : "Customer Eligibility Settings";', title_replace.strip(), screen)

# Fix Live Subsidy Preview to only show for India
subsidy_preview_target = r'\{\(!section \|\| section === "stateSubsidy" \|\| section === "billToKwRanges"\) && \(\s*<div className="bg-gradient-to-br from-yellow-50 to-amber-50'
subsidy_preview_replace = r'{selectedCountry !== "australia" && (!section || section === "stateSubsidy" || section === "billToKwRanges") && (\n        <div className="bg-gradient-to-br from-yellow-50 to-amber-50'
screen = re.sub(subsidy_preview_target, subsidy_preview_replace, screen)

# Fix STC Preview to only show when section is stateSubsidy for Australia
stc_preview_target = r'\{selectedCountry === "australia" && \(\s*<div className="bg-gradient-to-br from-sky-50 to-blue-50'
stc_preview_replace = r'{selectedCountry === "australia" && (!section || section === "stateSubsidy") && (\n        <div className="bg-gradient-to-br from-sky-50 to-blue-50'
screen = re.sub(stc_preview_target, stc_preview_replace, screen)

# Fix State-wise Subsidy Config to only show for India
state_config_target = r'\{\s*show\("stateSubsidy"\)\s*&&\s*\(\s*<SectionCard title="State-wise Subsidy Configuration"'
state_config_replace = r'{selectedCountry !== "australia" && show("stateSubsidy") && (\n        <SectionCard title="State-wise Subsidy Configuration"'
screen = re.sub(state_config_target, state_config_replace, screen)

with open('D:/sunnovative-australia-website/Website_Admin/src/components/CustomerEligibilityScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(screen)

print("Updated MainLayout and CustomerEligibilityScreen UI logic")
