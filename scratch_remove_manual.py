filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Replace grid
content = content.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">', '<div className="grid grid-cols-1 max-w-md mx-auto gap-3 items-center">')

# Remove manual entry block
pattern = r'<div>\s*<label className="block text-\[11px\] font-bold text-slate-700 mb-1">\{isAU \? "Or Enter Quarterly Bill Manually" : "Or Enter Average Bill Manually"\}</label>[\s\S]*?<p className="text-\[10px\] text-slate-500 font-medium italic mt-1">\{isAU \? `Average Monthly Bill: \$\{Math\.round\(monthlyBill / 3\)\}` : `Used for calculating system size\.\`\}</p>\s*</div>'

if re.search(pattern, content):
    content = re.sub(pattern, '', content)
    print("Removed manual entry block")
else:
    print("Manual entry block not found with regex, trying substring")
    # Fallback to string replace
    old_str = """<div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">{isAU ? "Or Enter Quarterly Bill Manually" : "Or Enter Average Bill Manually"}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{isAU ? "$" : "₹"}</span>
                    <input type="number" required value={monthlyBill}
                      onChange={(e) => { setMonthlyBill(Number(e.target.value)); setEligibilityResult(null); setSelectedKw(null); }}
                      placeholder="e.g. 2150"
                      className="w-full pl-7 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic mt-1">{isAU ? `Average Monthly Bill: ${Math.round(monthlyBill / 3)}` : `Used for calculating system size.`}</p>
                </div>"""
    if old_str in content:
        content = content.replace(old_str, "")
        print("Removed manual entry block via substring")
    else:
        # Check for the corrupted `,1` symbol
        old_str2 = old_str.replace("₹", ",1")
        if old_str2 in content:
            content = content.replace(old_str2, "")
            print("Removed manual entry block via substring (corrupted symbol)")
        else:
            print("Could not remove manual entry block.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
