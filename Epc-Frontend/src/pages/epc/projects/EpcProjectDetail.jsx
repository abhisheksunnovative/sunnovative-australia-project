import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import epcApi from '../../../api/epcApi';

const EpcProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [msg, setMsg]               = useState({ text: '', type: '' });

  // Completion states
  const [uploadFile, setUploadFile] = useState(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await epcApi.get(`/api/epc/projects/${id}`);
      setProject(data);
    } catch (err) {
      console.error('Project detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const completeStep = async (stepId) => {
    if (!window.confirm(`Mark this step as complete?`)) return;
    setStageLoading(true);
    try {
      const fd = new FormData();
      fd.append('stepId', stepId);
      if (evidenceNote) fd.append('note', evidenceNote);
      if (uploadFile) fd.append('evidence', uploadFile);

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

  const isCompleted  = project.status === 'completed' || project.status === 'closed';

  const SectionCard = ({ title, children }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-gray-700 text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

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
          <h2 className="text-gray-800 text-xl font-bold">Project Detail</h2>
          <p className="text-gray-400 text-xs font-mono">#{project.orderNumber}</p>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
          {project.completionPercentage || 0}% Complete
        </span>
      </div>

      {msg.text && (
        <div className={`text-sm rounded-lg px-4 py-3 border ${
          msg.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.text}</div>
      )}

      {/* Dynamic Project Steps */}
      <SectionCard title="Project Journey Tasks">
        <div className="space-y-4">
          {project.steps?.filter(s => s.visibleToEpc !== false).length > 0 ? project.steps.filter(s => s.visibleToEpc !== false).map((step, i) => {
            const isEPC = step.assignedTo === 'epc-partner';
            const isActive = step.status === 'pending' || step.status === 'in-progress';
            const isCompleted = step.status === 'completed';
            
            return (
              <div key={step.stepId} className={`p-4 rounded-xl border ${isCompleted ? 'bg-green-50/50 border-green-100' : isActive && isEPC ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                      {i + 1}. {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Assigned to: {step.assignedTo}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {step.status}
                  </span>
                </div>
                
                {isCompleted && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                    <span>Completed at: {new Date(step.completedAt).toLocaleDateString()} by {step.completedBy}</span>
                    {step.evidenceUrl && <a href={step.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Evidence</a>}
                  </div>
                )}
                
                {isActive && isEPC && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <p className="text-xs font-semibold text-blue-800 mb-2">{step.pendingActionAlert}</p>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Add a note (optional)..."
                        className="w-full text-sm border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500"
                        value={evidenceNote}
                        onChange={e => setEvidenceNote(e.target.value)}
                      />
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          ref={fileRef}
                          onChange={e => setUploadFile(e.target.files?.[0])}
                          className="text-xs text-gray-500"
                        />
                        <button 
                          onClick={() => completeStep(step.stepId)}
                          disabled={stageLoading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors ml-auto"
                        >
                          {stageLoading ? 'Saving...' : 'Complete Step'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
