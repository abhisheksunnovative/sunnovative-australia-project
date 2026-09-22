import os

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_grid_lines = """                  <div className="w-full lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
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
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Billing Period (Days)</label>
                      <input type="text" readOnly value={billingPeriodDays || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Meter Type</label>
                      <input type="text" readOnly value={meterTypeInfo || meterCategory || 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Bill Amount</label>
                      <input type="text" readOnly value={monthlyBill ? `₹${monthlyBill}` : 'UNKNOWN'} className="w-full px-2 py-1.5 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg truncate" />
                    </div>
                  </div>
"""

lines[886:897] = [new_grid_lines]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated LeadForm grid!")
