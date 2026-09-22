with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We want to remove this specific block:
block_to_remove = r'''                <div>
                  <label className="block text-\[11px\] font-bold text-slate-700 mb-1">\{isAU \? "Or Enter Quarterly Bill Manually" : "Or Enter Average Bill Manually"\}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">\{isAU \? "\$" : "₹"\}</span>
                    <input type="number" required value=\{monthlyBill\}
                      onChange=\{\(e\) => \{ setMonthlyBill\(Number\(e\.target\.value\)\); setEligibilityResult\(null\); setSelectedKw\(null\); \}\}
                      placeholder="e\.g\. 2150"
                      className="w-full pl-7 pr-3 py-1\.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-solar-sky focus:outline-none transition-all font-medium" />
                  </div>
                  <p className="text-\[10px\] text-slate-500 font-medium italic mt-1">\{isAU \? Average Monthly Bill: \$\{Math\.round\(monthlyBill / 3\)\} : Used for calculating system size.\}</p>
                </div>'''

# Also change grid-cols-1 md:grid-cols-2 to grid-cols-1 max-w-md
content = content.replace('grid-cols-1 md:grid-cols-2 gap-3 items-center', 'grid-cols-1 max-w-md mx-auto gap-3 items-center')

# Remove the block
content = re.sub(block_to_remove, '', content, flags=re.MULTILINE)

with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
