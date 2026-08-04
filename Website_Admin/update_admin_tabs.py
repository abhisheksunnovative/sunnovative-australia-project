import re

with open('src/components/MainLayout.jsx', 'r', encoding='utf-8') as f:
    main_layout = f.read()

# Remove order-journey tab
main_layout = re.sub(
    r'\{\s*name:\s*"Order Journey Settings",\s*id:\s*"order-journey",\s*icon:[^\}]+\},',
    '',
    main_layout
)

with open('src/components/MainLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(main_layout)


with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_jsx = f.read()

# Add import
if 'UnifiedCountrySettings' not in app_jsx:
    app_jsx = app_jsx.replace(
        'import DynamicWebsiteModule from "./components/DynamicWebsiteModule";',
        'import UnifiedCountrySettings from "./components/UnifiedCountrySettings";'
    )

# Replace case
app_jsx = app_jsx.replace(
    'case "country-websites":\n        return <DynamicWebsiteModule />;',
    'case "country-websites":\n        return <UnifiedCountrySettings />;'
)

# Remove case order-journey if exists
app_jsx = re.sub(
    r'case "order-journey":\s*return <OrderJourneyScreen[^>]*>;',
    '',
    app_jsx
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_jsx)
