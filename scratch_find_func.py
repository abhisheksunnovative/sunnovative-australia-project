with open('Website_Backend/src/controllers/epcOrderController.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'updateOrderStage' in line:
        print("".join(lines[i:i+30]))
        break
