import re

with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove 'Project Order Settings'
content = re.sub(r'\{\s*name:\s*"Project Order Settings"[^}]+\},', '', content)
# Remove 'Order Process Settings'
content = re.sub(r'\{\s*name:\s*"Order Process Settings"[^}]+\},', '', content)
# Remove 'Admin Settings'
content = re.sub(r'\{\s*name:\s*"Admin Settings"[^}]+\},', '', content)

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("MainLayout tabs removed!")
