import re

with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(",\n, LineChart} from \"lucide-react\";", ",\nLineChart} from \"lucide-react\";")

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
