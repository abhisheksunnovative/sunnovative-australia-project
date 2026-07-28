import { useEffect, useState } from 'react';
import epcApi from '../../../api/epcApi';
import { Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';

const EpcCalendarView = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await epcApi.get('/api/epc/calendar');
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Installation Calendar</h1>
        <p className="text-gray-500">View and manage your pre-booked installation slots</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {slots.length === 0 ? (
            <div className="col-span-full py-10 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
              No calendar slots found. Please contact Admin to generate slots for your active districts.
            </div>
          ) : (
            slots.map((slot) => {
              const dateObj = new Date(slot.date);
              const isFull = slot.isBlocked || slot.currentBookings >= slot.maxBookings;
              
              return (
                <div 
                  key={slot._id} 
                  className={`relative p-5 rounded-xl border-2 transition-all ${
                    isFull 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center justify-center bg-white w-14 h-14 rounded-lg shadow-sm border border-gray-100 flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase">{dateObj.toLocaleDateString('en-GB', { month: 'short' })}</span>
                      <span className="text-xl font-black text-gray-900">{dateObj.getDate()}</span>
                    </div>
                    {isFull ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" /> Booked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle className="w-3 h-3" /> Free
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-gray-900 capitalize">{slot.projectType}</div>
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {slot.district}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">Available Capacity:</span>
                    <span className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                      {slot.currentBookings} / {slot.maxBookings}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default EpcCalendarView;
