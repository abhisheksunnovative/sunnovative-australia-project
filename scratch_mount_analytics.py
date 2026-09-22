import re

with open('Website_Backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "\nimport analyticsRoutes from './src/routes/analyticsRoutes.js';\n"
content = content.replace("import qualificationRoutes from './src/routes/qualificationRoutes.js';", "import qualificationRoutes from './src/routes/qualificationRoutes.js';" + import_statement)

mount_statement = "\napp.use('/api/admin/analytics', analyticsRoutes);\n"
content = content.replace("app.use('/api/qualifications', qualificationRoutes);", "app.use('/api/qualifications', qualificationRoutes);" + mount_statement)

with open('Website_Backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Analytics Routes mounted in server.js")
