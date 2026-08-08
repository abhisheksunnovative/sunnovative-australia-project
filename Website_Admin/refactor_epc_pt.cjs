const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'EpcPartnerScreen.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useAdminSettings import
if (!content.includes('import { useAdminSettings }')) {
    content = content.replace(
        'import { COUNTRY_DATA } from "../utils/geography";',
        'import { COUNTRY_DATA } from "../utils/geography";\nimport { useAdminSettings } from "../hooks/useAdminSettings";'
    );
}

// 2. Call the hook inside the component
if (!content.includes('const { settings, loading: settingsLoading } = useAdminSettings();')) {
    content = content.replace(
        '  // Page states',
        '  // Page states\n  const { settings, loading: settingsLoading } = useAdminSettings();\n  const dynamicProjectTypes = settings?.projectTypes?.length > 0 ? settings.projectTypes : ["Residential"];'
    );
}

// 3. Replace hardcoded projectTypes with dynamicProjectTypes in initial state
content = content.replace(
    /projectTypes: \["Residential"\]/g,
    'projectTypes: dynamicProjectTypes'
);

// 4. Replace hardcoded array mapping in UI
const oldArrayMap = `                  {[
                    "Residential",
                    "Commercial",
                    "Industrial",
                    "Utility Scale",
                  ].map((type) => {`;
const newArrayMap = `                  {(settings?.projectTypes || ["Residential", "Commercial", "Industrial", "Utility Scale"]).map((type) => {`;
content = content.replace(oldArrayMap, newArrayMap);

fs.writeFileSync(filePath, content, 'utf8');
console.log('EpcPartnerScreen projectTypes refactored successfully.');
