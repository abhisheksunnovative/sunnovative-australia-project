import re

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

states_to_add = """  const [dueDate, setDueDate] = useState("");
  const [tariffCategory, setTariffCategory] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [meterTypeInfo, setMeterTypeInfo] = useState("");
  const [billingPeriodDays, setBillingPeriodDays] = useState("");
  const [meterCategory, setMeterCategory] = useState("");
  const [discom, setDiscom] = useState("");
  const [tariffDesc, setTariffDesc] = useState("");
  const [billStatus, setBillStatus] = useState("");
  const [dueAmount, setDueAmount] = useState("");"""

# Insert them after scannedQuarterlyKwh
target_line = "  const [scannedQuarterlyKwh, setScannedQuarterlyKwh] = useState(null);"
if target_line in content:
    content = content.replace(target_line, target_line + "\n" + states_to_add)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added missing states!")
else:
    print("Could not find target line.")
