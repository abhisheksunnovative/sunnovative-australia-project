import re

with open('Website_Backend/src/controllers/lightBillEligibilityController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find where it parses req.body
old_body = 'const { meterCategory, billAmount, monthlyUnits, dueAmount, billStatus, monthsOverdue, state, overrideKw } = req.body;'
new_body = 'const { meterCategory, billAmount, monthlyUnits, dueAmount, billStatus, monthsOverdue, state, overrideKw, billingDays } = req.body;'
content = content.replace(old_body, new_body)

# Let's find where it checks rules and insert the billingDays check
# I'll just append it to the initial validation section

validation_insert = '''
    const maxBillingDays = settings.eligibilityRules?.latestBillRules?.maxBillingPeriodDays || 95;
    if (billingDays && billingDays > maxBillingDays) {
      return res.json({
        eligible: false,
        reason: Billing period ( days) exceeds the maximum allowed ( days).,
        suggestedKW: 0,
        stateSubsidyAmount: 0,
        centralSubsidyAmount: 0,
        totalSubsidy: 0,
        monthlySavings: 0,
        roiYears: 0,
        projectCost: 0
      });
    }
'''

content = content.replace("const billRules = settings.eligibilityRules.billStatusRules;", validation_insert + "\n    const billRules = settings.eligibilityRules.billStatusRules;")

with open('Website_Backend/src/controllers/lightBillEligibilityController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Eligibility controller updated")
