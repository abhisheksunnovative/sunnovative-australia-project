import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, AlertCircle, Landmark, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import epcApi from '../../../api/epcApi';
import { useEpcAuth } from '../../../context/EpcAuthContext';

export default function EpcPaymentSettings() {
  const { epc } = useEpcAuth();

  // ── Derive EPC's operating states from profile ──
  // EPC has one primary country and one primary state (HQ)
  const epcCountry  = (epc?.country || 'india').toLowerCase();
  const epcHQState  = epc?.state || '';

  const [projectTypes,      setProjectTypes]      = useState([]);
  const [selectedPt,        setSelectedPt]        = useState('');

  // ── Data state ──
  const [stagesConfig,   setStagesConfig]   = useState([]);
  const [tokenConfig,    setTokenConfig]    = useState({ tokenType: 'none', fixedAmount: 0 });
  const [customValues,   setCustomValues]   = useState({});
  const [epcTokenAmount, setEpcTokenAmount] = useState(0);

  // ── UI state ──
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [successMsg,   setSuccessMsg]   = useState('');
  const [errorMsg,     setErrorMsg]     = useState('');

  // ── Step 1: fetch project types from Admin settings ──
  useEffect(() => {
    const fetchTypes = async () => {
      setLoadingTypes(true);
      try {
        const res = await epcApi.get(
          `/api/admin/payment-settings/payment-settings?country=${epcCountry}`
        );
        const configs = res.data?.projectConfigs || [];
        let types = configs.map(c => c.projectType);

        // Filter to EPC's qualified project types if defined
        if (epc?.qualifiedProjectTypes?.length > 0) {
          const ql = epc.qualifiedProjectTypes.map(t => t.toLowerCase());
          types = types.filter(t => ql.includes(t.toLowerCase()));
        }

        if (types.length === 0) types = ['residential'];
        setProjectTypes(types);
        setSelectedPt(types[0]);
      } catch (err) {
        console.error('fetchTypes error:', err);
        setProjectTypes(['residential']);
        setSelectedPt('residential');
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTypes();
  }, [epcCountry, epc]);

  // ── Step 2: when project type selected → fetch admin config + saved EPC values ──
  useEffect(() => {
    if (selectedPt) fetchSettingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPt]);

  const fetchSettingsData = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Admin config (master settings)
      const adminRes = await epcApi.get(
        `/api/admin/payment-settings/payment-settings?country=${epcCountry}`
      );
      const adminConfigs      = adminRes.data?.projectConfigs || [];
      const currentAdminConf  = adminConfigs.find(
        c => c.projectType.toLowerCase() === selectedPt.toLowerCase()
      );
      const adminStages = currentAdminConf?.paymentStages || [];
      const adminToken  = currentAdminConf?.signupToken   || { tokenType: 'none', fixedAmount: 0 };

      setStagesConfig(adminStages);
      setTokenConfig(adminToken);

      // EPC's own saved values
      const epcRes  = await epcApi.get(
        `/api/epc/payment-settings?country=${epcCountry}&projectType=${selectedPt}`
      );
      const epcData = epcRes.data?.data;
      setEpcTokenAmount(epcData?.signupTokenAmount || 0);

      const resolved = {};
      adminStages.forEach(stage => {
        const saved = epcData?.stagePayments?.find(s => s.stageKey === stage.stageKey);
        resolved[stage.stageKey] = saved ? saved.customValue : stage.defaultValue;
      });
      setCustomValues(resolved);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load payment configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = (stageKey, val) => {
    setCustomValues(prev => ({ ...prev, [stageKey]: Number(val) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    let totalPct = 0;
    const stagesPayload = [];

    stagesConfig.forEach(stage => {
      const val = customValues[stage.stageKey] ?? stage.defaultValue;
      stagesPayload.push({ stageKey: stage.stageKey, customValue: val });
      if (stage.valueType === 'percentage') totalPct += val;
    });

    if (stagesConfig.some(s => s.valueType === 'percentage') && totalPct !== 100) {
      setErrorMsg(`Percentage stages must total 100% (currently ${totalPct}%).`);
      return;
    }

    setSaving(true);
    try {
      const res = await epcApi.post('/api/epc/payment-settings', {
        country:           epcCountry,
        projectType:       selectedPt,
        signupTokenAmount: Number(epcTokenAmount) || 0,
        stagePayments:     stagesPayload,
      });
      if (res.data?.success) {
        setSuccessMsg('Payment milestones saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.data?.message || 'Failed to save.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const pctStages  = stagesConfig.filter(s => s.valueType === 'percentage');
  const totalSum   = pctStages.reduce((sum, s) => sum + (customValues[s.stageKey] ?? s.defaultValue), 0);
  const currency   = epcCountry === 'australia' ? '$' : '₹';
  const sampleCost = epcCountry === 'australia' ? 8000 : 150000;

  // Country display flag
  const countryFlag = epcCountry === 'australia' ? '🇦🇺' : epcCountry === 'india' ? '🇮🇳' : '🌍';
  const countryLabel = epcCountry.charAt(0).toUpperCase() + epcCountry.slice(1);

  if (!selectedPt) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customer Payment Settings</h2>
          <p className="text-gray-500 text-sm mt-1">{countryFlag} {countryLabel} · Select a project type to view or manage milestone amounts.</p>
        </div>

        {loadingTypes ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading project types…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectTypes.map(pt => (
              <div 
                  key={pt} 
                  onClick={() => setSelectedPt(pt)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow group"
              >
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors capitalize">{pt}</h3>
                      <Landmark className="w-5 h-5 text-blue-500" />
                  </div>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Configure Milestones
                  </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <button 
          onClick={() => setSelectedPt('')}
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project Types
      </button>

      <div className="space-y-6 max-w-5xl">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Gateway info banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Landmark className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-blue-800">Payment goes directly to your bank account</p>
                <p className="text-[11px] text-blue-600 mt-0.5">
                  When a customer completes a milestone payment, funds are routed directly to the bank account registered in your EPC profile's KYC section. No escrow — direct settlement.
                </p>
              </div>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
              </div>
            )}

            {/* Token section */}
            {tokenConfig.tokenType !== 'none' && (
              <div className="p-5 bg-yellow-50/50 border border-yellow-200 rounded-2xl">
                <h4 className="text-xs font-black text-yellow-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  🛡️ Sign-up Token Override
                </h4>
                {tokenConfig.tokenType === 'fixed' ? (
                  <p className="text-xs text-slate-700">
                    Platform fixed token: <strong>{currency}{(tokenConfig.fixedAmount || 0).toLocaleString()}</strong>. Customers pay this to lock booking.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-700">
                      Admin has given you scope to set your own booking token amount:
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-500">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        value={epcTokenAmount}
                        onChange={e => setEpcTokenAmount(Number(e.target.value))}
                        className="max-w-[180px] border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <span className="text-[10px] text-gray-400 italic">(Customer pays this to lock their slot)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Milestone Editors */}
            {loading ? (
              <div className="py-16 flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: Stage sliders */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-700">Milestone Stage Payments</h3>
                  <p className="text-[11px] text-gray-400">
                    Stages where <span className="font-bold text-indigo-600">EPC Can Customise</span> is enabled allow you to adjust the percentage within the admin's upper limit.
                  </p>

                  {stagesConfig.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center bg-slate-50 rounded-2xl border border-dashed">
                      No payment stages configured by admin for this project type.
                    </p>
                  ) : (
                    stagesConfig.map((stage, idx) => {
                      const isEditable = !!stage.epcCanEdit;
                      const value = customValues[stage.stageKey] !== undefined
                        ? customValues[stage.stageKey]
                        : stage.defaultValue;

                      return (
                        <div key={stage.stageKey || idx} className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">
                              {idx + 1}. {stage.label}
                            </span>
                            {isEditable ? (
                              <span className="text-[10px] font-black text-indigo-600">
                                Max: {stage.maxLimit}{stage.valueType === 'percentage' ? '%' : ''}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                Fixed by Platform
                              </span>
                            )}
                          </div>

                          {isEditable ? (
                            <div className="flex items-center gap-4">
                              {stage.valueType === 'percentage' ? (
                                <>
                                  <input
                                    type="range" min="0" max={stage.maxLimit}
                                    value={value}
                                    onChange={e => handleStageChange(stage.stageKey, e.target.value)}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                  />
                                  <div className="flex items-center border border-gray-200 rounded-xl px-2.5 py-1 bg-white shrink-0 w-20">
                                    <input
                                      type="number" min="0" max={stage.maxLimit}
                                      value={value}
                                      onChange={e => handleStageChange(stage.stageKey, e.target.value)}
                                      className="w-full text-center text-sm font-bold focus:outline-none"
                                    />
                                    <span className="text-sm font-bold text-gray-400">%</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 w-full">
                                  <span className="text-xs font-bold text-gray-400">{currency}</span>
                                  <input
                                    type="number" min="0" max={stage.maxLimit}
                                    value={value}
                                    onChange={e => handleStageChange(stage.stageKey, e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-1 text-sm font-bold bg-white focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm font-black text-gray-800 py-1">
                              {stage.valueType === 'percentage'
                                ? `${value}%`
                                : `${currency}${(value || 0).toLocaleString()}`}
                            </p>
                          )}

                          <p className="text-[10px] text-gray-400 italic">
                            Triggered after journey step: <strong>{stage.triggerStepId || 'Not set'}</strong>
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right: Summary */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-gray-700 flex items-center gap-1.5 mb-4">
                      <Landmark className="w-5 h-5 text-blue-600" /> Payment Allocation Summary
                    </h4>

                    {pctStages.length > 0 && (
                      <div className="h-4 w-full bg-gray-200 rounded-full flex overflow-hidden mb-5">
                        {pctStages.map((s, idx) => {
                          const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-violet-500'];
                          const val   = customValues[s.stageKey] !== undefined ? customValues[s.stageKey] : s.defaultValue;
                          const ratio = totalSum > 0 ? (val / totalSum) * 100 : 0;
                          return (
                            <div
                              key={s.stageKey}
                              className={`${colors[idx % colors.length]} h-full transition-all`}
                              style={{ width: `${ratio}%` }}
                              title={s.label}
                            />
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-3.5">
                      {stagesConfig.map((stage, idx) => {
                        const val     = customValues[stage.stageKey] !== undefined ? customValues[stage.stageKey] : stage.defaultValue;
                        const isPerc  = stage.valueType === 'percentage';
                        const shown   = isPerc ? `${val}%` : `${currency}${(val||0).toLocaleString()}`;
                        const estCash = isPerc ? Math.round(sampleCost * (val / 100)) : val;
                        const colors  = ['bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-violet-500'];
                        return (
                          <div key={stage.stageKey || idx} className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                              {stage.label}
                            </span>
                            <span className="font-bold text-gray-800">
                              {shown} ≈ {currency}{(estCash||0).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save footer */}
                  <div className="mt-6 border-t border-gray-200 pt-5 flex items-center justify-between">
                    {pctStages.length > 0 ? (
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Total</p>
                        <p className={`text-2xl font-black ${totalSum === 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {totalSum}%
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Fixed value config</div>
                    )}

                    <button
                      type="submit"
                      disabled={saving || (pctStages.length > 0 && totalSum !== 100)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Milestones
                    </button>
                  </div>
                </div>

              </div>
            )}

            <div className="text-[10.5px] text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
              Note: Cash estimates shown are based on a sample {epcCountry === 'australia' ? 'standard 6.6 kW system ($8,000 AUD)' : 'typical 3 kW solar project (₹1,50,000 INR)'}. Actual amounts will scale with the customer's quoted project cost.
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
