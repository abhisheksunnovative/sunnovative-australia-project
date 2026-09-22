import os
import re

components_dir = 'Website_Admin/src/components'

for root, _, files in os.walk(components_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            # Find depth relative to components_dir
            rel_path = os.path.relpath(root, components_dir)
            if rel_path == '.':
                correct_import = "import { fetchWithCache } from '../utils/fetchWithCache';"
            else:
                depth = len(rel_path.split(os.sep))
                prefix = '../' * (depth + 1)
                correct_import = f"import {{ fetchWithCache }} from '{prefix}utils/fetchWithCache';"

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if 'fetchWithCache' in content:
                # Replace incorrect import paths
                content = re.sub(r"import \{ fetchWithCache \} from '\.\./utils/fetchWithCache';", correct_import, content)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Fixed relative paths for nested components!")
