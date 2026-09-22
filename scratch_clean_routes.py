import re

with open('Website_Admin/src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if 'WorkflowSettingsScreen' in line or 'SaaSAdminSettingsScreen' in line:
        continue
    new_lines.append(line)

with open('Website_Admin/src/App.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Cleaned remaining lines!")
