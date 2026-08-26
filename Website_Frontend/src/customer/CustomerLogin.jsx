/**
 * CustomerLogin.jsx
 * Steps:
 *  1. Mobile entry (check if returning user)
 *  2a. New user → Name + send OTP
 *  2b. Returning + PIN set → PIN login (fast path)
 *  3. OTP verify
 *  4. PIN setup (new user only)
 */
import React, { useState, useRef, useEffect } from "react";
import { Sun, Phone, Shield, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, Lock, User, ChevronRight, X } from "lucide-react";
import { useCustomerAuth } from "./CustomerAuthContext";
import { useCountry } from "../context/CountryContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:4005";

const PinDots = ({ value }) => (
  <div className="flex justify-center gap-3 my-2">
    {[0,1,2,3].map(i => (
      <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < value?.length ? "bg-yellow-400 scale-110" : "bg-slate-200"}`} />
    ))}
  </div>
);

const OtpBoxes = ({ length = 4, value = "", onChange, showText = true, onSubmit }) => {
    const inputRefs = useRef([]);
    const handleChange = (e, index) => {
      const val = e.target.value.replace(/\D/g, "");
      if (val) {
        const newVal = value.split("");
        newVal[index] = val[val.length - 1]; // take last char
        const joined = newVal.join("");
        onChange(joined);
        if (index < length - 1) inputRefs.current[index + 1]?.focus();
        else if (joined.length === length) onSubmit?.(joined);
      }
    };
    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace") {
        const newVal = value.split("");
        if (!newVal[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        } else {
          newVal[index] = "";
          onChange(newVal.join(""));
        }
      }
    };
    return (
      <div className="flex gap-2 justify-center w-full">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            type={showText ? "text" : "password"}
            inputMode="numeric"
            value={value[i] || ""}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            className="w-12 h-14 border-2 border-slate-200 rounded-xl text-center text-xl font-black focus:outline-none focus:border-yellow-400 transition-all"
          />
        ))}
      </div>
    );
  };

export default function CustomerLogin({ onClose, onSuccess }) {
  const { login } = useCustomerAuth();
  const { t, country, setCountry } = useCountry();

  const [liveCountries, setLiveCountries] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/countries`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setLiveCountries(data.data.filter(c => c.isActive !== false));
        }
      })
      .catch(console.error);
  }, []);

  const getCountryCode = () => {
    const cObj = liveCountries.find(c => c.code === country || c.name === country);
    if (cObj && cObj.name) return cObj.name.toLowerCase().replace(/\s+/g, '_');
    if (country === "AU") return "australia";
    if (country === "NZ") return "new_zealand";
    return "india";
  };

  // step: mobile | name | pin-login | otp | set-pin | done
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [existingLeads, setExistingLeads] = useState([]);

  const err = (msg) => { setError(msg); setLoading(false); };
  const clear = () => { setError(""); setInfo(""); };

  const isIndia = country?.toLowerCase() === "india" || country?.toLowerCase() === "in";

  const handleMobileNext = async () => {
    clear();
    
    if (isIndia) {
      if (mobile.length < 9 || mobile.length > 10) return err("Please enter a valid 9 or 10-digit mobile number");
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Please enter a valid email address");
    }
    
    setLoading(true);
    // Quick check — try send-otp to see if user exists and if PIN is set
    try {
      const payload = isIndia ? { mobile, checkOnly: true } : { email, checkOnly: true };
      const res = await fetch(`${API}/api/customer/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": getCountryCode() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.isNewUser) {
        setIsNewUser(true); setHasPinSet(false); setStep("name");
      } else if (data.pinSet) {
        setIsNewUser(false); setHasPinSet(true);
        setStep("pin-login"); // returning user with PIN → fast login
      } else {
        setIsNewUser(false); setHasPinSet(false);
        setStep("otp"); setInfo(data.message);
      }
    } catch { err("Network error. Please check the backend."); }
    setLoading(false);
  };

  // Step 2a: Name entered → send OTP for new user
  const handleSendOtpNew = async () => {
    clear();
    if (!fullName.trim()) return err("Name is required");
    setLoading(true);
    const payload = isIndia ? { mobile, fullName: fullName.trim() } : { email, fullName: fullName.trim() };
    try {
      const res = await fetch(`${API}/api/customer/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": getCountryCode() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return err(data.message || "An error occurred");
      setInfo(data.message);
      setStep("otp");
    } catch { err("Network error"); }
    setLoading(false);
  };

  // Step 2b: PIN login for returning user
  const handlePinLogin = async (finalPin) => {
    clear();
    const actualPin = typeof finalPin === "string" ? finalPin : pin;
    if (actualPin.length !== 4) return err("Please enter a 4-digit PIN");
    setLoading(true);
    
    const payload = isIndia ? { mobile, pin: actualPin } : { email, pin: actualPin };
    try {
      const res = await fetch(`${API}/api/customer/auth/login-with-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": getCountryCode() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return err(data.message || "Incorrect PIN");
      login(data.token, data.customer);
      if (data.hasLeads) setExistingLeads(data.existingLeads);
      setStep("done");
      setTimeout(() => { onSuccess?.(data.customer, data.existingLeads); onClose?.(); }, 1200);
    } catch { err("Network error"); }
    setLoading(false);
  };

  // Forgot PIN → send OTP
  const handleForgotPin = async () => {
    clear(); setLoading(true);
    
    const payload = isIndia ? { mobile } : { email };
    try {
      const res = await fetch(`${API}/api/customer/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": getCountryCode() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setInfo("OTP sent - verify to set a new PIN");
      setStep("otp");
    } catch { err("Error"); }
    setLoading(false);
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (finalOtp) => {
    clear();
    const actualOtp = typeof finalOtp === "string" ? finalOtp : otp;
    if (actualOtp.length !== 6) return err("Please enter a 6-digit OTP");
    setLoading(true);
    
    const payload = isIndia ? { mobile, otp: actualOtp } : { email, otp: actualOtp };
    try {
      const res = await fetch(`${API}/api/customer/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": getCountryCode() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return err(data.message || "Incorrect OTP");
      login(data.token, data.customer);
      if (data.existingLeads?.length) setExistingLeads(data.existingLeads);
      // New user → set PIN, existing → done
      if (data.isNewUser || !data.customer.pinSet) {
        setStep("set-pin");
      } else {
        setStep("done");
        setTimeout(() => { onSuccess?.(data.customer, data.existingLeads); onClose?.(); }, 1000);
      }
    } catch { err("Network error"); }
    setLoading(false);
  };

  // Step 4: Set PIN
  const handleSetPin = async (finalConfirmPin) => {
    clear();
    const actualConfirm = typeof finalConfirmPin === "string" ? finalConfirmPin : pinConfirm;
    if (pin.length !== 4) return err("A 4-digit PIN is required");
    if (pin !== actualConfirm) return err("PINs do not match - please try again");
    setLoading(true);
    const payload = isIndia ? { mobile, pin } : { email, pin };
    try {
      const res = await fetch(`${API}/api/customer/auth/set-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-country": getCountryCode() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return err(data.message || "Error");
      login(data.token, data.customer);
      setStep("done");
      setTimeout(() => { onSuccess?.(data.customer, existingLeads); onClose?.(); }, 1200);
    } catch { err("Network error"); }
    setLoading(false);
  };

  const STEP_TITLES = {
    mobile: t.loginTitle,
    name: t.signupTitle,
    "pin-login": "Welcome Back! 👋",
    otp: "Verify OTP",
    "set-pin": "Set Your PIN 🔐",
    done: "Login Successful! 🎉",
  };

  const STEP_SUBS = {
    mobile: t.loginSubtitle,
    name: "Verify your name and OTP once, then set your PIN",
    "pin-login": `${!isIndia ? email : '+91 ' + mobile} - Login using PIN`,
    otp: `OTP ${!isIndia ? email : '+91 ' + mobile} has been sent to`,
    "set-pin": "Next time, you can log in directly using your PIN",
    done: "Opening Dashboard...",
  };

  const canGoBack = ["name","pin-login","otp","set-pin"].includes(step);

  // PIN dots visual


  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-solar-navy to-slate-800 p-6 text-white relative">
          {canGoBack && (
            <button onClick={() => { setStep("mobile"); setOtp(""); setPin(""); setPinConfirm(""); clear(); }}
              className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-white/10 transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition bg-white/5 border border-white/10">
              <X className="w-4 h-4 text-slate-300" />
            </button>
          )}
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${step === "done" ? "bg-green-400" : "bg-solar-yellow"}`}>
              {step === "done" ? <CheckCircle className="w-7 h-7 text-white" /> :
               step === "set-pin" || step === "pin-login" ? <Lock className="w-7 h-7 text-slate-900" /> :
               <Sun className="w-7 h-7 text-slate-900 fill-amber-300" />}
            </div>
            <h2 className="text-base font-black text-center">{STEP_TITLES[step]}</h2>
            <p className="text-xs text-slate-300 text-center leading-relaxed">{STEP_SUBS[step]}</p>
          </div>
          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {["mobile","otp","set-pin"].map((s, i) => (
              <div key={s} className={`h-1 rounded-full transition-all ${
                step === s ? "w-6 bg-yellow-400" :
                (["mobile","name"].includes(step) && i === 0) || (step === "otp" && i <= 1) || step === "done" ? "w-3 bg-yellow-400/50" :
                "w-3 bg-white/20"
              }`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
          {info && <div className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">{info}</div>}

          {/* STEP: Mobile */}
          {step === "mobile" && (
            <>
              {/* Country Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Your Country</label>
                <div className="mb-3">
                  <select
                    value={country}
                    onChange={(e) => { 
                      const selected = liveCountries.find(c => c.code === e.target.value || c.name === e.target.value);
                      if (selected) {
                        setCountry(selected.code || selected.name);
                        setMobile(""); 
                        setEmail(""); 
                        clear();
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-yellow-400 bg-slate-50 transition-all cursor-pointer"
                  >
                    {liveCountries.length > 0 ? (
                      liveCountries.map(c => (
                        <option key={c._id} value={c.code || c.name}>
                          {c.flagEmoji} {c.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading countries...</option>
                    )}
                  </select>
                </div>

                {isIndia ? (
                  <>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mobile Number</label>
                    <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-yellow-400 transition-all">
                      <span className="px-3 py-3 bg-slate-50 text-sm font-black text-slate-500 border-r border-slate-200">
                        +91
                      </span>
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,"").slice(0, 10))}
                        placeholder="9876543210" autoFocus maxLength={10}
                        className="flex-1 px-3 py-3 text-sm font-bold focus:outline-none tracking-widest"
                        onKeyDown={e => e.key === "Enter" && handleMobileNext()} />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                    <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-yellow-400 transition-all">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="hello@example.com" autoFocus
                        className="flex-1 px-4 py-3 text-sm font-bold focus:outline-none"
                        onKeyDown={e => e.key === "Enter" && handleMobileNext()} />
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleMobileNext} disabled={loading || (isIndia ? mobile.length < 9 : !email)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl hover:bg-amber-400 transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {loading ? "Checking..." : "Continue"}
              </button>
              <p className="text-center text-xs text-slate-400">First time? Enter your {!isIndia ? "Email" : "Mobile number"} to auto-register</p>
            </>
          )}

          {/* STEP: Name (new user) */}
          {step === "name" && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Your Full Name</label>
                <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-yellow-400 transition-all">
                  <span className="px-3 py-3 bg-slate-50 border-r border-slate-200"><User className="w-4 h-4 text-slate-400" /></span>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel" autoFocus
                    className="flex-1 px-3 py-3 text-sm font-bold focus:outline-none"
                    onKeyDown={e => e.key === "Enter" && handleSendOtpNew()} />
                </div>
              </div>
              <button onClick={handleSendOtpNew} disabled={loading || !fullName.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl hover:bg-amber-400 transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {/* STEP: PIN login (returning user) */}
          {step === "pin-login" && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex justify-between items-center">
                  4-Digit Login PIN
                  <button onClick={() => setShowPin(!showPin)} className="text-slate-400 hover:text-slate-600">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </label>
                <PinDots value={pin} />
                <OtpBoxes length={4} value={pin} onChange={setPin} showText={showPin} onSubmit={handlePinLogin} />
              </div>
              <button onClick={handlePinLogin} disabled={loading || pin.length !== 4}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl hover:bg-amber-400 transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? "Logging in..." : "Login with PIN"}
              </button>
              <button onClick={handleForgotPin} disabled={loading}
                className="w-full text-xs text-slate-500 hover:text-yellow-600 py-1 transition font-medium">
                🔄 Forgot PIN? Login with OTP
              </button>
            </>
          )}

          {/* STEP: OTP verify */}
          {step === "otp" && (
            <>
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">6-Digit OTP</label>
                <OtpBoxes length={6} value={otp} onChange={setOtp} showText={true} onSubmit={handleVerifyOtp} />
              </div>
              <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl hover:bg-amber-400 transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button onClick={() => { setStep("mobile"); setOtp(""); clear(); }}
                className="w-full text-xs text-slate-500 hover:text-slate-700 py-1 transition">
                ← Mobile number badlo / OTP dobara bhejwao
              </button>
            </>
          )}

          {/* STEP: Set PIN (new user) */}
          {step === "set-pin" && (
            <>
              <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-4">
                💡 4-digit Set Your PIN — agla baar mobile number + PIN se seedha login hoga, OTP ka wait nahi karna padega
              </p>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex justify-between items-center">
                  New PIN
                  <button onClick={() => setShowPin(!showPin)} className="text-slate-400 hover:text-slate-600">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </label>
                <PinDots value={pin} />
                <OtpBoxes length={4} value={pin} onChange={setPin} showText={showPin} />
              </div>
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Confirm PIN</label>
                <PinDots value={pinConfirm} />
                <OtpBoxes length={4} value={pinConfirm} onChange={setPinConfirm} showText={showPin} onSubmit={handleSetPin} />
              </div>
              <button onClick={handleSetPin} disabled={loading || pin.length !== 4 || pinConfirm.length !== 4}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl hover:bg-amber-400 transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {loading ? "Setting PIN..." : "Set PIN & Enter Dashboard"}
              </button>
            </>
          )}

          {/* STEP: Done */}
          {step === "done" && (
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-black text-slate-800">Login Successful!</p>
              {existingLeads.length > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 font-medium">
                  🔗 {existingLeads.length} existing project{existingLeads.length > 1 ? "s" : ""} linked to aapke account!
                </p>
              )}
              <Loader2 className="w-5 h-5 animate-spin text-yellow-400 mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
