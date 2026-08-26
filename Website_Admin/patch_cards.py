import re

files = ['src/components/bde/BDELeadManagement.jsx', 'src/components/bde/BDEProspects.jsx']

for path in files:
    with open(path, 'r', encoding='utf8') as f:
        content = f.read()

    # Move install date block ABOVE the Residential • 6.6 kW block
    # Actually, let's just use regex to replace the entire middle column of the card
    # Middle column usually looks like:
    # <div className="flex flex-col items-end md:items-start lg:items-end justify-center min-w-[150px]">
    #   <div className="font-bold text-slate-800 text-sm mb-1">{lead.solarType || lead.projectType || 'Residential'} &bull; {lead.kw || 0} KW</div>
    #   <div className="text-xs text-slate-500 font-semibold mb-3">Est. Bill: <span className="text-slate-800">${lead.billAmount || 0} AUD</span></div>
    #   {/* Install date logic */}
    
    # We want:
    # <div className="flex flex-col items-end md:items-start lg:items-end justify-center min-w-[150px]">
    #   {/* Install Date block */}
    #   <div className="font-black text-slate-800 text-lg mb-1">{lead.solarType || lead.projectType || 'Residential'} &bull; {lead.kw || 0} kW</div>
    #   <div className="text-sm text-slate-600 font-bold mb-3">Est. Bill: <span className="text-slate-900">${lead.billAmount || 0}</span></div>
    
    # This is highly specific so I'll just use sed manually or a more targeted replace.
    print(f"Processed {path}")
