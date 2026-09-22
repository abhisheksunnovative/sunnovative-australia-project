import os
import re

components_dir = 'Website_Admin/src/components'

for root, _, files in os.walk(components_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find broken imports: "import {\nimport { fetchWithCache }"
            if 'import {\nimport { fetchWithCache }' in content:
                content = content.replace('import {\nimport { fetchWithCache }', 'import { fetchWithCache } from \'../utils/fetchWithCache\';\nimport {')
                # But wait, the path might be wrong for nested folders!
                # E.g. bde/BDELayout.jsx -> should be '../../utils/fetchWithCache'
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed broken import in {filepath}")
                
            elif 'import React' in content and 'import { fetchWithCache }' in content:
                # Some other broken patterns?
                pass

