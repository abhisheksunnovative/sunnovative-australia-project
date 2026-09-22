import re

with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find "Platform Analytics" object and inject Web App Analytics after it
old_block = '''    {
      name: "Platform Analytics",
      id: "platform-analytics",
      icon: <Activity className="w-5 h-5" />,
    },'''

new_block = '''    {
      name: "Platform Analytics",
      id: "platform-analytics",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      name: "Web App Analytics",
      id: "web-app-analytics",
      icon: <LineChart className="w-5 h-5" />,
    },'''

content = content.replace(old_block, new_block)

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("MainLayout fixed")
