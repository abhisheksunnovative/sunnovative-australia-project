import re

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add missing states
states_to_add = """  const [dueDate, setDueDate] = useState("");
  const [tariffCategory, setTariffCategory] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [meterTypeInfo, setMeterTypeInfo] = useState("");
  const [billingPeriodDays, setBillingPeriodDays] = useState("");
"""
content = re.sub(r'(const \[scannedQuarterlyKwh, setScannedQuarterlyKwh\] = useState\([^)]+\);)', r'\1\n' + states_to_add, content)

# 2. Add extractions
extractions_to_add = """        if (ex.dueDate) setDueDate(ex.dueDate);
        if (ex.tariffType) setTariffCategory(ex.tariffType);
        if (ex.customerType) setCustomerType(ex.customerType);
        if (ex.meterType) setMeterTypeInfo(ex.meterType);
        if (ex.billingDays) setBillingPeriodDays(ex.billingDays);
"""
content = re.sub(r'(if \(ex\.consumerNumber\) setConsumerNumber\(ex\.consumerNumber\);)', r'\1\n' + extractions_to_add, content)

# 3. Replace the grid VERY carefully
# Find the exact block to replace using regex
pattern = r'(<div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">[\s\S]*?</label>\s*<input[^>]*value=\{scannedRetailer \|\| discom \|\| \'\'\}[^>]*>\s*</div>\s*</div>)'

new_grid = """<div className="w-full lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" readOnly value={fullName || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Consumer / A/C No.</label>
                        <input type="text" readOnly value={consumerNumber || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Discom / Retailer</label>
                        <input type="text" readOnly value={scannedRetailer || discom || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Due Date</label>
                        <input type="text" readOnly value={dueDate || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Tariff / Category</label>
                        <input type="text" readOnly value={tariffCategory || tariffDesc || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Billing Period</label>
                        <input type="text" readOnly value={scannedBillingPeriod || (billingPeriodDays ? billingPeriodDays + ' days' : 'UNKNOWN')} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Meter Type</label>
                        <input type="text" readOnly value={meterTypeInfo || meterCategory || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Bill Amount</label>
                        <input type="text" readOnly value={monthlyBill ? 'INR ' + monthlyBill : 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                      </div>
                    </div>"""

if re.search(pattern, content):
    content = re.sub(pattern, new_grid, content)
    print("Replaced grid successfully!")
else:
    print("Could not find grid pattern to replace.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
