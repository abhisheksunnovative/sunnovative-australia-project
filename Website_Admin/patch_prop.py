import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

content = content.replace(
    'export default function BDELeadManagement({ bdeId, country, bdeType }) {',
    'export default function BDELeadManagement({ bdeId, country, bdeType, filterTab }) {'
)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Fixed missing prop")
