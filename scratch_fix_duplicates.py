import re

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I injected these 10 lines:
to_remove = """  const [dueDate, setDueDate] = useState("");
  const [tariffCategory, setTariffCategory] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [meterTypeInfo, setMeterTypeInfo] = useState("");
  const [billingPeriodDays, setBillingPeriodDays] = useState("");
  const [meterCategory, setMeterCategory] = useState("");
  const [discom, setDiscom] = useState("");
  const [tariffDesc, setTariffDesc] = useState("");
  const [billStatus, setBillStatus] = useState("");
  const [dueAmount, setDueAmount] = useState("");"""

# Replace the whole block with just the first 5 lines
new_block = """  const [dueDate, setDueDate] = useState("");
  const [tariffCategory, setTariffCategory] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [meterTypeInfo, setMeterTypeInfo] = useState("");
  const [billingPeriodDays, setBillingPeriodDays] = useState("");"""

content = content.replace(to_remove, new_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed duplicates!")
