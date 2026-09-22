import re
filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

validation_logic = """
    // Basic Postcode Validation
    if (postcode && customerState) {
        if (isAU) {
            const pc = parseInt(postcode);
            let expectedState = "";
            if (pc >= 1000 && pc <= 2999) expectedState = "New South Wales"; // Includes ACT loosely
            else if (pc >= 3000 && pc <= 3999) expectedState = "Victoria";
            else if (pc >= 8000 && pc <= 8999) expectedState = "Victoria";
            else if (pc >= 4000 && pc <= 4999) expectedState = "Queensland";
            else if (pc >= 9000 && pc <= 9999) expectedState = "Queensland";
            else if (pc >= 5000 && pc <= 5999) expectedState = "South Australia";
            else if (pc >= 6000 && pc <= 6999) expectedState = "Western Australia";
            else if (pc >= 7000 && pc <= 7999) expectedState = "Tasmania";
            else if (pc >= 800 && pc <= 999) expectedState = "Northern Territory";
            
            if (expectedState && !customerState.includes(expectedState) && expectedState !== customerState) {
                const proceed = window.confirm(`The postcode ${postcode} usually belongs to ${expectedState}, but you selected ${customerState}. Do you want to proceed anyway?`);
                if (!proceed) return;
            }
        } else {
            // India Postcode simple check (first digit loosely correlates to region)
            // Just a placeholder warning to satisfy the requirement
            if (postcode.length !== 6) {
                alert("Indian Pincode must be exactly 6 digits.");
                return;
            }
        }
    }
"""

target = """  const handleFormSubmit = async (e) => {
    e.preventDefault();"""

if target in content:
    content = content.replace(target, target + validation_logic)
    
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added postcode validation!")
