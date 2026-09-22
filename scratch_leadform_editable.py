import re
filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace readOnly with onChange in Section 2 grid
replacements = {
    r'<input type="text" readOnly value=\{fullName \|\| \'UNKNOWN\'\} className="([^"]+)" />': 
    r'<input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="\1" />',
    
    r'<input type="text" readOnly value=\{consumerNumber \|\| \'UNKNOWN\'\} className="([^"]+)" />':
    r'<input type="text" value={consumerNumber} onChange={e => setConsumerNumber(e.target.value)} className="\1" />',
    
    r'<input type="text" readOnly value=\{scannedRetailer \|\| discom \|\| \'UNKNOWN\'\} className="([^"]+)" />':
    r'<input type="text" value={scannedRetailer || discom} onChange={e => setScannedRetailer(e.target.value)} className="\1" />',
    
    r'<input type="text" readOnly value=\{dueDate \|\| \'UNKNOWN\'\} className="([^"]+)" />':
    r'<input type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} className="\1" />',
    
    r'<input type="text" readOnly value=\{tariffCategory \|\| tariffDesc \|\| \'UNKNOWN\'\} className="([^"]+)" />':
    r'<input type="text" value={tariffCategory || tariffDesc} onChange={e => setTariffCategory(e.target.value)} className="\1" />',
    
    r'<input type="text" readOnly value=\{scannedBillingPeriod \|\| \(billingPeriodDays \? billingPeriodDays \+ \' days\' : \'UNKNOWN\'\)\} className="([^"]+)" />':
    r'<input type="text" value={billingPeriodDays} onChange={e => setBillingPeriodDays(e.target.value)} placeholder="e.g. 90" className="\1" />',
    
    r'<input type="text" readOnly value=\{meterTypeInfo \|\| meterCategory \|\| \'UNKNOWN\'\} className="([^"]+)" />':
    r'<input type="text" value={meterTypeInfo || meterCategory} onChange={e => setMeterTypeInfo(e.target.value)} className="\1" />',
    
    r'<input type="text" readOnly value=\{monthlyBill \? \'INR \' \+ monthlyBill : \'UNKNOWN\'\} className="([^"]+)" />':
    r'<input type="number" value={monthlyBill || ""} onChange={e => setMonthlyBill(Number(e.target.value))} className="\1" />'
}

for pattern, repl in replacements.items():
    content = re.sub(pattern, repl, content)

# 2. Add extractions for city, state, postcode in handleScanSuccess
extractions = """        if (ex.city) setCity(ex.city);
        if (ex.state) setCustomerState(ex.state);
        if (ex.postcode) setPostcode(ex.postcode);"""
if "if (ex.billingDays) setBillingPeriodDays(ex.billingDays);" in content:
    content = content.replace("if (ex.billingDays) setBillingPeriodDays(ex.billingDays);", "if (ex.billingDays) setBillingPeriodDays(ex.billingDays);\n" + extractions)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated LeadForm with editable fields and address extractions!")
