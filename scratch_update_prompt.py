import re

with open('Website_Backend/src/utils/geminiBillExtractor.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_schema = '''Schema:
{
  "retailer": "string (e.g. AGL, Origin Energy, Alinta Energy, EnergyAustralia, etc.)",
  "accountNumber": "string (the customer's account number)",
  "nmiNumber": "string (10 or 11 digit National Metering Identifier)",
  "customerName": "string",
  "distributor": "string (the DNSP or distributor)",
  "suburb": "string",
  "state": "string (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)",
  "postcode": "string (4-digit Australian postcode)",
  "billingPeriodFrom": "string (DD MMM YYYY)",
  "billingPeriodTo": "string (DD MMM YYYY)",
  "billingDays": "number (integer)",
  "quarterlyKwh": "number (total electricity usage in kWh for the period)",
  "dailyKwh": "number (average daily electricity usage in kWh)",
  "quarterlyBillAmount": "number (total amount due on the bill, without $)",
  "solarExportKwh": "number (feed-in or exported solar in kWh, if any)",
  "solarExportCredit": "number (feed-in or exported solar credit amount, if any)",
  "tariffType": "string (e.g. Time of Use (TOU), Single Rate, Controlled Load, etc. Peak/Off-Peak implies TOU)",
  "meterType": "string (e.g. Smart Meter, Interval Meter, Basic Meter)",
  "customerType": "string (e.g. Residential or Commercial/Business)"
}'''

new_schema = '''Schema:
{
  "retailer": "string (e.g. AGL, Origin Energy, Tata Power, BESCOM, etc.)",
  "consumerNumber": "string (Consumer / Account Number)",
  "accountNumber": "string (the customer's account number, fallback for consumerNumber)",
  "nmiNumber": "string (10 or 11 digit National Metering Identifier if applicable)",
  "customerName": "string (Customer Name)",
  "distributor": "string (DISCOM / Utility)",
  "suburb": "string",
  "state": "string (State or province)",
  "postcode": "string",
  "billingPeriodFrom": "string (DD MMM YYYY)",
  "billingPeriodTo": "string (DD MMM YYYY)",
  "billingDays": "number (integer, total billing period duration in days)",
  "quarterlyKwh": "number (total Units Consumed in kWh for the period)",
  "dailyKwh": "number (average daily electricity usage in kWh)",
  "quarterlyBillAmount": "number (total Bill Amount due, numeric only)",
  "dueDate": "string (Due Date, DD MMM YYYY format if found)",
  "solarExportKwh": "number (feed-in or exported solar in kWh, if any)",
  "solarExportCredit": "number (feed-in or exported solar credit amount, if any)",
  "tariffType": "string (Tariff Category, e.g. Time of Use (TOU), Single Rate, LT-1, etc.)",
  "meterType": "string (Meter Information, e.g. Smart Meter, Interval Meter, Basic Meter, Phase)",
  "customerType": "string (Residential / Commercial Category)"
}'''

# Also update prompt header
content = content.replace("You are an expert Australian electricity bill parser", "You are an expert electricity bill parser (Global, including Australia and India)")

content = content.replace(old_schema, new_schema)

with open('Website_Backend/src/utils/geminiBillExtractor.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Prompt Updated!")
