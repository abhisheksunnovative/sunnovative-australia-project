import React from "react";
import { LayoutDashboard, Users, Map, LogOut, Sun, ClipboardList, AlertTriangle } from "lucide-react";

export default function BDELayout({ children, currentTab, onTabChange, onLogout, bdeName }) {
  const navItems = [
    { id: "bde-aust", name: "Australian BDE Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    { id: "bde-leads", name: "My Leads", icon: <Users className="w-5 h-5" /> },
    { id: "bde-projects", name: "My Projects", icon: <ClipboardList className="w-5 h-5" /> },
    { id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 mt-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mr-3 shadow-inner border border-amber-500/30">
            <Sun className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">BDE Portal</h2>
            <p className="text-[10px] uppercase tracking-wider text-amber-500/80 font-bold mt-1">Sunnovative</p>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/10 mb-4 bg-slate-800/50">
          <p className="text-xs text-slate-400 font-medium">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{bdeName || "BDE Agent"}</p>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                currentTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 backdrop-blur-md bg-white/80">
          <h1 className="text-xl font-bold text-gray-800">
            {navItems.find(i => i.id === currentTab)?.name || "Dashboard"}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}
