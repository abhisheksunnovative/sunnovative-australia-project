import re

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add missing states
target_line = "  const [scannedQuarterlyKwh, setScannedQuarterlyKwh] = useState(null);"
states_to_add = """  const [dueDate, setDueDate] = useState("");
  const [tariffCategory, setTariffCategory] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [meterTypeInfo, setMeterTypeInfo] = useState("");
  const [billingPeriodDays, setBillingPeriodDays] = useState("");"""

if target_line in content:
    content = content.replace(target_line, target_line + "\n" + states_to_add)

# 2. Replace the old grid
old_grid = """                    <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" readOnly value={fullName} className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Discom / Retailer</label>
                        <input type="text" readOnly value={scannedRetailer || discom || ''} className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl" />
                      </div>
                    </div>"""

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
                    </div>"""

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    print("Replaced grid successfully!")
else:
    print("Could not find old grid.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
