import re

with open('Website_Backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = '''
import kycRoutes from './src/routes/kycRoutes.js';
import qualificationRoutes from './src/routes/qualificationRoutes.js';
'''
# Inject imports
content = content.replace("import epcWalletRoutes from './src/routes/epcWalletRoutes.js';", "import epcWalletRoutes from './src/routes/epcWalletRoutes.js';" + import_statement)

# Mount routes
mount_statement = '''
app.use('/api/kyc', kycRoutes);
app.use('/api/qualifications', qualificationRoutes);
'''
content = content.replace("app.use('/api/epc-wallet', epcWalletRoutes);", "app.use('/api/epc-wallet', epcWalletRoutes);" + mount_statement)

with open('Website_Backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Routes mounted in server.js")
