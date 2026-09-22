with open('Website_Admin/src/components/LeadScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
import re

content = re.sub(r'onClick=\{\(\) => setAssigningLead\(lead\)\}\s*className="[^"]+"\s*>\s*<UserCheck className="w-3\.5 h-3\.5" /> Assign to BDE\s*</button>',
    r'disabled className="px-2.5 py-1 bg-slate-100 text-slate-500 font-semibold text-[10px] rounded-lg border border-slate-200 flex items-center gap-1 shadow-xs cursor-default"><Clock className="w-3 h-3 text-cyan-600"/> New Lead</button>', content)

with open('Website_Admin/src/components/LeadScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin panel!")
