import os
import re

directories = [
    r"D:\sunnovative-australia-website\Website_Frontend\src",
    r"D:\sunnovative-australia-website\Epc-Frontend\src",
    r"D:\sunnovative-australia-website\Website_Admin\src"
]

replacements = {
    # General
    r"Solar Installation Kaise Kaam Karta Hai\?": "How Solar Installation Works",
    r"Yeh file khali \(0 MB\) lag rahi hai\. Kripya koi doosri valid file upload karein\.": "This file appears to be empty (0 MB). Please upload a valid file.",
    r"Mobile number se login ya register karo": "Login or register using mobile number",
    r"First time\? Register karo": "First time? Register now",
    r"Solar orders track karo": "Track your solar orders",
    r"Details update karo": "Update your details",
    r"Solar ke liye apply karo home page se": "Apply for solar from the home page",
    
    # Customer Login
    r"OTP bheja gaya — verify karke naya Set Your PIN": "OTP sent - verify to set a new PIN",
    r"6-digit OTP daalo": "Please enter a 6-digit OTP",
    r"OTP galat": "Incorrect OTP",
    r"PIN match nahi kiya — dobara daalo": "PINs do not match - please try again",
    r"Ek baar naam aur OTP se verify karo, phir Set Your PIN": "Verify your name and OTP once, then set your PIN",
    r"— PIN se login karo": "- Login using PIN",
    r"First time\? \{\!isIndia \? \"Email\" : \"Mobile number\"\} daalo — auto register ho jayega": "First time? Enter your {!isIndia ? \"Email\" : \"Mobile number\"} to auto-register",
    r"Bhej raha hai\.\.\.": "Sending...",
    r"OTP Bhejo": "Send OTP",
    r"🔄 PIN bhool gaye\? OTP se login karo": "🔄 Forgot PIN? Login with OTP",
    
    # Customer Portal
    r"Subsidy applicable nahi — custom quote ke liye apply karo": "Subsidy not applicable - apply for a custom quote",
    r"Abhi koi document nahi\. Neeche upload karo\.": "No documents yet. Please upload below.",
    r"Upload Karo": "Upload",
    r"Document Upload Karo": "Upload Document",
    r"Rooftop photo upload karna zaroori hai": "Rooftop photo upload is required",
    r"Utility Bill/Site Document zaroori hai": "Utility Bill/Site Document is required",
    r"Welcome Back / Swagat Hai": "Welcome Back",
    r"tak ki direct subsidy milti hai 3kW system par. Direct Benefit Transfer \(DBT\) is processed post net-metering\.": "direct subsidy available on 3kW systems. Direct Benefit Transfer (DBT) is processed post net-metering.",
    r"Aapne abhi tak koi rooftop solar project apply nahi kiya hai\. Apne pehle solar system ke liye \u003cstrong\u003e\"Create First Project\"\u003c/strong\u003e tab par click karein aur govt rebate claim karein!": "You haven't applied for a rooftop solar project yet. Click on the <strong>\"Create First Project\"</strong> tab for your first solar system and claim your govt rebate!",
    r"Installation complete ho chuki hai! Kripya apne installer ko rate karein:": "Installation is complete! Please rate your installer:",
    r"Solar system ke liye apply karo": "Apply for a solar system",
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

                    if content != original_content:
                        with open(filepath, "w", encoding="utf-8") as f:
                            f.write(content)
                        print(f"Updated: {filepath}")
                        files_changed += 1
                except Exception as e:
                    pass

print(f"Total files updated: {files_changed}")
