import re

with open('Website_Backend/src/models/EligibilitySettings.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add maxBillingPeriodDays to latestBillRules
old_rules = '''      latestBillRules: {
        enabled: { type: Boolean, default: true },
        maxBillAgeMonths: { type: Number, default: 3 },
      },'''

new_rules = '''      latestBillRules: {
        enabled: { type: Boolean, default: true },
        maxBillAgeMonths: { type: Number, default: 3 },
        maxBillingPeriodDays: { type: Number, default: 95 },
      },'''

if "maxBillingPeriodDays" not in content:
    content = content.replace(old_rules, new_rules)

with open('Website_Backend/src/models/EligibilitySettings.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema Updated!")
