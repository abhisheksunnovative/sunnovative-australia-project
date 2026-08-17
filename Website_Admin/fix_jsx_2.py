import re

file_path = "D:/sunnovative-australia-website/Website_Admin/src/components/TrustBadgeEpcScreen.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Deactivation Modal */}"""

replacement = """              )}
            </div>
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
    print("Fixed closing tags perfectly.")
else:
    print("Target not found.")
