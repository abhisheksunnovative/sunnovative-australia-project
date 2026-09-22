import os

filepath = 'Website_Frontend/src/components/LeadForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I need to append the missing closing tags after the new grid.
# The new grid ends with:
#                     </div>
#                   </div>
#               </div>
#             )}
# 
#             {/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}

# It should be:
#                     </div>
#                   </div>
#                 </div>
#               )}
#             </div>
#             
#             {/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}

old_part = """                    </div>
                  </div>
              </div>
            )}

            {/* 3. Recommended System & Subsidy"""

new_part = """                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Recommended System & Subsidy"""

content = content.replace(old_part, new_part)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored missing closing tags!")
