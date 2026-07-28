import React, { useState } from "react";

const EpcOrdersCalendar = ({ orders }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(currentYear, currentMonth, i).toDateString();
      const dayOrders = orders.filter((o) => {
        if (!o.dueDateForCompletion) return false;
        return new Date(o.dueDateForCompletion).toDateString() === dateStr;
      });

      const hasOverdue = dayOrders.some(o => o.isOverdue);
      
      cells.push(
        <div key={i} className={`relative p-2 border min-h-[80px] text-xs flex flex-col rounded-lg transition-all ${
          hasOverdue ? "bg-red-50/80 border-red-300 shadow-inner overflow-hidden" : "bg-white border-gray-100 hover:border-blue-200"
        }`}>
          {hasOverdue && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>}
          <span className={`font-semibold mb-1.5 ${hasOverdue ? "text-red-600" : "text-gray-400"}`}>{i}</span>
          <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
            {dayOrders.map(o => (
              <div key={o._id} className={`px-2 py-1.5 rounded-md truncate font-medium text-[10px] ${
                o.isOverdue 
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm animate-pulse" 
                  : "bg-gradient-to-r from-slate-50 to-blue-50 text-blue-700 border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              }`}>
                #{o.orderNumber}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-6 mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-gray-800 text-lg">Installation Calendar</h3>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm">
           <button onClick={handlePrevMonth} className="px-3 py-1.5 bg-white text-gray-600 font-medium rounded-lg hover:text-blue-600 hover:shadow-sm transition-all text-xs">Prev</button>
           <span className="font-bold text-gray-700 px-3 text-sm min-w-[120px] text-center">
             {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}
           </span>
           <button onClick={handleNextMonth} className="px-3 py-1.5 bg-white text-gray-600 font-medium rounded-lg hover:text-blue-600 hover:shadow-sm transition-all text-xs">Next</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
           <div key={d} className="text-center font-bold text-gray-400 text-xs py-2 uppercase tracking-wider">{d}</div>
        ))}
        {renderCells()}
      </div>
    </div>
  );
};

export default EpcOrdersCalendar;
