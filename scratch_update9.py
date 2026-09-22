with open('Website_Admin/src/components/LeadScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Remove the 'Assigned BDE' block
content = re.sub(r'\{\s*isActive: Boolean\(assignedBde\),[\s\S]*?<option value="">Assigned BDE</option>[\s\S]*?\},', '', content)

with open('Website_Admin/src/components/LeadScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Filter Removed!")
