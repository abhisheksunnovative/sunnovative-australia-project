import re

with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pass billingDays to handleCheckEligibility function signature and call
content = content.replace("billDate: ex.billIssueDate || ex.billingPeriodTo || null,", "billDate: ex.billIssueDate || ex.billingPeriodTo || null,\n              billingDays: ex.billingDays || 0,")
content = content.replace("billDate, overrideKw = 0 }) => {", "billDate, billingDays, overrideKw = 0 }) => {")

# Update API payload
content = content.replace("overrideKw,", "overrideKw,\n          billingDays,")

# Expose fields to the UI if necessary
# First let's map them to some state variables if they exist, or at least pass them through
# Wait, the UI has a "Scanned Details" block in LeadForm. Let's see what variables it renders.
