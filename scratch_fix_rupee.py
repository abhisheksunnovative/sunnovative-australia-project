import os

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken encoding character
# Sometimes it shows as `,1` in the output, let's just use regex to replace anything before ${monthlyBill} that's broken.
import re
content = re.sub(r"`[^$]*\$\{monthlyBill\}`", r"`₹${monthlyBill}`", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed rupee symbol!")
