filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_grid = """                    <div className="w-full lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
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
                    </div>\n"""

# Find the exact start and end of the old grid
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">' in line:
        start_idx = i
        break

if start_idx != -1:
    for i in range(start_idx, len(lines)):
        if "</div>" in lines[i] and "</div>" in lines[i-1] and "<input" in lines[i-2]:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    lines[start_idx:end_idx+1] = [new_grid]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Replaced grid via exact slice!")
else:
    print(f"Could not find exact block. Start: {start_idx}, End: {end_idx}")

