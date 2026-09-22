import re

# Fix KycScreen
with open('Website_Admin/src/components/KycScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Import useEffect
if "import React, { useState }" in content:
    content = content.replace("import React, { useState }", "import React, { useState, useEffect }")

with open('Website_Admin/src/components/KycScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix QualificationScreen unique key issue
with open('Website_Admin/src/components/QualificationScreen.jsx', 'r', encoding='utf-8') as f:
    content2 = f.read()

# Find mapping for countries to add key
if "getStates(selectedCountry).map(s =>" in content2:
    # Just checking if key exists. It has `key={s}`
    pass

if "liveCountries.map(c => (" in content2:
    # It has `key={c.code}` but code is now _id
    content2 = content2.replace("key={c.code}", "key={c._id || c.code || c.name}")

with open('Website_Admin/src/components/QualificationScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content2)

# Also check KycScreen for the same mapping key issue
with open('Website_Admin/src/components/KycScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
if "liveCountries.map(c => (" in content:
    content = content.replace("key={c.code}", "key={c._id || c.code || c.name}")
with open('Website_Admin/src/components/KycScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed useEffect and key warnings!")
