filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
duplicate_keys = set()
for line in lines:
    if "const [dueDate, setDueDate] = useState" in line:
        if "dueDate" in duplicate_keys: continue
        duplicate_keys.add("dueDate")
    elif "const [tariffCategory, setTariffCategory]" in line:
        if "tariffCategory" in duplicate_keys: continue
        duplicate_keys.add("tariffCategory")
    elif "const [customerType, setCustomerType]" in line:
        if "customerType" in duplicate_keys: continue
        duplicate_keys.add("customerType")
    elif "const [meterTypeInfo, setMeterTypeInfo]" in line:
        if "meterTypeInfo" in duplicate_keys: continue
        duplicate_keys.add("meterTypeInfo")
    elif "const [billingPeriodDays, setBillingPeriodDays]" in line:
        if "billingPeriodDays" in duplicate_keys: continue
        duplicate_keys.add("billingPeriodDays")

    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Removed duplicate states!")
