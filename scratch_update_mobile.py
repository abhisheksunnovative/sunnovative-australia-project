with open('Website_Admin/src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the mobile menu part
old_mobile_epc = '''              {/* EPC Settings Setup Step-Sequence Dropdown */}
              {!isVeneet && (
                <DropdownGroup
                  label="EPC Settings"
                  icon={<Settings className="w-5 h-5 text-sky-200" />}
                  isOpen={epcSettingsOpen}
                  setIsOpen={setEpcSettingsOpen}
                  items={epcSequenceItems}
                  activeIds={epcSequenceIds}
                  showStep
                  onMobileSelect={() => setMobileMenuOpen(false)}
                />
              )}'''

new_mobile_epc = '''              {/* EPC Settings Setup Step-Sequence Dropdown */}
              {!isVeneet && (
                <DropdownGroup
                  label="EPC Settings"
                  icon={<Settings className="w-5 h-5 text-sky-200" />}
                  isOpen={epcSettingsOpen}
                  setIsOpen={setEpcSettingsOpen}
                  items={epcSequenceItems}
                  activeIds={epcSequenceIds}
                  onMobileSelect={() => setMobileMenuOpen(false)}
                />
              )}
              {/* BDE Settings Dropdown */}
              {!isVeneet && (
                <DropdownGroup
                  label="BDE Settings"
                  icon={<Users className="w-5 h-5 text-sky-200" />}
                  isOpen={bdeSettingsOpen}
                  setIsOpen={setBdeSettingsOpen}
                  items={bdeSequenceItems}
                  activeIds={bdeSequenceIds}
                  onMobileSelect={() => setMobileMenuOpen(false)}
                />
              )}'''

content = content.replace(old_mobile_epc, new_mobile_epc)

with open('Website_Admin/src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Mobile menu updated!")
