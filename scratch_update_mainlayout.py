import re

with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add to sidebar array
new_item = '''      {
        name: "Web App Analytics",
        id: "web-app-analytics",
        icon: <LineChart className="w-5 h-5" />,
      },
      {
        name: "Platform Analytics",'''
content = content.replace('{\n        name: "Platform Analytics",', new_item)

# Add to dropdown group allowed items
content = content.replace('"platform-analytics"]', '"platform-analytics", "web-app-analytics"]')

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("MainLayout.jsx updated")
