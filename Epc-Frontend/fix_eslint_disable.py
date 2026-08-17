file_path = "D:/sunnovative-australia-website/Epc-Frontend/src/pages/epc/projects/EpcProjectDetail.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace any occurrence of /* eslint-disable */`nimport with actual newline
content = content.replace("/* eslint-disable */`nimport", "/* eslint-disable */\nimport")
# Replace any occurrence of /* eslint-disable */nimport with actual newline
content = content.replace("/* eslint-disable */nimport", "/* eslint-disable */\nimport")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
