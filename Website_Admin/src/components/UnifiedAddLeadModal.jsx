import React, { useState, useRef, useEffect } from "react";
import { Upload, X, CheckCircle, AlertTriangle, ScanLine, FileText } from "lucide-react";
import { useAdminSettings } from "../hooks/useAdminSettings";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

const UnifiedAddLeadModal = ({ onClose, onSuccess, initialSource = "website", bdeId = null, isBDE = false, isFreelancer = false, userCountry = "India" }) => {
  const [activeTab, setActiveTab] = useState(isFreelancer ? "bulk" : "scan"); // "scan" or "bulk"

  // -- Scan/Manual Tab State --
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanConfidence, setScanConfidence] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
const isAU = userCountry.toLowerCase() === "australia";

  const [formData, setFormData] = useState({
    name: "", mobile: "", email: "", district: "",
    state: isAU ? "New South Wales" : "Gujarat",
    pincode: "", kw: "", billAmount: "",
    solarType: isAU ? "au-standard-family" : "surya-ghar",
    notes: "", consumerNumber: "", discom: "", tariff: "", meterCategory: "",
    country: isAU ? "australia" : "india"
  });

  // -- Bulk Upload Tab State --
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSolarType, setBulkSolarType] = useState("residential");
  const [bulkCountry, setBulkCountry] = useState(isAU ? "Australia" : "India");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState("");

  const { projectTypes } = useAdminSettings(userCountry);
  const [bdeProjectTypes, setBdeProjectTypes] = useState([]);
  
  useEffect(() => {
    if (isBDE && bdeId) {
      fetch(`${API_BASE}/api/bde/${bdeId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bde && data.bde.assignedProjectTypes) {
            setBdeProjectTypes(data.bde.assignedProjectTypes);
          }
        })
        .catch(err => console.error("Failed to fetch BDE details:", err));
    }
  }, [isBDE, bdeId]);

  // Filter project types
  const availableProjectTypes = isBDE && bdeProjectTypes.length > 0 
    ? projectTypes.filter(pt => bdeProjectTypes.includes(pt.value))
    : projectTypes;

  useEffect(() => {
    if (availableProjectTypes.length > 0 && (!bulkSolarType || !availableProjectTypes.find(pt => pt.value === bulkSolarType))) {
      setBulkSolarType(availableProjectTypes[0].value);
    }
  }, [availableProjectTypes, bulkSolarType]);

  // Ensure bulkCountry matches userCountry
  useEffect(() => {
    if (userCountry && bulkCountry.toLowerCase() !== userCountry.toLowerCase()) {
      setBulkCountry(userCountry);
    }
  }, [userCountry, bulkCountry]);


  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);

  // 1. Scan Bill Logic
  const handleScanBill = async (uploadedFile) => {
    setScanError("");
    setScanConfidence(null);
    setIsScanning(true);

    try {
      const form = new FormData();
      form.append("billFile", uploadedFile);

      const res = await fetch(`${API_BASE}/api/light-bill/scan`, {
        method: "POST",
        headers: { "x-country": isAU ? "AU" : "IN" },
        body: form
      });

      const data = await res.json();
      console.log("Bulk upload response:", data);
      if (!res.ok) throw new Error(data.message || "Scan failed");

      setScanConfidence(data.confidence);
      const ex = data.extracted;

      setFormData(prev => ({
        ...prev,
        name: ex.consumerName || prev.name,
        consumerNumber: ex.consumerNumber || prev.consumerNumber,
        meterCategory: ex.meterCategory || prev.meterCategory,
        billAmount: ex.billAmount || prev.billAmount,
        district: ex.city || ex.district || prev.district,
        state: ex.state || prev.state,
        discom: ex.discom || ex.retailer || prev.discom,
        kw: ex.suggestedKW || ex.usagePeriodDays ? Math.ceil((ex.quarterlyKwh || 0)/90/4) : prev.kw // Simple approx
      }));

    } catch (err) {
      console.error(err);
      setScanError(err.message || "Scan failed. Please fill manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.includes("image/") || selectedFile.type === "application/pdf") {
        handleScanBill(selectedFile);
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      setScanError("Name and Mobile are required.");
      return;
    }
    setIsSubmitting(true);
    setScanError("");

    try {
      const payload = { ...formData, uploadSource: isBDE ? "bde_manual" : "admin_manual" };
      let url = `${API_BASE}/api/leads`;
      if (isBDE && bdeId) {
        url = `${API_BASE}/api/bde/${bdeId}/leads`;
      }
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
      } else {
        throw new Error(data.message || "Failed to add lead");
      }
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Bulk Upload Logic
  const handleBulkUpload = async () => {
    console.log("Starting bulk upload... bdeId:", bdeId);
    if (!bulkFile) { setBulkError("Please select a file"); return; }
    setIsBulkLoading(true); setBulkError("");
    try {
      const form = new FormData();
      form.append("file", bulkFile);
      form.append("solarType", bulkSolarType);
      form.append("country", bulkCountry);
      form.append("uploadSource", isBDE ? "bde_manual" : "admin_manual");
      if (isBDE && bdeId) form.append("bdeId", bdeId);

      const res = await fetch(`${API_BASE}/api/leads/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setBulkResult(data);
        setTimeout(onSuccess, 2000);
      } else {
        setBulkError(data.message || "Upload failed");
      }
    } catch (e) { setBulkError("Network error"); }
    finally { setIsBulkLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Add New Lead</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 border-b border-gray-100 gap-4">
          {!isFreelancer && (
          <button 
            onClick={() => setActiveTab("scan")}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'scan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Single Lead (Manual)
          </button>
          )}
          <button 
            onClick={() => setActiveTab("bulk")}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bulk' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Bulk Upload (CSV)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {activeTab === "scan" && (
            <div className="space-y-6">
              
              {/* Scan Section */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isScanning ? 'border-blue-300 bg-blue-50' : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                onClick={() => !isScanning && fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                
                {isScanning ? (
                  <div className="flex flex-col items-center gap-2">
                    <ScanLine className="w-8 h-8 text-blue-500 animate-pulse" />
                    <p className="text-sm font-bold text-blue-700">Scanning Utility Bill...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="text-sm font-bold text-green-700">{file.name}</p>
                    {scanConfidence && <p className="text-xs text-green-600">Scan successful! Fields auto-filled below.</p>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-bold text-gray-700">Upload Utility Bill for Auto-Scan</p>
                    <p className="text-xs text-gray-500">Supports PDF, JPG, PNG. We will extract details automatically.</p>
                  </div>
                )}
              </div>

              {scanError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {scanError}
                </div>
              )}

              {/* Manual Form */}
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Customer Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Mobile Number *</label>
                    <input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Bill Amount</label>
                    <input type="number" value={formData.billAmount} onChange={e => setFormData({...formData, billAmount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">System Size (kW)</label>
                    <input type="number" step="0.1" value={formData.kw} onChange={e => setFormData({...formData, kw: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">City/District</label>
                    <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Retailer/Discom</label>
                    <input type="text" value={formData.discom} onChange={e => setFormData({...formData, discom: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">State</label>
                    <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                  <button type="submit" disabled={isSubmitting || isScanning} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50">
                    {isSubmitting ? "Saving..." : "Save Lead"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="space-y-6">
              {!bulkResult ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Solar Type</label>
                      <select value={bulkSolarType} onChange={e => setBulkSolarType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                        {availableProjectTypes.map(pt => (
                          <option key={pt.value} value={pt.value}>{pt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    onClick={() => bulkFileInputRef.current?.click()}
                  >
                    <input type="file" ref={bulkFileInputRef} onChange={(e) => setBulkFile(e.target.files[0])} className="hidden" accept=".csv,.xlsx" />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    {bulkFile ? (
                      <p className="text-sm font-bold text-blue-700">{bulkFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700 mb-1">Click to upload CSV file</p>
                        <p className="text-xs text-gray-500">Columns: Name, Mobile, Email, State, City, KW</p>
                      </>
                    )}
                  </div>

                  {bulkError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg">{bulkError}</div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={handleBulkUpload} disabled={isBulkLoading || !bulkFile} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2">
                      {isBulkLoading ? "Uploading..." : "Upload File"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Upload Successful!</h3>
                  <p className="text-sm text-gray-500">Processed: {bulkResult.processed} | Inserted: {bulkResult.inserted}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UnifiedAddLeadModal;
