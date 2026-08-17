import re

with open("D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

div_count = 0
for i, line in enumerate(lines):
    # simple heuristic, ignoring comments/strings for a rough idea
    # count `<div` and `</div>`
    opens = len(re.findall(r'<div\b', line))
    closes = len(re.findall(r'</div\b', line))
    
    div_count += (opens - closes)
    if div_count < 0:
        print(f"Line {i+1}: Negative div count! {line.strip()}")
        break

print(f"Final div count: {div_count}")
