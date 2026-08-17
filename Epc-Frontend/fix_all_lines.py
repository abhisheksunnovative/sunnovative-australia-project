file_path = "D:/sunnovative-australia-website/Epc-Frontend/src/pages/epc/projects/EpcProjectDetail.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if line.startswith("/* eslint-disable */\\n"):
        line = line.replace("/* eslint-disable */\\n", "")
    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    if "/* eslint-disable */\n" not in new_lines[0]:
        f.write("/* eslint-disable */\n")
    f.writelines(new_lines)
