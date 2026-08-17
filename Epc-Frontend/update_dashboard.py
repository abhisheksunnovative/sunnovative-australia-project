import os
import re

file_path = r'D:\sunnovative-australia-website\Epc-Frontend\src\pages\epc\profile\TrustBadgeDashboard.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add recharts imports
content = content.replace(
    "import { ShieldCheck, TrendingUp, Users, Target, CheckCircle2, AlertCircle, FileText } from 'lucide-react';",
    "import { ShieldCheck, TrendingUp, Users, Target, CheckCircle2, AlertCircle, FileText, BarChart2 } from 'lucide-react';\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';"
)

# 2. Update isApproved logic
old_is_approved = "const isApproved = epc?.trustBadge?.status === 'Approved';"
new_is_approved = '''const purchasedCount = epc?.trustBadge?.purchasedLeads || 0;
  const consumedCount = epc?.trustBadge?.leadsConsumed || 0;
  const isApproved = epc?.trustBadge?.status === 'Approved' && (purchasedCount === 0 || consumedCount < purchasedCount);
  const isExhausted = epc?.trustBadge?.status === 'Approved' && purchasedCount > 0 && consumedCount >= purchasedCount;'''
content = content.replace(old_is_approved, new_is_approved)

# 3. Update header status UI
content = content.replace(
    '''Status: {isApproved ? <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 text-sm border border-green-500/30">Active</span> : <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 text-sm border border-slate-500/30">{epc?.trustBadge?.status || 'None'}</span>}''',
    '''Status: {isApproved ? <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 text-sm border border-green-500/30">Active</span> : isExhausted ? <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-sm border border-amber-500/30">Exhausted</span> : <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 text-sm border border-slate-500/30">{epc?.trustBadge?.status || 'None'}</span>}'''
)

# 4. Re-write the Analytics Grid and Recharts section
# Let's find the entire {isApproved && analytics && ( ... )} block and replace it.
analytics_grid_regex = re.compile(r'\{\s*isApproved\s*&&\s*analytics\s*&&\s*\(\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">.*?</div>\s*\)\s*\}', re.DOTALL)

new_analytics_grid = '''{isApproved && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Leads Consumed / Total</p>
              <h3 className="text-3xl font-black text-slate-800">{analytics.leadsConsumed || 0} <span className="text-lg text-slate-400">/ {analytics.purchasedLeads || 0}</span></h3>
              <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: ${Math.min(((analytics.leadsConsumed || 0)/(analytics.purchasedLeads || 1))*100, 100)}%}}></div>
              </div>
            </div>

            {routingType === 'FCFS' ? (
              <>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Leads Arrived Early</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.arrivedAfter || analytics.leadsArrivedEarly || 0}</h3>
                  {analytics.arrivedBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.arrivedAfter - analytics.arrivedBefore) / Math.max(analytics.arrivedBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Leads Converted</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.convertedAfter || analytics.leadsConverted || 0}</h3>
                  {analytics.convertedBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.convertedAfter - analytics.convertedBefore) / Math.max(analytics.convertedBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Profile Views</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.profileViewsAfter || analytics.profileViews || 0}</h3>
                  {analytics.profileViewsBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.profileViewsAfter - analytics.profileViewsBefore) / Math.max(analytics.profileViewsBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Customers Selected You</p>
                  <h3 className="text-3xl font-black text-slate-800">{analytics.customersSelectedAfter || analytics.customersSelected || 0}</h3>
                  {analytics.customersSelectedBefore !== undefined && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{Math.round(((analytics.customersSelectedAfter - analytics.customersSelectedBefore) / Math.max(analytics.customersSelectedBefore, 1)) * 100)}% vs Before Badge
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Recharts Analytics Diagram */}
          {analytics.chartData && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-lg">Trust Badge Impact Analysis (Last 7 Days)</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={False} stroke="#e2e8f0" />
                    <XAxis dataKey="period" tick={{fill: '#64748b', fontSize: 13}} axisLine={False} tickLine={False} />
                    <YAxis tick={{fill: '#64748b', fontSize: 13}} axisLine={False} tickLine={False} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    {routingType === 'FCFS' ? (
                      <>
                        <Bar dataKey="Arrivals" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="Views" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Selections" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}'''

new_analytics_grid = new_analytics_grid.replace("False", "false")
content = analytics_grid_regex.sub(new_analytics_grid, content)


# 5. Extract the Dynamic Benefits Section outside the modal, placing it right before {!isApproved && (
benefits_regex = re.compile(r'\{\s*/\*\s*Dynamic Benefits Section\s*\*/\s*\}.*?(?=<div className="bg-blue-50)', re.DOTALL)
benefits_match = benefits_regex.search(content)

if benefits_match:
    benefits_html = benefits_match.group(0)
    # Remove from inside the modal
    content = content.replace(benefits_html, '')
    
    # We only want to show the agreement checkbox if they are purchasing, so strip out the checkbox from the standalone version
    checkbox_regex = re.compile(r'\{\s*routingType === \'FCFS\' && \(\s*<label.*?</label>\s*\)\s*\}', re.DOTALL)
    standalone_benefits = checkbox_regex.sub('', benefits_html)
    
    # Place standalone benefits just above the {!isApproved} block
    not_approved_start = "{!isApproved && ("
    if not_approved_start in content:
        content = content.replace(not_approved_start, f"{{/* Always show benefits */}}\n      {{!showPurchase && {standalone_benefits}}}\n\n      {not_approved_start}")

# 6. Change {!isApproved && ( to {!isApproved && !showPurchase && ( 
content = content.replace("{!isApproved && (", "{!isApproved && !showPurchase && (")
# Update wording if exhausted
content = content.replace(
    '''<h3 className="text-amber-900 font-bold text-lg mb-2">Trust Badge Not Active</h3>''',
    '''<h3 className="text-amber-900 font-bold text-lg mb-2">{isExhausted ? 'Trust Badge Exhausted' : 'Trust Badge Not Active'}</h3>'''
)
content = content.replace(
    '''Purchase leads to activate your Trust Badge and unlock priority routing or higher visibility in Customer Select regions.''',
    '''{isExhausted ? 'Your previously purchased leads have been fully consumed. Purchase more leads to reactivate your Trust Badge and retain your premium benefits.' : 'Purchase leads to activate your Trust Badge and unlock priority routing or higher visibility in Customer Select regions.'}'''
)

# 7. Add checkbox back into the purchase modal where it belongs
# Let's insert it before the pricing box in the modal
pricing_box = '<div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col gap-2">'
checkbox_html = '''{routingType === 'FCFS' && (
                  <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors mb-4">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={undertakingAgreed}
                      onChange={e => setUndertakingAgreed(e.target.checked)}
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      <strong>I agree to the Trust Badge Undertaking.</strong> I confirm that I will maintain high compliance standards, handle leads professionally, and adhere to local regulatory requirements for all assigned installations.
                    </span>
                  </label>
                )}'''
content = content.replace(pricing_box, checkbox_html + '\n              ' + pricing_box)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated successfully!")
