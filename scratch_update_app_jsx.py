import re

with open('Website_Admin/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "const WebAppAnalyticsScreen = React.lazy(() => import('./components/WebAppAnalyticsScreen'));"
content = content.replace("const PlatformAnalyticsScreen = React.lazy(() => import('./components/PlatformAnalyticsScreen'));", "const PlatformAnalyticsScreen = React.lazy(() => import('./components/PlatformAnalyticsScreen'));\n" + import_statement)

case_statement = '''        case "web-app-analytics":
          return <WebAppAnalyticsScreen />;'''
content = content.replace('case "platform-analytics":', case_statement + '\n        case "platform-analytics":')

with open('Website_Admin/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("App.jsx updated")
