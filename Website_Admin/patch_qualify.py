import re

with open("src/components/bde/BDELeadManagement.jsx", "r", encoding="utf8") as f:
    content = f.read()

qualify_regex = r'const handleQualify = async \(lead\) => \{'
new_qualify = """const handleQualify = async (lead) => {
    if (!lead.nextFollowUp) {
      alert("Please select a Follow-up Date on the card before finalizing the installation date.");
      return;
    }"""
content = re.sub(qualify_regex, new_qualify, content)

with open("src/components/bde/BDELeadManagement.jsx", "w", encoding="utf8") as f:
    f.write(content)
print("Done Qualify patch")
