
import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare } from "lucide-react";

export default function InstallAppButton({ className, textClassName }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    const ua = window.navigator.userAgent;
    const isIosDevice = /iphone|ipad|ipod/.test(ua.toLowerCase());
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const [toastMsg, setToastMsg] = useState('');

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setToastMsg("App is already installed on your device!");
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // Only hide if we are currently running IN standalone mode
  if (isStandalone) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={className !== undefined ? className : "hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-solar-navy transition-all cursor-pointer shadow-sm gap-1.5"}
      >
        <Download className="w-4 h-4" />
        <span className={textClassName !== undefined ? textClassName : "hidden md:inline"}>Install App</span>
      </button>

      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm z-[100] shadow-lg animate-fade-in-up">
          {toastMsg}
        </div>
      )}

      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center relative">
            <button onClick={() => setShowIOSPrompt(false)} className="absolute top-4 right-4 text-slate-400">
              X
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Install on iOS</h3>
            <p className="text-slate-600 mb-6 text-sm">
              To install this app on your iPhone/iPad, tap the <strong>Share</strong> button <Share className="inline w-4 h-4 mx-1" /> on Safari's bottom navigation bar, then scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-4 h-4 mx-1" />.
            </p>
            <button onClick={() => setShowIOSPrompt(false)} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

