import re

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_error = '{eligibilityError && (<div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium mb-3 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{eligibilityError}</span></div>)}'
new_error = old_error + '''\n              {eligibilityResult && eligibilityResult.isEligible === false && eligibilityResult.reasons && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 font-medium mb-3 flex flex-col gap-1">
                  <div className="flex gap-2 font-bold"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>Eligibility Check Failed:</span></div>
                  <ul className="list-disc pl-6">
                    {eligibilityResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}'''

if old_error in content:
    content = content.replace(old_error, new_error)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added eligibility error UI!")
else:
    print("Could not find eligibilityError block.")
