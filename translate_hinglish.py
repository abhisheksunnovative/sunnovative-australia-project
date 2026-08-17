import os
import re

directories = [
    r"D:\sunnovative-australia-website\Website_Frontend\src",
    r"D:\sunnovative-australia-website\Epc-Frontend\src",
    r"D:\sunnovative-australia-website\Website_Admin\src"
]

replacements = {
    r"Valid 9 or 10-digit mobile number daalo": "Please enter a valid 9 or 10-digit mobile number",
    r"Valid email address daalo": "Please enter a valid email address",
    r"Error aayi": "An error occurred",
    r"4-digit PIN daalo": "Please enter a 4-digit PIN",
    r"4-digit PIN chahiye": "A 4-digit PIN is required",
    r"PIN galat hai": "Incorrect PIN",
    r"OTP Verify Karo": "Verify OTP",
    r"PIN Set Karo dY\"\?": "Set Your PIN dY\"\?",
    r"PIN Set Karo": "Set Your PIN",
    r"Ek baar naam aur OTP se verify karo, phir PIN set karo": "Verify your name and OTP once, then set your PIN",
    r"Agla baar sirf PIN se seedha login hoga": "Next time, you can log in directly using your PIN",
    r"Pehli baar\? \(\!isIndia \? \"Email\" : \"Mobile number\"\) daalo \?\" auto register ho jayega": "First time? Enter your {!isIndia ? \"Email\" : \"Mobile number\"} to auto-register",
    r"Pehli baar\? \{\!isIndia \? \"Email\" : \"Mobile number\"\} daalo \?\" auto register ho jayega": "First time? Enter your {!isIndia ? \"Email\" : \"Mobile number\"} to auto-register",
    r"Pehli baar\?": "First time?",
    r"daalo \?\" auto register ho jayega": "to auto-register",
    r"daalo - auto register ho jayega": "to auto-register",
    r"Naam required hai": "Name is required",
    r"OTP bheja gaya \?\" verify karke naya PIN set karo": "OTP sent - verify to set a new PIN",
    r"Network error\. Backend check karo\.": "Network error. Please check the backend.",
    r"PIN match nahi kiya \?\" dobara daalo": "PINs do not match - please try again",
    r"Dashboard khul raha hai\.\.\.": "Opening Dashboard...",
    r"\?\" PIN se login karo": "- Login using PIN",
    r"par bheja gaya": "has been sent to",
}

files_changed = 0

for directory in directories:
    if not os.path.exists(directory):
        continue
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith((".js", ".jsx", ".ts", ".tsx")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    original_content = content
                    for old, new in replacements.items():
                        content = re.sub(old, new, content, flags=re.IGNORECASE)
                    
                    # Manual complex replacements
                    content = content.replace('Pehli baar? {!isIndia ? "Email" : "Mobile number"} daalo ?" auto register ho jayega', 'First time? Enter your {!isIndia ? "Email" : "Mobile number"} to auto-register')
                    content = content.replace('Pehli baar? {!isIndia ? "Email" : "Mobile number"} daalo - auto register ho jayega', 'First time? Enter your {!isIndia ? "Email" : "Mobile number"} to auto-register')
                    content = content.replace('`${!isIndia ? email : \'+91 \' + mobile} ?" PIN se login karo`', '`Login using PIN for ${!isIndia ? email : \'+91 \' + mobile}`')
                    content = content.replace('`OTP ${!isIndia ? email : \'+91 \' + mobile} par bheja gaya`', '`OTP sent to ${!isIndia ? email : \'+91 \' + mobile}`')

                    if content != original_content:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(content)
                        print(f"Updated: {filepath}")
                        files_changed += 1
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

print(f"Total files updated: {files_changed}")
