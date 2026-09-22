with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('Start Solar Journey', 'Login Solar Account')
with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
