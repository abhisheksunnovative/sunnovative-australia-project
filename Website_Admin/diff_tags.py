import re

def get_tags(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will strip out strings, comments, and curly braces `{ ... }` to leave only JSX tags?
    # This is too complex for regex.
    # Let's just use a simple regex to extract tags.
    # We want to find <div ...> and </div> and </> and <DetailDrawer ...> and </DetailDrawer>
    tags = []
    for m in re.finditer(r'<(/?[A-Za-z]+)(?:\s+[^>]*?)?/?>|</>', content):
        tag = m.group(1) or ""
        if tag.startswith('/'):
            tags.append(tag)
        else:
            if not m.group(0).endswith('/>'):
                tags.append(tag)
        if m.group(0) == '</>':
            tags.append('/>') # Fragment close
            
    return tags

tags_orig = get_tags("D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen_backup.jsx")
tags_new = get_tags("D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx")

print(f"Orig count: {len(tags_orig)}")
print(f"New count: {len(tags_new)}")

# Find divergence
for i in range(min(len(tags_orig), len(tags_new))):
    if tags_orig[i] != tags_new[i]:
        print(f"Divergence at tag {i}: orig={tags_orig[i]} new={tags_new[i]}")
        print(f"Context orig: {tags_orig[i-5:i+5]}")
        print(f"Context new: {tags_new[i-5:i+5]}")
        break
