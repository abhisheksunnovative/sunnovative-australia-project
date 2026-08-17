import re

file_path = "D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the mismatched closing tags just before Deactivation Modal
target = """              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Deactivation Modal */}"""

replacement = """              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Deactivation Modal */}"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed closing tags successfully.")
else:
    print("Target not found. Current end block is:")
    # print the lines before Deactivation Modal
    parts = content.split("{/* Deactivation Modal */}")
    if len(parts) > 1:
        print(parts[0][-200:])
