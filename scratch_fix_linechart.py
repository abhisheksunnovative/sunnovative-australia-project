import re

with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add LineChart to lucide-react imports if it's not there
# Let's just find the lucide-react import block and append it
lucide_import_pattern = r'import\s+{([^}]+)}\s+from\s+"lucide-react";'
match = re.search(lucide_import_pattern, content)
if match:
    imports = match.group(1)
    if "LineChart" not in imports:
        new_imports = imports + ", LineChart"
        content = content.replace(imports, new_imports)

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("MainLayout fixed for LineChart")
