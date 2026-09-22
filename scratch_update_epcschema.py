import re

with open('Website_Backend/src/models/EpcPartner.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Inject dynamic documents and qualification category
new_fields = '''    cecStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Expired'], default: 'Pending' },
    dynamicDocuments: [{
      documentName: { type: String },
      fileUrl: { type: String },
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
    }]
  },
  qualificationCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'QualificationCategory' },'''

content = content.replace("cecStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Expired'], default: 'Pending' }\n  },", new_fields)

with open('Website_Backend/src/models/EpcPartner.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated EpcPartner schema")
