const fs = require('fs');
let text = fs.readFileSync('Website_Frontend/src/customer/CustomerPortal.jsx', 'utf-8');

const popupUI = `
      {/* Overdue Installation Date Popup */}
      {overdueProject && (
        <div className="fixed inset-0 bg-slate-900/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border-t-8 border-red-500 relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl"></div>
            
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-5 relative z-10 animate-pulse" />
            <h2 className="text-2xl font-black text-slate-800 mb-3 relative z-10">Action Required!</h2>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 relative z-10">
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Your installation date selection is overdue by <strong className="text-red-600 font-black">{(Math.ceil(Math.abs(new Date() - new Date(overdueProject.createdAt)) / (1000 * 60 * 60 * 24)) - slaDays)} days</strong>. 
                Please select your preferred installation date immediately to keep your project active, otherwise you can cancel your order.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
              <button 
                onClick={() => {
                   setProjectView("detail");
                   setSelectedProjectId(overdueProject._id);
                   setTab("new-project"); // Assuming they need to fill the form
                }} 
                className="w-full py-3.5 bg-yellow-400 text-yellow-900 font-black rounded-xl hover:bg-amber-400 transition shadow-sm"
              >
                Select Installation Date
              </button>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                    handleCancelOverdueProject(overdueProject._id);
                  }
                }} 
                className="w-full py-3.5 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-50 transition"
              >
                Cancel My Order
              </button>
            </div>
          </div>
        </div>
      )}
`;

const idx = text.indexOf('<ToastContainer position="top-right" autoClose={3000} />');
text = text.slice(0, idx) + popupUI + '\n      ' + text.slice(idx);

fs.writeFileSync('Website_Frontend/src/customer/CustomerPortal.jsx', text);
