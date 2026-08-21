import React, { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

/**
 * DocViewerModal — opens a document (PDF / image) in a fullscreen modal.
 * Props:
 *   doc      — { docName, fileUrl, verified }
 *   onClose  — () => void
 */
export default function DocViewerModal({ doc, onClose }) {
  const [imgZoom, setImgZoom] = useState(1);
  const [imgRotate, setImgRotate] = useState(0);
  const [loadError, setLoadError] = useState(false);

  if (!doc) return null;

  const fullUrl = doc.fileUrl?.startsWith("http") ? doc.fileUrl : `${API_BASE}${doc.fileUrl}`;
  const ext = (doc.fileUrl || "").split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
  const isPDF   = ext === "pdf";

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.verified ? "bg-emerald-100" : "bg-blue-100"}`}>
              <FileText className={`w-4 h-4 ${doc.verified ? "text-emerald-600" : "text-blue-500"}`}/>
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm leading-tight">{doc.docName}</h3>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[260px]">
                {doc.fileUrl?.split("/").pop()}
              </p>
            </div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${doc.verified ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`}>
              {doc.verified ? "✓ Approved" : "Pending"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <button onClick={() => setImgZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                  title="Zoom out"
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
                  <ZoomOut className="w-4 h-4"/>
                </button>
                <span className="text-xs font-bold text-slate-400 w-10 text-center">{Math.round(imgZoom * 100)}%</span>
                <button onClick={() => setImgZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
                  title="Zoom in"
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
                  <ZoomIn className="w-4 h-4"/>
                </button>
                <button onClick={() => setImgRotate(r => (r + 90) % 360)}
                  title="Rotate"
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
                  <RotateCw className="w-4 h-4"/>
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1"/>
              </>
            )}
            <a href={fullUrl} download target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
              <Download className="w-3.5 h-3.5"/> Download
            </a>
            <button onClick={onClose}
              className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg transition ml-1">
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-4 min-h-0">
          {loadError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <AlertCircle className="w-10 h-10 text-red-300"/>
              <p className="font-semibold text-sm">Could not load document.</p>
              <a href={fullUrl} target="_blank" rel="noreferrer"
                className="text-blue-600 hover:underline text-sm font-bold">
                Open in new tab →
              </a>
            </div>
          ) : isImage ? (
            <div className="overflow-auto flex items-center justify-center w-full h-full">
              <img
                src={fullUrl}
                alt={doc.docName}
                onError={() => setLoadError(true)}
                style={{
                  transform: `scale(${imgZoom}) rotate(${imgRotate}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                  maxWidth: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
                }}
              />
            </div>
          ) : isPDF ? (
            <iframe
              src={`${fullUrl}#toolbar=1&navpanes=0`}
              title={doc.docName}
              className="w-full rounded-lg"
              style={{ minHeight: "70vh", border: "none" }}
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
              <FileText className="w-12 h-12 text-slate-300"/>
              <p className="font-semibold text-sm">Preview not available for this file type.</p>
              <a href={fullUrl} target="_blank" rel="noreferrer"
                className="text-blue-600 hover:underline text-sm font-bold">
                Open / Download →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
