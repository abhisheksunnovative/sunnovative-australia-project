import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";

const ScanInsightDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Adjust the API URL according to your setup
                const { data } = await axios.get("http://localhost:5000/api/light-bill/analytics");
                if (data.success) {
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch scan analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading AI Insights...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load insights.</div>;

    // Process data
    let inHouseSuccess = 0;
    let geminiFallback = 0;
    let inHouseFailed = 0;
    let totalCost = 0;

    stats.stats.forEach(s => {
        if (s._id === 'in-house') inHouseSuccess += s.count;
        if (s._id === 'gemini-fallback') {
            geminiFallback += s.count;
            totalCost += s.totalCost;
        }
        if (s._id === 'in-house-failed') inHouseFailed += s.count;
    });

    const totalScans = stats.totalScans || 1; // avoid div by zero
    const inHouseRatio = Math.round((inHouseSuccess / totalScans) * 100);
    const fallbackRatio = Math.round((geminiFallback / totalScans) * 100);
    const failRatio = Math.round((inHouseFailed / totalScans) * 100);

    const projectedCostWithoutInHouse = (totalScans * 0.0025).toFixed(4); // assuming $0.0025 per scan if all went to Gemini
    const costSaved = (projectedCostWithoutInHouse - totalCost).toFixed(4);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-5xl mx-auto my-8 font-sans">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChart3 className="w-6 h-6" /></div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">AI Hybrid Extraction Insights</h2>
                    <p className="text-xs text-slate-500">Real-time performance of the Zero-Cost In-House OCR vs Gemini API</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">In-House Success</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-emerald-800">{inHouseSuccess} Bills</span>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">Zero Cost Operation ({inHouseRatio}%)</p>
                </div>

                <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Gemini Fallback</span>
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-2xl font-black text-orange-800">{geminiFallback} Bills</span>
                    <p className="text-[10px] text-orange-600 font-medium mt-1">AI Assited Rescues ({fallbackRatio}%)</p>
                </div>

                <div className="p-4 rounded-xl border border-red-100 bg-red-50/50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Failed / AU Bugs</span>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-2xl font-black text-red-800">{inHouseFailed} Bills</span>
                    <p className="text-[10px] text-red-600 font-medium mt-1">Routed to manual review ({failRatio}%)</p>
                </div>

                <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Est. Cost Saved</span>
                        <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-2xl font-black text-blue-800">${costSaved}</span>
                    <p className="text-[10px] text-blue-600 font-medium mt-1">vs 100% Gemini usage</p>
                </div>
            </div>

            {/* Fallback Reasons */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">Most Common Fallback Reasons</h3>
                {stats.reasons.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">No fallbacks logged yet.</div>
                ) : (
                    <div className="space-y-3">
                        {stats.reasons.map((r, i) => {
                            const percentage = Math.round((r.count / (geminiFallback + inHouseFailed || 1)) * 100);
                            return (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-48 text-xs font-medium text-slate-600 truncate" title={r._id}>{r._id}</span>
                                    <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <span className="w-12 text-xs font-bold text-slate-700 text-right">{r.count}x</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>Total Bills Scanned: {totalScans}</span>
                <span>Hybrid Engine Active</span>
            </div>
        </div>
    );
};

export default ScanInsightDashboard;
