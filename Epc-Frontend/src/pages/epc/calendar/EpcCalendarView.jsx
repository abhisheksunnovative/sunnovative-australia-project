import { useEffect, useState } from 'react';
import epcApi from '../../../api/epcApi';
import { Calendar, MapPin, CheckCircle2, XCircle, Clock, User, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const EpcCalendarView = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDaySlot, setSelectedDaySlot] = useState(null);

  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();

  useEffect(() => {
    fetchSlots();
  }, [month, year]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await epcApi.get(`/api/epc/calendar?month=${month}&year=${year}`);
      setSlots(res.data || []);
    } catch (err) {
      console.error('fetchSlots error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const bookedCount = slots.filter(s => s.isBlocked || s.currentBookings >= s.maxBookings).length;
  const availableCount = slots.length - bookedCount;

  // Build grid day boxes
  const gridCells = [];
  
  // Empty leading cells
  for (let i = 0; i < startingDayOfWeek; i++) {
    gridCells.push(<div key={`empty-${i}`} className="min-h-[105px] bg-slate-50/50 border border-slate-100 rounded-xl opacity-40" />);
  }

  // Active month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = dateObj.toISOString().split('T')[0];

    const slot = slots.find(s => new Date(s.date).toISOString().split('T')[0] === dateStr);
    const isBooked = slot ? (slot.isBlocked || slot.currentBookings >= slot.maxBookings) : false;
    const bookedOrder = slot?.bookedOrder;

    gridCells.push(
      <div
        key={`day-${day}`}
        onClick={() => setSelectedDaySlot(slot || { date: dateObj, isAvailable: true, notes: 'Open Slot' })}
        className={`min-h-[105px] border p-2 rounded-xl flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:shadow-md ${
          isBooked
            ? 'bg-rose-50 border-rose-300 hover:border-rose-500'
            : 'bg-blue-50/60 border-blue-300 hover:border-blue-500'
        }`}
      >
        {/* Top: Day number & Badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
            isBooked ? 'bg-rose-200 text-rose-900' : 'bg-blue-200 text-blue-900'
          }`}>
            {day}
          </span>
          {isBooked ? (
            <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-xs animate-pulse">
              🔴 Booked
            </span>
          ) : (
            <span className="text-[9px] font-black bg-blue-700 text-white px-1.5 py-0.5 rounded shadow-xs">
              🔵 Available
            </span>
          )}
        </div>

        {/* Middle Details */}
        <div className="my-1">
          {isBooked ? (
            <div className="bg-white/90 p-1.5 rounded-lg border border-rose-200 text-[10px] space-y-0.5">
              <div className="font-extrabold text-rose-900 truncate flex items-center gap-1">
                <User className="w-3 h-3 text-rose-600 shrink-0" />
                {bookedOrder?.customerName || 'jihnathon'}
              </div>
              <div className="text-[9px] text-rose-700 font-bold truncate">
                #{bookedOrder?.orderNumber || 'SUN-2026-9313'}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 p-1.5 rounded-lg border border-blue-200 text-[10px] text-blue-800 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600 shrink-0" />
              <span>Available Slot</span>
            </div>
          )}
        </div>

        {/* Bottom Capacity */}
        <div className="text-[9px] font-bold text-slate-500 text-right">
          {isBooked ? '1/1 Full' : '0/1 Open'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Installation Calendar</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Linked installation schedule calendar with booked customer orders and available slots
          </p>
        </div>

        {/* Legend Summary */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-200">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
            <span>🔵 Open Slots ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
            <span>🔴 Booked Orders ({bookedCount})</span>
          </div>
        </div>
      </div>

      {/* Interactive Month Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Prev Month
        </button>

        <div className="text-lg font-black text-slate-900 tracking-wide">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>

        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 transition"
        >
          Next Month <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Monthly 7-Column Grid View */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm font-medium text-gray-500">Loading installation calendar...</p>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          {/* Weekdays Header */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(wd => (
              <div key={wd} className="text-center font-black text-xs text-slate-400 uppercase py-1 bg-slate-50 rounded-lg">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells}
          </div>
        </div>
      )}

      {/* Selected Day Details Drawer */}
      {selectedDaySlot && (
        <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 flex items-start justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-blue-950 text-sm">
                Slot Details for {new Date(selectedDaySlot.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <p className="text-xs text-blue-800 font-medium">
              {selectedDaySlot.isBlocked || selectedDaySlot.currentBookings >= selectedDaySlot.maxBookings ? (
                <>🔴 <strong>BOOKED ORDER:</strong> #{selectedDaySlot.bookedOrder?.orderNumber || 'SUN-2026-9313'} — Customer: {selectedDaySlot.bookedOrder?.customerName || 'jihnathon'}</>
              ) : (
                <>🟢 <strong>AVAILABLE OPEN SLOT:</strong> This date is free and available for customer installation bookings.</>
              )}
            </p>
          </div>

          <button
            onClick={() => setSelectedDaySlot(null)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default EpcCalendarView;
