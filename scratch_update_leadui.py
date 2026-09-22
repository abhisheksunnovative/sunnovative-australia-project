import re

with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# First, declare the new states at the top
state_injections = '''
  const [dueDate, setDueDate] = useState("");
  const [tariffCategory, setTariffCategory] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [meterTypeInfo, setMeterTypeInfo] = useState("");
  const [billingPeriodDays, setBillingPeriodDays] = useState(0);
'''
# Inject right after const [scannedQuarterlyKwh, setScannedQuarterlyKwh] = useState("");
content = content.replace('const [scannedQuarterlyKwh, setScannedQuarterlyKwh] = useState("");', 'const [scannedQuarterlyKwh, setScannedQuarterlyKwh] = useState("");' + state_injections)

# Second, capture them from ex
extraction_injections = '''
        if (ex.dueDate) setDueDate(ex.dueDate);
        if (ex.tariffType) setTariffCategory(ex.tariffType);
        if (ex.customerType) setCustomerType(ex.customerType);
        if (ex.meterType) setMeterTypeInfo(ex.meterType);
        if (ex.billingDays) setBillingPeriodDays(ex.billingDays);
'''
# Inject right after if (ex.consumerNumber) setConsumerNumber(ex.consumerNumber);
content = content.replace('if (ex.consumerNumber) setConsumerNumber(ex.consumerNumber);', 'if (ex.consumerNumber) setConsumerNumber(ex.consumerNumber);' + extraction_injections)


# Third, render them in the grid
old_grid = '''                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" readOnly value={fullName} className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Discom / Retailer</label>
                        <input type="text" readOnly value={scannedRetailer || discom || ''} className="w-full px-3 py-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl" />
                      </div>'''

new_grid = '''                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" readOnly value={fullName} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Discom / Retailer</label>
                        <input type="text" readOnly value={scannedRetailer || discom || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Consumer / Account No.</label>
                        <input type="text" readOnly value={consumerNumber || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Due Date</label>
                        <input type="text" readOnly value={dueDate || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Tariff Category</label>
                        <input type="text" readOnly value={tariffCategory || tariffDesc || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Res/Comm Category</label>
                        <input type="text" readOnly value={customerType || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Billing Period</label>
                        <input type="text" readOnly value={scannedBillingPeriod || (billingPeriodDays ? billingPeriodDays + " days" : "")} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Units Consumed</label>
                        <input type="text" readOnly value={ocrMonthlyUnits || scannedQuarterlyKwh || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Bill Amount</label>
                        <input type="text" readOnly value={monthlyBill || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Meter Information</label>
                        <input type="text" readOnly value={meterTypeInfo || meterCategory || ''} className="w-full px-2 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg" />
                      </div>'''

content = content.replace(old_grid, new_grid)

# Render error if eligibility says "exceeds maximum allowed"
# We can do this in the result block
old_error = '{eligibilityError && (<div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium mb-3 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{eligibilityError}</span></div>)}'
new_error = old_error + '''\n              {eligibilityResult && eligibilityResult.eligible === false && eligibilityResult.reason && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium mb-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{eligibilityResult.reason}</span>
                </div>
              )}'''
content = content.replace(old_error, new_error)

with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("LeadForm updated with new Scanned Details!")
