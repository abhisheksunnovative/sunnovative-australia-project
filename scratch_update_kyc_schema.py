import re

with open('Website_Backend/src/models/KycRequirement.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add templateUrl
new_field = '''  description: { type: String, default: "" },
  templateUrl: { type: String, default: "" }, // URL for downloadable template
  isRequired: { type: Boolean, default: true }'''
content = content.replace('  description: { type: String, default: "" },\n  isRequired: { type: Boolean, default: true }', new_field)

with open('Website_Backend/src/models/KycRequirement.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("KycRequirement Schema Updated")
