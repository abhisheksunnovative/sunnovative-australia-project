import re

with open('Website_Admin/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove cases for order-settings, process-settings, admin-settings
# Let's find the blocks and remove them carefully.

block1 = r'case "order-settings":\s*return \(\s*<WorkflowSettingsScreen[\s\S]*?/>\s*\);'
block2 = r'case "process-settings":\s*return \(\s*<WorkflowSettingsScreen[\s\S]*?/>\s*\);'
block3 = r'case "admin-settings":\s*return \(\s*<SaaSAdminSettingsScreen[\s\S]*?/>\s*\);'

content = re.sub(block1, '', content)
content = re.sub(block2, '', content)
content = re.sub(block3, '', content)

# Remove imports
content = re.sub(r'import\s*\{\s*WorkflowSettingsScreen\s*\}\s*from\s*"./components/WorkflowSettingsScreen";', '', content)
content = re.sub(r'import\s*\{\s*SaaSAdminSettingsScreen\s*\}\s*from\s*"./components/SaaSAdminSettingsScreen";', '', content)

with open('Website_Admin/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("App.jsx routing removed!")
