import os
import re

files_to_update = [
    'Website_Backend/src/controllers/billTemplateController.js',
    'Website_Backend/src/utils/geminiBillExtractor.js'
]

for file_path in files_to_update:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Restore gemini-3.6-flash
    content = content.replace('gemini-1.5-flash', 'gemini-3.6-flash')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reverted to 3.6-flash")
