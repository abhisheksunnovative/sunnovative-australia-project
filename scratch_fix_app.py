with open('Website_Admin/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix epc-settings case
bad_epc = '''      case "epc-settings":
          return (
              activeSubTab="epc-settings"
              partners={partners}
              projects={projects}
            />'''

good_epc = '''      case "epc-settings":
          return <SettingsScreen activeSubTab="epc-settings" partners={partners} projects={projects} />;'''
# Wait, what was epc-settings returning originally? Let me check git or another file.
# Since I don't have git history, I'll search for 'case "epc-settings"' in App.jsx.
