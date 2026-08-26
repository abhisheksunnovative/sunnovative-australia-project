import re

with open("src/models/Lead.js", "r", encoding="utf8") as f:
    content = f.read()

content = content.replace(
    "hasLoggedIn: { type: Boolean, default: false },",
    "hasLoggedIn: { type: Boolean, default: false },\n    isEligibleForInstallation: { type: Boolean, default: false },"
)

with open("src/models/Lead.js", "w", encoding="utf8") as f:
    f.write(content)
print("Done")
