import re

with open('Website_Backend/src/utils/geminiBillExtractor.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the prompt schema for 'geminiBillExtractor.js' to include the fields globally.
# Wait, let's see the schema in the file.
