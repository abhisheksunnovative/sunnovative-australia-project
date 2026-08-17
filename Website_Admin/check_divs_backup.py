import re

with open("D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen_backup.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

div_count = 0
for i, line in enumerate(lines):
    opens = len(re.findall(r'<div\b', line))
    closes = len(re.findall(r'</div\b', line))
    
    div_count += (opens - closes)

print(f"Final div count in backup: {div_count}")
