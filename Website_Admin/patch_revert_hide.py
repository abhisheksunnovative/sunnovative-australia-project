import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

content = content.replace(
    '{filterTab !== "eligibility" && (\n                  <>\n                  <div className="w-full bg-slate-50',
    '<div className="w-full bg-slate-50'
)

content = content.replace(
    '<ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details\n                </button>\n                </>\n                )}',
    '<ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details\n                </button>'
)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Reverted UI hiding")
