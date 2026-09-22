import re

filepath = 'Website_Admin/src/components/CustomerEligibilityScreen.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken import
content = content.replace("import { fetchWithCache } from '../utils/fetchWithCache';\nimport { from '../utils/fetchWithCache';\n", "import { fetchWithCache } from '../utils/fetchWithCache';\nimport {\n")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed CustomerEligibilityScreen!")
