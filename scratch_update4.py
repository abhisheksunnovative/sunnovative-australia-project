with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out_lines = []
skip = False
div_depth = 0

for i, line in enumerate(lines):
    if 'Or Enter Quarterly Bill Manually' in line or 'Or Enter Average Bill Manually' in line:
        # We need to backtrack to remove the opening <div> of this block.
        # Looking at previous lines, it's just <div> 1 or 2 lines above.
        out_lines.pop() # remove <label>
        if out_lines[-1].strip() == '<div>':
            out_lines.pop()
        skip = True
        div_depth = 1 # We popped the opening div, but let's just trace the closing div of this section
        continue
        
    if skip:
        if '<div' in line:
            div_depth += line.count('<div')
        if '</div' in line:
            div_depth -= line.count('</div')
            
        if div_depth <= 0:
            skip = False
        continue
        
    out_lines.append(line)

with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)
print('Removed successfully!')
