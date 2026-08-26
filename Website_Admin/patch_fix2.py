import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

content = content.replace(
    '<ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details\n                </button>\n\n                {isFreelancer ? (',
    '<ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details\n                </button>\n                </>\n                )}\n\n                {isFreelancer ? ('
)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Fixed JSX fragment closing tag")
