/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isBdeLogin, setIsBdeLogin] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  // Preset admin credentials for frictionless demo test-drive
  const presets = [
    {
      email: "structasoftadmin@gmail.com",
      role: "Super Admin",
      label: "Primary Owner",
    },
    {
      email: "admin@sunnovative.com",
      role: "SaaS Director",
      label: "SaaS Administrator",
    },
    {
      email: "veneet@sunnovative.com",
      role: "Viewer",
      label: "Veneet (Order Journey)",
    },
  ];

  const handlePresetSelect = (pEmail) => {
    setEmail(pEmail);
    setPassword("admin123"); // Standard default pass
    setError(null);
  };

  const handleRequestOtp = async () => {
    if (!email.trim()) return setError("Please enter your BDE Email");
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/bde/auth/request-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: email })
      });
      const data = await res.json();
      if (data.success) {
        setOtpMode(true);
      } else {
        setError(data.message || "Could not send OTP");
      }
    } catch (err) { setError("Error connecting to server"); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return setError("Please fill all fields");
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/bde/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ identifier: email, otp, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setOtpMode(false);
        setPassword(newPassword);
        setError("Password set successfully! You can now login.");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) { setError("Error connecting to server"); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all security credentials.");
      return;
    }

    setLoading(true);
    setError(null);

    if (isBdeLogin) {
      try {
        const res = await fetch(`${API_BASE}/api/bde/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (data.success) {
          setSuccess(true);
          setTimeout(() => {
            onLoginSuccess(data.bde.email, "BDE", data.bde._id, data.bde.country);
          }, 800);
        } else {
          setError(data.message || "Invalid BDE credentials");
          setLoading(false);
        }
      } catch (err) {
        setError("Error connecting to server");
        setLoading(false);
      }
    } else {
      // Simulate authenticating against local credential store with realistic timer
      setTimeout(() => {
        setLoading(false);
        // Let any credentials pass for preview convenience but simulate formal restriction check
        if (password.length < 4) {
          setError(
            "Security rule violation: Passwords must be at least 4 characters.",
          );
          return;
        }

        const matchedPreset = presets.find(p => p.email === email);
        const loginRole = matchedPreset ? matchedPreset.role : "Admin";

        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess(email, loginRole, null);
        }, 800);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#061824] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      {/* Dynamic graphic radial glow to reinforce raw organic "solar energy" ambiance */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-primary/20 filter blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-secondary/5 rounded-full filter blur-[80px] pointer-events-none" />

      {/* Grid Pattern overlay for technological feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c2c3e_1px,transparent_1px),linear-gradient(to_bottom,#0c2c3e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md bg-[#092231]/80 backdrop-blur-xl border border-sky-900/40 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 bg-secondary text-primary rounded-2xl shadow-lg shadow-secondary/10 mb-3 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
            <Sun className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display uppercase">
            SUNNOVATIVE
          </h1>
          <p className="text-xs text-sky-300/80 mt-1 font-semibold tracking-wide uppercase font-mono mb-4">
            Solar SaaS Admin Station
          </p>
          
          {/* Login Type Toggle */}
          <div className="flex bg-[#0c2c3e] rounded-lg p-1 w-full max-w-xs mx-auto">
            <button 
              onClick={() => setIsBdeLogin(false)}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${!isBdeLogin ? 'bg-secondary text-primary' : 'text-sky-300 hover:text-white'}`}
            >
              Admin
            </button>
            <button 
              onClick={() => setIsBdeLogin(true)}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${isBdeLogin ? 'bg-blue-600 text-white' : 'text-sky-300 hover:text-white'}`}
            >
              BDE Portal
            </button>
          </div>
        </div>

        {/* Form area or success block */}
        {success ? (
          <div className="text-center py-10 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Access Approved</h3>
            <p className="text-xs text-sky-200">
              Decryption verified. Launching operational control terminal...
            </p>
            <div className="w-12 h-1 bg-secondary mx-auto rounded-full mt-4 animate-pulse" />
          </div>
        ) : (
          <form onSubmit={!otpMode ? handleSubmit : (e) => e.preventDefault()} className="space-y-5">
            {/* Display error message securely */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/20 flex gap-2.5 items-start text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field Custom Design */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sky-200 mb-1.5 font-mono">
                {isBdeLogin ? "BDE Email" : "Administrator Identity"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sunnovative.com"
                  required
                  className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#061824]/90 border border-sky-900/50 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Password Field Custom Design */}
            {!otpMode && <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-sky-200 font-mono">
                  Access Code
                </label>
                <span className="text-[10px] text-sky-400 font-mono hover:underline cursor-pointer" onClick={isBdeLogin ? handleRequestOtp : undefined}>
                  {isBdeLogin ? "First Time Login / Reset" : "Standard Password: admin123"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-11 pr-11 py-3 rounded-xl bg-[#061824]/90 border border-sky-900/50 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sky-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>}

            {otpMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sky-200 mb-1.5 font-mono">OTP (Check your email/mobile)</label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required className="block w-full px-4 py-3 rounded-xl bg-[#061824]/90 border border-sky-900/50 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sky-200 mb-1.5 font-mono">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required className="block w-full px-4 py-3 rounded-xl bg-[#061824]/90 border border-sky-900/50 text-sm text-white" />
                </div>
                <button type="button" onClick={handleVerifyOtp} className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-500 text-white hover:bg-blue-600">Verify OTP & Set Password</button>
              </>
            )}

            {/* Login Button with state-based hover layouts */}
            {!otpMode && <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                loading
                  ? "bg-secondary/40 text-primary cursor-not-allowed"
                  : "bg-secondary text-primary hover:bg-[#ffe359] hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Unlock SaaS Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>}
          </form>
        )}

        {/* Demo Fast-Track Presets */}
        {!success && (
          <div className="mt-8 pt-6 border-t border-sky-900/40">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-xs font-semibold text-sky-300 font-mono">
                Operator Presets & Audits
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(p.email)}
                  className="p-2.5 rounded-xl bg-[#0c2c3e]/50 hover:bg-[#0c2c3e] border border-sky-900/30 text-left transition-colors cursor-pointer text-xs group"
                >
                  <p className="font-bold text-white leading-tight group-hover:text-secondary transition-colors">
                    {p.role}
                  </p>
                  <p className="text-[10px] text-sky-300 font-mono truncate">
                    {p.email}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
