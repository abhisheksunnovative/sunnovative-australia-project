import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

content = content.replace(
    '{filterTab !== "eligibility" && (\n                  <div className="w-full bg-slate-50',
    '{filterTab !== "eligibility" && (\n                  <>\n                  <div className="w-full bg-slate-50'
)

content = content.replace(
    '<CheckCircle className="w-3.5 h-3.5" /> Lead Details\n                    </button>\n                )}',
    '<CheckCircle className="w-3.5 h-3.5" /> Lead Details\n                    </button>\n                  </>\n                )}'
)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Fixed JSX fragment")
