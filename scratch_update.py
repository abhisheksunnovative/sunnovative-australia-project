import re

with open('Website_Frontend/src/components/LeadForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
content = content.replace('const [eligibilityError, setEligibilityError] = useState("");', 'const [eligibilityError, setEligibilityError] = useState("");\n  const [showDetailsModal, setShowDetailsModal] = useState(false);')

# 2. Change form submit handler on the main form
content = content.replace('<form onSubmit={handleFormSubmit} className="space-y-3.5" id="solar-lead-form">', '<form onSubmit={(e) => { e.preventDefault(); setShowDetailsModal(true); }} className="space-y-3.5" id="solar-lead-form">')

# 3. Change the main submit button text and remove its type="submit" because form handles it via onSubmit
content = content.replace('<>Submit Application <ArrowRight className="w-4 h-4" /></>', '<>Get Solar Installed <ArrowRight className="w-4 h-4" /></>')

# 4. Extract the contact details block and replace it with a placeholder
start_marker = '{/* --- DYNAMIC FIELDS (from Admin Panel Form Builder) --- */}'
end_marker = '            {/* 3. Recommended System & Subsidy (Auto-calculated, read-only) */}'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    contact_fields_block = content[start_idx:end_idx]
    # Keep the placeholders out, we just remove it from here
    content = content[:start_idx] + end_marker + content[end_idx + len(end_marker):]
    
    # 5. Build Modal
    modal_ui = f'''
      {{/* --- MODAL FOR CONTACT DETAILS --- */}}
      {{showDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative my-8">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 md:p-5 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-solar-sky" />
                Fill your details
              </h2>
              <button onClick={{() => setShowDetailsModal(false)}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-5">
              <form onSubmit={{(e) => {{
                e.preventDefault();
                setShowDetailsModal(false);
                handleFormSubmit(e);
              }}}}>
                
                {{/* RE-INSERTED CONTACT FIELDS */}}
                {contact_fields_block}
                
                <div className="pt-4 border-t border-slate-100 mt-6 sticky bottom-0 bg-white pb-2">
                  <button type="submit" disabled={{isSubmitting}}
                    className="w-full py-4 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 bg-solar-green hover:bg-emerald-600 shadow-emerald-500/10 cursor-pointer">
                    {{isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        {{isAU ? "Generating Quote..." : "Registering Application..."}}
                      </span>
                    ) : (
                      <>Send enquiry and create account <ArrowRight className="w-4 h-4" /></>
                    )}}
                  </button>
                  <span className="block text-center text-[10px] text-slate-400 mt-2.5 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Your information is fully secured. We never share your data.
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}}
    </section>
'''
    content = content.replace('</section>', modal_ui)
    
    with open('Website_Frontend/src/components/LeadForm.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find markers")
