import re

with open('Website_Admin/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove case 'order-settings' block
content = re.sub(r'\s*case "order-settings":\s*return \(\s*<WorkflowSettingsScreen[\s\S]*?/>\s*\);', '', content)
# Remove case 'process-settings' block
content = re.sub(r'\s*case "process-settings":\s*return \(\s*<WorkflowSettingsScreen[\s\S]*?/>\s*\);', '', content)
# Remove case 'admin-settings' block
content = re.sub(r'\s*case "admin-settings":\s*return \(\s*<SaaSAdminSettingsScreen[\s\S]*?/>\s*\);', '', content)

with open('Website_Admin/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cases removed safely!")
