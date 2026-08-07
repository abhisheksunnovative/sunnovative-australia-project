import React, { useState } from 'react';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import { Navigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Info } from 'lucide-react';

const INCENTIVES_DB = {
  VIC: [
    { name: 'Solar Panel Rebate', desc: 'Up to $1,400 plus the option of an interest-free loan.', maxAmount: 1400 },
    { name: 'Solar Battery Loan', desc: 'Interest-free loan up to $8,800 for solar battery systems.', maxAmount: 8800 },
  ],
  NSW: [
    { name: 'Empowering Homes', desc: 'Interest-free loans for solar battery systems (up to $14,000).', maxAmount: 14000 },
    { name: 'Energy Savings Scheme (ESS)', desc: 'Financial incentives for installing energy efficient equipment.', maxAmount: 0 },
  ],
  QLD: [
    { name: 'Battery Booster Program', desc: 'Rebate of up to $4,000 for eligible households to buy a battery.', maxAmount: 4000 },
  ],
  SA: [
    { name: 'Home Battery Scheme', desc: 'Has now closed, but VPP offers still provide significant subsidies.', maxAmount: 0 },
  ],
  ACT: [
    { name: 'Sustainable Household Scheme', desc: 'Zero-interest loans up to $15,000 for energy-efficient upgrades.', maxAmount: 15000 },
  ],
  WA: [
    { name: 'Distributed Energy Buyback', desc: 'Time-of-export payments for solar energy sent to the grid.', maxAmount: 0 },
  ],
  TAS: [
    { name: 'Energy Saver Loan Scheme', desc: 'Interest-free loans up to $10,000 for energy efficiency products.', maxAmount: 10000 },
  ],
  NT: [
    { name: 'Home and Business Battery Scheme', desc: 'Grant of $400 per kWh of usable battery system capacity, up to $5,000.', maxAmount: 5000 },
  ],
};

const EpcIncentiveChecker = () => {
  const { epc } = useEpcAuth();
  const [selectedState, setSelectedState] = useState('');

  if (epc?.country !== 'australia') {
    return <Navigate to="/epc/dashboard" />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-6">
        <h2 className="text-white text-2xl font-black tracking-tight">State Incentive Checker</h2>
        <p className="text-slate-400 text-sm mt-1">Look up additional state-level rebates beyond the federal STC program.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-4 items-center border-b border-gray-100 pb-6 mb-6">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-800 font-bold mb-2">Select State/Territory</label>
            <select 
              value={selectedState} 
              onChange={e => setSelectedState(e.target.value)}
              className="w-full md:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="">-- Choose a state --</option>
              {Object.keys(INCENTIVES_DB).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedState ? (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-800 mb-4">Available Programs in {selectedState}</h3>
            {INCENTIVES_DB[selectedState].length === 0 ? (
              <p className="text-gray-500 italic">No major state-specific programs found currently.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {INCENTIVES_DB[selectedState].map((prog, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{prog.name}</h4>
                      {prog.maxAmount > 0 && (
                        <span className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-bold border border-green-200">
                          <DollarSign className="w-3 h-3 mr-0.5" />
                          Up to ${prog.maxAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{prog.desc}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> These are state-level incentives. They are in addition to the federal Small-scale Renewable Energy Scheme (SRES) which provides STCs for all states. STCs are typically applied as an upfront discount at the point of sale.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center">
            <Search className="w-12 h-12 mb-3 opacity-20" />
            <p>Select a state above to view incentives</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpcIncentiveChecker;
