import React from 'react';
import { Search, X, Calendar } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../../utils/geography';

export const MasterFilterBar = ({
  search, setSearch, hideSearch = false,
  statusFilter, setStatusFilter, statusOptions = [],
  countryFilter, setCountryFilter,
  dateRange, setDateRange,
  onClear,
  extraFilters
}) => {
  const hasActiveFilters = Boolean(search || statusFilter || countryFilter || (dateRange && (dateRange.start || dateRange.end)) || (extraFilters && extraFilters.some(f => f.isActive)));

  return (
    <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      {/* Search */}
      {!hideSearch && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Global search..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium" 
          />
        </div>
      )}

      {/* Status */}
      {statusOptions.length > 0 && (
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
        >
          <option value="">Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {/* Country */}
      {setCountryFilter && (
        <select 
          value={countryFilter} 
          onChange={e => setCountryFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
        >
          <option value="">Country</option>
          {SUPPORTED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      )}

      {/* Custom Filters (e.g. state, district, type) */}
      {extraFilters && extraFilters.map((Filter, i) => (
        <React.Fragment key={i}>
          {Filter.component}
        </React.Fragment>
      ))}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button 
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      )}
    </div>
  );
};
