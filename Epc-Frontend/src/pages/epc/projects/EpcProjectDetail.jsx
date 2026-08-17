/* eslint-disable */
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, XCircle, AlertCircle, FileText } from 'lucide-react';
import epcApi from '../../../api/epcApi';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import GSTInvoice from "../../../components/epc/GSTInvoice";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

// ── Shared Horizontal Tracker ──────────────────────────────────────────────────
// ── Shared Horizontal Tracker ──────────────────────────────────────────────────
function HorizontalJourneyTracker({ steps }) {
  const displaySteps = steps?.length > 0 ? steps : [];

  if (displaySteps.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No journey steps initialized for this project.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="min-w-[700px] flex items-start justify-between relative mt-4 px-4">
        <div className="absolute left-10 right-10 top-5 h-1 bg-gray-200 -z-10" />
        
        {displaySteps.map((step, i) => {
          const done = step.status === "completed";
          const isAwaitingApproval = step.status === "awaiting-approval";
          const reallyActive = step.status === "in-progress" || isAwaitingApproval || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));
          const blocked = step.status === "blocked";
          const isEpcTurn = reallyActive && step.assignedTo === "epc-partner";
          
          return (
            <div key={step.stepId || i} className="flex flex-col items-center flex-1 relative group cursor-default">
              {i > 0 && (done || reallyActive) && (
                <div className={`absolute right-[50%] left-[-50%] top-5 h-1 -z-10 transition-all ${done ? 'bg-green-500' : isAwaitingApproval ? 'bg-yellow-400' : 'bg-blue-400'}`} />
              )}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-4 ring-white mb-2 transition-all ${
                done ? "bg-green-500 text-white shadow-md" : 
                isAwaitingApproval ? "bg-yellow-400 text-yellow-950 shadow-md ring-yellow-200 animate-pulse" :
                isEpcTurn ? "bg-orange-500 text-white shadow-md ring-orange-200 animate-bounce" :
                reallyActive ? "bg-blue-500 text-white shadow-md ring-blue-100" : 
                blocked ? "bg-red-500 text-white shadow-md" : 
                "bg-gray-200 text-gray-400"
              }`}>
                {done ? <Check className="w-5 h-5" /> : 
                 blocked ? <XCircle className="w-5 h-5" /> : 
                 <span>{step.stepNumber || (i+1)}</span>}
              </div>
              
              <p className={`text-xs text-center font-bold px-1 max-w-[110px] ${
                done ? "text-gray-800" : 
                isEpcTurn ? "text-orange-600 font-extrabold" :
                reallyActive ? "text-blue-700" : 
                "text-gray-400"
              }`}>
                {step.title}
              </p>

              {isEpcTurn && (
                <span className="text-[9px] font-black mt-1 px-2 py-0.5 rounded-full bg-orange-500 text-white animate-pulse shadow-sm">
                  🎯 YOUR TURN
                </span>
              )}

              {step.assignedTo && !isEpcTurn && (
                <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                  step.assignedTo === "epc-partner" ? "bg-orange-100 text-orange-700" :
                  step.assignedTo === "customer" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {step.assignedTo === "epc-partner" ? "⚡ EPC" : step.assignedTo === "customer" ? "👤 Customer" : "🏢 Admin"}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}

const SectionCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <h3 className="text-gray-700 text-sm font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const EpcProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { epc } = useEpcAuth();
  const [project, setProject]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]               = useState({ text: '', type: '' });
  const [showInvoice, setShowInvoice] = useState(false);

  // Completion states
  const [uploadFile, setUploadFile] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [actionInputs, setActionInputs] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();

  const load = async () => {
    try {
      const { data } = await epcApi.get(`/api/epc/projects/${id}`);
      setProject(data);
    } catch (err) {
      console.error('Project detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load();
    const interval = setInterval(() => load(), 8000);
    return () => clearInterval(interval);
  }, [id]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const activeEpcStep = project?.steps?.find(s => 
    s.assignedTo === 'epc-partner' && (s.status === 'pending' || s.status === 'in-progress')
  );

  // Auto-scroll to active step on load
  useEffect(() => {
    if (activeEpcStep) {
      setTimeout(() => {
        const el = document.getElementById(`step-${activeEpcStep.stepId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500); // short delay to ensure rendering
    }
  }, [activeEpcStep?.stepId]);

  const handleFileChange = async (stepId, slotLabel, file) => {
    if (!file) return;
    setActionInputs(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [`${slotLabel}_uploading`]: true
      }
    }));

    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await epcApi.post('/api/upload-file', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setActionInputs(prev => ({
          ...prev,
          [stepId]: {
            ...(prev[stepId] || {}),
            [slotLabel]: data.fileUrl,
            [`${slotLabel}_uploading`]: false
          }
        }));
      } else {
        alert(data.message || "File upload failed");
        setActionInputs(prev => ({
          ...prev,
          [stepId]: {
            ...(prev[stepId] || {}),
            [`${slotLabel}_uploading`]: false
          }
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
      setActionInputs(prev => ({
        ...prev,
        [stepId]: {
          ...(prev[stepId] || {}),
          [`${slotLabel}_uploading`]: false
        }
      }));
    }
  };

  const handleTextChange = (stepId, slotLabel, val) => {
    setActionInputs(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [slotLabel]: val
      }
    }));
  };

  const completeStep = async (stepId) => {
    if (!window.confirm(`Mark this step as complete?`)) return;
    setStageLoading(true);
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append('stepId', stepId);
      if (evidenceNote) fd.append('note', evidenceNote);
      if (uploadFile) fd.append('evidence', uploadFile);

      const step = project.steps.find(s => s.stepId === stepId);
      const reqActions = step?.requiredActions || [];
      const uploadedActions = [];

      for (const act of reqActions) {
        const val = actionInputs[stepId]?.[act.label] || "";
        if (act.required !== false && !val) {
          setErrorMsg(`Please fill/upload required field: ${act.label}`);
          setStageLoading(false);
          return;
        }
        uploadedActions.push({
          label: act.label,
          fileType: act.fileType,
          value: val
        });
      }

      if (uploadedActions.length > 0) {
        fd.append("uploadedActions", JSON.stringify(uploadedActions));
      }

      const { data } = await epcApi.post(`/api/epc/projects/${id}/complete-step`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showMsg('Step completed successfully!');
      setUploadFile(null);
      setEvidenceNote("");
      if (fileRef.current) fileRef.current.value = '';
      setProject(data.project);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Step update failed', 'error');
    } finally {
      setStageLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Project not found</p>
      <button onClick={() => navigate('/epc/projects')} className="mt-3 text-blue-600 text-sm hover:underline">
        ← Back to Projects
      </button>
    </div>
  );

  // removed duplicate activeEpcStep



  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/epc/projects')}
          className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-gray-800 text-xl font-bold">{project.customerName}</h2>
          <p className="text-gray-400 text-xs font-mono">#{project.orderNumber} • {project.projectTypeLabel || project.projectType}</p>
        </div>
        
        {project.status === 'completed' && epc?.country === 'australia' && (
          <button onClick={() => setShowInvoice(true)} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition">
            <FileText className="w-4 h-4" />
            Tax Invoice
          </button>
        )}
        
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
          {project.completionPercentage || 0}% Complete
        </span>
      </div>

      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowInvoice(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 p-2 print:hidden">
              <XCircle className="w-6 h-6" />
            </button>
            <GSTInvoice project={project} epc={epc} />
          </div>
        </div>
      )}

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* 🎯 YOUR TURN BANNER (When current active step is assigned to EPC) */}
      {activeEpcStep && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
              🎯
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">YOUR TURN</p>
              <p className="text-xs text-orange-100 font-medium mt-0.5">You have to complete this step to continue your journey</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById(`step-${activeEpcStep.stepId}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="px-4 py-2 bg-white text-orange-900 rounded-xl font-extrabold text-xs hover:bg-orange-100 transition shadow-sm shrink-0"
          >
            Execute Step Now →
          </button>
        </div>
      )}

      {/* Horizontal Journey Tracker */}
      <SectionCard title="Live Journey Tracking Engine">
        <HorizontalJourneyTracker steps={project.steps} />
      </SectionCard>

      {/* Dynamic Project Steps */}
      <SectionCard title="Project Journey Tasks">
        <div className="space-y-4">
          {project.steps?.filter(s => s.visibleToEpc === true).length > 0 ? project.steps.filter(s => s.visibleToEpc === true).map((step, i) => {
            const isEPC = step.assignedTo === 'epc-partner';
            const isActive = step.status === 'pending' || step.status === 'in-progress';
            const isCompleted = step.status === 'completed';
            const isAwaitingApproval = step.status === 'awaiting-approval';
            
            return (
              <div id={`step-${step.stepId}`} key={step.stepId} className={`p-4 rounded-xl border ${isCompleted ? 'bg-green-50/50 border-green-100' : isAwaitingApproval ? 'bg-yellow-50 border-yellow-200' : isActive && isEPC ? 'bg-orange-50/60 border-orange-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${isCompleted ? 'text-green-700' : isEPC && isActive ? 'text-orange-950 font-black' : 'text-gray-800'}`}>
                        {step.stepNumber || (i + 1)}. {step.title}
                      </h4>
                      {isActive && isEPC && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-orange-500 text-white">
                          🎯 YOUR TURN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Assigned to: <strong className="capitalize">{step.assignedTo}</strong></p>
                    {step.description && <p className="text-xs text-gray-600 mt-1">{step.description}</p>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isCompleted ? 'bg-green-100 text-green-700' : isAwaitingApproval ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>
                    {isAwaitingApproval ? "⏳ Admin Approval Pending" : step.status}
                  </span>
                </div>

                {step.adminNote && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                    📌 <strong>Admin Note:</strong> {step.adminNote}
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-2 border-t border-green-100 pt-2">
                    <span>Completed at: {new Date(step.completedAt).toLocaleDateString()} by {step.completedBy || "EPC"}</span>
                    {step.evidenceUrl && <a href={step.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">View Evidence</a>}
                  </div>
                )}

                {((isCompleted || isAwaitingApproval) && step.uploadedActions && step.uploadedActions.length > 0) && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 mt-2 text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Completed Action Fields / Uploads</p>
                    {step.uploadedActions.map((act, actIdx) => (
                      <div key={actIdx} className="flex justify-between items-center text-xs border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-semibold text-gray-600">{act.label}:</span>
                        {act.fileType === "text" ? (
                          <span className="text-gray-800 font-medium">{act.value || "—"}</span>
                        ) : (
                          act.value ? (
                            <a href={`${API_BASE}${act.value}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-bold">
                              <span>📂</span> View {act.label}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No file uploaded</span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                 {isActive && isEPC && (() => {
                   const origIdx = project.steps.findIndex(s => s.stepId === step.stepId);
                   const previousStepsCompleted = project.steps.slice(0, origIdx).every(s => s.status === "completed" || s.status === "skipped");
                   return (
                     <div className="mt-4 pt-4 border-t border-orange-200 text-left">
                       <p className="text-xs font-semibold text-orange-900 mb-2">{step.pendingActionAlert || `Complete ${step.title}`}</p>
                       {!previousStepsCompleted ? (
                         <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-750 flex items-start gap-2">
                           <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                           Pehle isse pichle saare steps complete hone chahiye. / Please complete all previous steps first.
                         </div>
                       ) : (
                           <div className="space-y-4">
                             {(step.stepNumber === 4 || step.title?.includes("System Design")) && (
                               <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-3 space-y-2">
                                 <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                                   <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                   Clean Energy Council (CEC) Compliance Warning
                                 </div>
                                 <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                                   Attention EPC Installer: Australian federal law requires all solar equipment specified in your system design layout (Step 4) to be Clean Energy Council (CEC) Approved to qualify for STC discount rebates.
                                 </p>
                                 <div className="bg-white/90 p-2.5 rounded-lg text-[10px] text-amber-950 space-y-1.5 font-medium border border-amber-200/50 shadow-inner">
                                   <p className="font-bold text-[10.5px] border-b border-amber-250 pb-1 text-amber-900">🛡️ SYSTEM VALIDATION CHECKS ON SAVE:</p>
                                   <ul className="list-disc pl-4 space-y-1">
                                     <li><strong>Installer Accreditation:</strong> The system verifies your active installer's <strong>CEC Accreditation Number</strong> saved under your company profile.</li>
                                     <li><strong>Approved Products:</strong> Panels, Inverters, and Battery models listed in your design are cross-matched against the system's approved brand database.</li>
                                     <li><strong>STC Validation:</strong> Serial barcodes uploaded during Step 8 will be validated against approved batches before rebate settlement.</li>
                                   </ul>
                                 </div>
                                </div>
                             )}
                            {/* Dynamic required actions fields rendering */}
                            {step.requiredActions && step.requiredActions.length > 0 ? (
                              <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Inputs & Uploads</p>
                                {step.requiredActions.map((act, actIdx) => {
                                  const value = actionInputs[step.stepId]?.[act.label] || "";
                                  const uploading = actionInputs[step.stepId]?.[`${act.label}_uploading`];
                                  const isComplianceDoc = ["AS/NZS 5139 Battery Compliance Certificate", "AS/NZS 4509 Off-Grid Certificate", "ENO Compliance Certificate", "AER Confirmation"].includes(act.label);

                                  return (
                                    <div key={actIdx} className={`flex flex-col gap-1.5 ${isComplianceDoc ? 'bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm' : ''}`}>
                                      <label className={`text-xs font-bold ${isComplianceDoc ? 'text-blue-800' : 'text-gray-700'}`}>
                                        {isComplianceDoc && <span className="mr-1">📜</span>}
                                        {act.label} {act.required !== false && <span className="text-red-500">*</span>}
                                      </label>
                                      {act.fileType === "text" ? (
                                        <input 
                                          type="text" 
                                          value={value} 
                                          onChange={(e) => handleTextChange(step.stepId, act.label, e.target.value)}
                                          placeholder={`Enter ${act.label}...`}
                                          className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-orange-500 bg-white focus:outline-none"
                                        />
                                      ) : value ? (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs">
                                          <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate flex-1">
                                            <span>{act.fileType === "image" ? "📷" : "📄"}</span>
                                            <a 
                                              href={`${API_BASE}${value}`} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="underline hover:text-emerald-950 truncate max-w-[250px]"
                                              title="Click to view uploaded file"
                                            >
                                              {value.split('/').pop() || "Uploaded File"}
                                            </a>
                                            <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700 font-bold shrink-0">✓ Uploaded</span>
                                          </div>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              setActionInputs(prev => {
                                                const next = { ...prev };
                                                if (next[step.stepId]) {
                                                  delete next[step.stepId][act.label];
                                                }
                                                return next;
                                              });
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:underline font-bold ml-3 shrink-0"
                                          >
                                            Change File
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded-lg">
                                          <input 
                                            type="file" 
                                            onChange={(e) => handleFileChange(step.stepId, act.label, e.target.files?.[0])}
                                            className="text-xs text-gray-500 flex-1"
                                          />
                                          {uploading ? (
                                            <span className="text-xs text-orange-600 font-bold animate-pulse">Uploading...</span>
                                          ) : (
                                            <span className="text-xs text-gray-400">No file</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : step.requiresDoc ? (
                              <div className="flex flex-col gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                <span className="text-xs font-bold text-gray-700">
                                  Required Document: {step.documentRequirements?.join(", ") || step.documentName || "Document"}
                                </span>
                                <input 
                                  type="file" 
                                  ref={fileRef}
                                  onChange={e => setUploadFile(e.target.files?.[0])}
                                  className="text-xs text-gray-500"
                                />
                              </div>
                            ) : null}

                            <input 
                              type="text" 
                              placeholder="Add a note (optional)..."
                              className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-orange-500"
                              value={evidenceNote}
                              onChange={e => setEvidenceNote(e.target.value)}
                            />

                            <div className="flex items-center justify-between">
                              {errorMsg && (
                                <p className="text-xs text-red-600 font-bold">⚠️ {errorMsg}</p>
                              )}
                              <button 
                                onClick={() => completeStep(step.stepId)}
                                disabled={stageLoading || (step.requiredActions?.some(act => act.required !== false && !actionInputs[step.stepId]?.[act.label]))}
                                className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors ml-auto shadow-sm ${stageLoading || (step.requiredActions?.some(act => act.required !== false && !actionInputs[step.stepId]?.[act.label])) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'}`}
                              >
                                {stageLoading ? 'Saving...' : 'Submit & Complete Step'}
                              </button>
                            </div>
                          </div>
                       )}
                     </div>
                   );
                 })()}
              </div>
            );
          }) : (
            <p className="text-sm text-gray-500">No steps defined for this project.</p>
          )}
        </div>
      </SectionCard>

      {/* Customer + Project Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Customer Info">
          <div className="space-y-2">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">{project.customerName?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-sm">{project.customerName}</p>
                <p className="text-gray-500 text-xs">{project.customerMobile}</p>
              </div>
            </div>
            {project.customerEmail && <p className="text-gray-500 text-xs">📧 {project.customerEmail}</p>}
            <p className="text-gray-500 text-xs">📍 {project.location?.district}{project.location?.city ? `, ${project.location.city}` : ''}</p>
            {project.location?.address && <p className="text-gray-500 text-xs">🏠 {project.location.address}</p>}
          </div>
        </SectionCard>

        <SectionCard title="Project Info">
          <div className="space-y-2">
            {[
              { label: 'Project Type', value: project.projectTypeLabel },
              { label: 'Capacity', value: project.systemSizeKW ? `${project.systemSizeKW} kW` : '—' },
              { label: 'Total Value', value: project.totalProjectValue ? `₹${project.totalProjectValue?.toLocaleString('en-IN')}` : '—', cls: 'text-green-600 font-semibold' },
              { label: 'Install Date', value: project.scheduledInstallDate ? new Date(project.scheduledInstallDate).toLocaleDateString('en-IN') : '—' },
              { label: 'Due Date', value: project.dueDateForCompletion ? new Date(project.dueDateForCompletion).toLocaleDateString('en-IN') : '—', cls: project.isOverdue ? 'text-red-600 font-medium' : '' },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-400 text-xs">{row.label}</span>
                <span className={`text-xs font-medium ${row.cls || 'text-gray-700'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Payment */}
      <SectionCard title="Payment Breakdown">
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm">Total Project Value</span>
            <span className="text-gray-800 text-sm font-bold">₹{project.totalProjectValue?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <div>
              <p className="text-gray-600 text-sm">90% Payment</p>
              <p className="text-gray-400 text-xs">Released after customer payment</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800 text-sm font-semibold">₹{project.payment90?.amount?.toLocaleString('en-IN') || 0}</p>
              <span className={`text-xs font-medium ${project.payment90?.status === 'Released' ? 'text-green-600' : 'text-yellow-600'}`}>
                {project.payment90?.status || 'Pending'}
              </span>
            </div>
          </div>
          <div className="flex justify-between py-2">
            <div>
              <p className="text-gray-600 text-sm">10% Escrow</p>
              <p className="text-gray-400 text-xs">Released after customer rating</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800 text-sm font-semibold">₹{project.payment10?.amount?.toLocaleString('en-IN') || 0}</p>
              <span className={`text-xs font-medium ${project.payment10?.status === 'Released' ? 'text-green-600' : 'text-orange-600'}`}>
                {project.payment10?.status || 'In Escrow'}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Completion Checklist */}
      <SectionCard title="Completion Checklist">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'mnreDocsUploaded',     label: 'MNRE Docs Uploaded' },
            { key: 'installPhotosUploaded', label: 'Install Photos' },
            { key: 'gpsPhotosUploaded',    label: 'GPS Photos' },
            { key: 'netMeteringDone',      label: 'Net Metering Doc' },
            { key: 'pcrGenerated',         label: 'PCR Report' },
          ].map(item => (
            <div key={item.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              project.completionChecklist?.[item.key]
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`text-lg ${project.completionChecklist?.[item.key] ? 'text-green-500' : 'text-gray-300'}`}>
                {project.completionChecklist?.[item.key] ? '✅' : '○'}
              </span>
              <span className={`text-xs font-medium ${
                project.completionChecklist?.[item.key] ? 'text-green-700' : 'text-gray-500'
              }`}>{item.label}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Customer Rating */}
      {project.customerRating && (
        <SectionCard title="⭐ Customer Rating">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-5 h-5 ${s <= project.customerRating ? 'text-yellow-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="text-gray-800 font-bold">{project.customerRating}/5</span>
          </div>
          {project.customerFeedback && (
            <p className="text-gray-600 text-sm mt-2 bg-gray-50 rounded-lg p-3 italic">
              "{project.customerFeedback}"
            </p>
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default EpcProjectDetail;
