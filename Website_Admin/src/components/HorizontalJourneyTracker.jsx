import React, { useState } from "react";
import { Check, XCircle, Clock, Upload, Eye, FileText, X, AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";

export default function HorizontalJourneyTracker({ 
  steps, 
  userRole = "customer",
  onExecuteStep,
  onRequestReupload,
  qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SUNNOVATIVE_PAYMENT_AU",
  advanceAmount = 500
}) {
  const [selectedStep, setSelectedStep] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [reuploadReason, setReuploadReason] = useState("Uploaded document is not clear. Please re-upload.");
  const [showAdminAction, setShowAdminAction] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBDE = userRole === "bde";
  const isEPC = userRole === "epc";
  const isAdmin = userRole === "admin";

  const defaultSteps = [
    { stepId: 1, stepNumber: 1, title: 'Check Subsidy Eligibility', status: 'completed', assignedTo: 'company', description: 'Initial eligibility check completed for project.' },
    { stepId: 2, stepNumber: 2, title: 'Submit Electricity Bill', status: 'in-progress', assignedTo: 'customer', description: 'Upload latest electricity bill or auto-scan for kw suggestion.' },
    { stepId: 3, stepNumber: 3, title: 'Upload Property Details', status: 'pending', assignedTo: 'customer', description: 'Upload rooftop photo and verify property address.' },
    { stepId: 4, stepNumber: 4, title: 'Verify Customer Eligibility', status: 'pending', assignedTo: 'company', description: 'Admin verifies document authenticity.' },
    { stepId: 5, stepNumber: 5, title: 'Verify Documents', status: 'pending', assignedTo: 'company', description: 'Compliance team verifies identity proof.' },
    { stepId: 6, stepNumber: 6, title: 'Select Installation Date', status: 'pending', assignedTo: 'customer', description: 'Select preferred site survey & installation schedule.' },
    { stepId: 7, stepNumber: 7, title: 'Make Payment', status: 'pending', assignedTo: 'customer', description: 'Pay booking advance amount online.' },
    { stepId: 8, stepNumber: 8, title: 'Allocate EPC Partner', status: 'pending', assignedTo: 'company', description: 'Assign certified local EPC installer.' },
    { stepId: 9, stepNumber: 9, title: 'Accept Project', status: 'pending', assignedTo: 'epc-partner', description: 'EPC partner accepts project assignment.' },
    { stepId: 10, stepNumber: 10, title: 'Conduct Site Survey', status: 'pending', assignedTo: 'epc-partner', description: 'Technical site survey and shadow analysis.' },
    { stepId: 11, stepNumber: 11, title: 'Submit Proposal', status: 'pending', assignedTo: 'epc-partner', description: 'Final engineering proposal submission.' },
    { stepId: 12, stepNumber: 12, title: 'Install Solar System', status: 'pending', assignedTo: 'epc-partner', description: 'Mounting structure & solar panel installation.' },
    { stepId: 13, stepNumber: 13, title: 'Upload Installation Documents', status: 'pending', assignedTo: 'epc-partner', description: 'Upload commissioned site photos & test report.' },
    { stepId: 14, stepNumber: 14, title: 'Complete Net Meter Process', status: 'pending', assignedTo: 'company', description: 'Submit DISCOM / Grid net metering application.' },
    { stepId: 15, stepNumber: 15, title: 'Process Subsidy Application', status: 'pending', assignedTo: 'company', description: 'Claim STC certificate / PM Surya Ghar rebate.' },
    { stepId: 16, stepNumber: 16, title: 'Monitor Project Progress', status: 'pending', assignedTo: 'company', description: 'Final commissioning and online monitoring.' },
  ];

  const displaySteps = steps?.length > 0 ? steps : defaultSteps;

  const handleStepSubmit = async (step) => {
    if (onExecuteStep) {
      setSubmitting(true);
      await onExecuteStep(step.stepId || step._id, uploadFile, noteInput);
      setSubmitting(false);
      setSelectedStep(null);
    } else {
      alert(`Step "${step.title}" completed successfully${isBDE ? ' on behalf of customer' : ''}!`);
      setSelectedStep(null);
    }
  };

  const handleAdminReuploadRequest = async (step) => {
    if (onRequestReupload) {
      await onRequestReupload(step.stepId || step._id, reuploadReason);
    } else {
      alert(`Admin notice sent for step "${step.title}": ${reuploadReason}`);
    }
    setSelectedStep(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* ── 1. ULTRA-THIN TOP HORIZONTAL LINE TRACKER ── */}
      <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shadow-inner overflow-x-auto scrollbar-hide">
        <div className="min-w-[850px] flex items-start justify-between relative px-2">
          {/* Connecting track line */}
          <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-200 -z-10" />

          {displaySteps.map((step, i) => {
            const done = step.status === "completed";
            const active = step.status === "in-progress";
            const reallyActive = active || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));

            return (
              <div 
                key={i} 
                onClick={() => setSelectedStep(step)}
                className="flex flex-col items-center flex-1 relative group cursor-pointer"
              >
                {/* Colored track segment */}
                {i > 0 && (done || reallyActive) && (
                  <div className={`absolute right-[50%] left-[-50%] top-3.5 h-0.5 -z-10 transition-all ${done ? 'bg-orange-500' : 'bg-amber-400'}`} />
                )}

                {/* Circle Button */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-white mb-1 transition-all ${
                  done ? "bg-orange-500 text-white shadow-sm" : 
                  reallyActive ? "bg-amber-400 text-white shadow-md ring-amber-100 animate-pulse" : 
                  "bg-slate-200 text-slate-500"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : (step.stepNumber || i + 1)}
                </div>

                {/* Step Title (Compact) */}
                <p className={`text-[10px] text-center font-bold px-1 line-clamp-1 max-w-[90px] ${
                  done ? "text-slate-800" : 
                  reallyActive ? "text-amber-700 font-extrabold" : 
                  "text-slate-400"
                }`}>
                  {step.title}
                </p>

                {/* Role Badge */}
                <span className={`text-[8px] font-black mt-0.5 px-1 py-0.5 rounded ${
                  step.assignedTo === "customer" ? "bg-blue-100 text-blue-700" :
                  step.assignedTo === "epc-partner" ? "bg-purple-100 text-purple-700" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {step.assignedTo === "customer" ? "Customer" : step.assignedTo === "epc-partner" ? "EPC" : "Us"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. 4-COLUMN STEP CARDS GRID (EXACT SCREENSHOT LAYOUT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displaySteps.map((step, idx) => {
          const done = step.status === "completed";
          const active = step.status === "in-progress" || (step.status === "pending" && (idx === 0 || displaySteps[idx-1]?.status === "completed"));

          return (
            <div
              key={idx}
              onClick={() => setSelectedStep(step)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[76px] shadow-sm hover:shadow-md ${
                done 
                  ? "bg-emerald-50/60 border-emerald-300 hover:border-emerald-400" 
                  : active
                  ? "bg-amber-50/40 border-amber-300 hover:border-amber-400"
                  : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {done ? (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  ) : active ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold line-clamp-1 ${done ? "text-slate-800" : active ? "text-amber-900 font-extrabold" : "text-slate-600"}`}>
                    {step.title}
                  </h4>
                  {done ? (
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">✓ Done</p>
                  ) : (
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
                      {step.assignedTo === "customer" ? "PENDING CUSTOMER" : step.assignedTo === "epc-partner" ? "PENDING EPC" : "PENDING COMPANY"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. STEP DETAIL & ON-BEHALF EXECUTION MODAL ── */}
      {selectedStep && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {selectedStep.stepNumber || selectedStep.stepId}
                  </span>
                  <h3 className="font-black text-lg text-slate-800">{selectedStep.title}</h3>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  selectedStep.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedStep.status} • Assigned to: {selectedStep.assignedTo || 'Company'}
                </span>
              </div>
              <button onClick={() => setSelectedStep(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedStep.description || "Perform necessary actions for this step."}
            </p>

            {/* Payment & QR Code Section (If step is Make Payment) */}
            {(selectedStep.title?.toLowerCase().includes("payment") || selectedStep.stepId === 7 || selectedStep.stepId === "step_7") && (
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-2xl border border-blue-200 text-center space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600 uppercase">Booking Advance Payment</span>
                  <span className="font-black text-blue-700 text-base">${advanceAmount} AUD</span>
                </div>
                <div className="bg-white p-3 rounded-xl inline-block border border-blue-100 shadow-sm">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-32 h-32 mx-auto rounded-lg" />
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Scan &amp; Pay via Banking App</p>
                </div>
              </div>
            )}

            {/* BDE On-Behalf Banner */}
            {isBDE && selectedStep.assignedTo === 'customer' && selectedStep.status !== 'completed' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-amber-900">BDE Action Mode (On-Behalf of Customer)</p>
                  <p className="text-amber-700 text-[11px] mt-0.5">If customer is unable to complete this step online, you can upload documents or confirm details on their behalf.</p>
                </div>
              </div>
            )}

            {/* Completed Evidence View */}
            {selectedStep.status === 'completed' && (
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <p className="font-bold text-emerald-900">✓ Step Completed</p>
                {selectedStep.evidenceUrl && (
                  <a href={selectedStep.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline">
                    <FileText className="w-4 h-4" /> View Uploaded Document / Evidence
                  </a>
                )}
                {selectedStep.evidenceNote && (
                  <p className="text-slate-600 italic">"{selectedStep.evidenceNote}"</p>
                )}
              </div>
            )}

            {/* Action Form (For incomplete steps) */}
            {selectedStep.status !== 'completed' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isBDE && selectedStep.assignedTo === 'customer' ? "Upload File (On-Behalf of Customer)" : "Upload Attachment / Document"}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Action Summary</label>
                  <textarea
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={isBDE ? "Customer verbally confirmed / BDE uploaded bill..." : "Enter completion details..."}
                    className="w-full border rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button onClick={() => setSelectedStep(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleStepSubmit(selectedStep)}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
                  >
                    {submitting ? "Submitting..." : isBDE ? "Submit & Complete (On Behalf)" : "Mark Complete"}
                  </button>
                </div>
              </div>
            )}

            {/* ── ADMIN SUPER-POWERS SECTION ── */}
            {isAdmin && (
              <div className="border-t border-slate-200 pt-4 mt-2 bg-slate-50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-600" /> Admin Controls &amp; Re-upload Request
                  </span>
                  <button 
                    onClick={() => setShowAdminAction(!showAdminAction)}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    {showAdminAction ? "Hide Controls" : "Request Re-upload / Add Notice"}
                  </button>
                </div>

                {showAdminAction && (
                  <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Re-upload / Revision Notice</label>
                      <input
                        type="text"
                        value={reuploadReason}
                        onChange={(e) => setReuploadReason(e.target.value)}
                        className="w-full border rounded-lg p-2 text-xs bg-slate-50"
                      />
                    </div>
                    <button
                      onClick={() => handleAdminReuploadRequest(selectedStep)}
                      className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Send Re-upload Notice to Customer / EPC
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

