import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import epcApi from '../../../api/epcApi';
import OtpInput from '../../../components/epc/OtpInput';
import { useEpcAuth } from '../../../context/EpcAuthContext';
import { useCountry } from '../../../context/CountryContext';


const OtpSentPopup = ({ message, otp, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-green-100">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-gray-800 font-bold text-lg mb-1">OTP Sent!</h3>
      <p className="text-gray-500 text-sm">{message}</p>
      {otp && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mt-3">
          <p className="text-yellow-600 text-xs">Your OTP (until SMS/Email fully active):</p>
          <p className="text-yellow-700 font-bold text-2xl tracking-widest mt-1">{otp}</p>
        </div>
      )}
      <button onClick={onClose}
        className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm">
        OK, Got it!
      </button>
    </div>
  </div>
);

const EpcLogin = () => {
  const navigate = useNavigate();
  const { setEpcDirect } = useEpcAuth();
  const { getCountries, getStates, locationsLoading } = useCountry();

  // step: 1=state+company, 2=otp (only first-time), 3=pin (enter or set)
  const [step, setStep]           = useState(1);
  const [country, setCountry]     = useState('');
  const [state, setState]         = useState('');
  const [search, setSearch]       = useState('');
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [showDrop, setShowDrop]   = useState(false);

  const [otp, setOtp]             = useState('');
  const [pin, setPin]             = useState('');
  const [isSetPin, setIsSetPin]   = useState(false); // true = first time, need to SET pin; false = ENTER existing pin
  const [tempToken, setTempToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetOtp, setResetOtp]   = useState('');
  const [resetPin, setResetPin]   = useState('');

  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg]   = useState('');
  const [popupOtp, setPopupOtp]   = useState('');

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!state || search.length < 2) { setCompanies([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await epcApi.get(`/api/epc/auth/companies?state=${state}&search=${search}&country=${country}`);
        setCompanies(data.companies || []);
        setShowDrop(true);
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [search, state]);

  const inputCls = 'w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';

  // ── STEP 1 → Check: PIN set hai? Seedha PIN screen, ya OTP bhejo ───────────
  const handleContinue = async () => {
    if (!selected) { setError('Please select your company'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/login-check', { email: selected.email });
      setMaskedEmail(data.maskedEmail);

      if (data.nextStep === 'ENTER_PIN') {
        // PIN already set — OTP ki zaroorat nahi, seedha PIN screen
        setIsSetPin(false);
        setPin('');
        setStep(3);
      } else {
        // Pehli baar login — OTP bheja gaya
        setPopupMsg(data.message);
        setPopupOtp(!data.emailSent && data.otp ? data.otp : '');
        setShowPopup(true);
        setOtp('');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  // ── STEP 2: Verify OTP (sirf pehli baar) ──────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/login-verify-otp', { email: selected.email, otp });
      setTempToken(data.tempToken);
      setIsSetPin(true); // pehli baar — PIN set karna hoga
      setPin('');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/login-send-otp', { email: selected.email });
      setPopupMsg(data.message);
      setPopupOtp(!data.emailSent && data.otp ? data.otp : '');
      setShowPopup(true);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    } finally { setLoading(false); }
  };

  // ── STEP 3a: Set PIN (pehli baar) ──────────────────────────────────────────
  const handleSetPin = async () => {
    if (pin.length !== 4) { setError('Enter complete 4-digit PIN'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/set-pin', { pin },
        { headers: { Authorization: `Bearer ${tempToken}` } });
      setEpcDirect(data);
      const redirectCountry = (data?.country || '').toLowerCase().trim();
      const redirectPrefix = redirectCountry === 'australia' ? '/au' : redirectCountry === 'new_zealand' ? '/nz' : '';
      navigate(`${redirectPrefix}/epc/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set PIN');
    } finally { setLoading(false); }
  };

  // ── STEP 3b: Login with existing PIN ──────────────────────────────────────
  const handleLoginWithPin = async () => {
    if (pin.length !== 4) { setError('Enter complete 4-digit PIN'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/login-with-pin', { email: selected.email, pin });
      setEpcDirect(data);
      const redirectCountry = (data?.country || '').toLowerCase().trim();
      const redirectPrefix = redirectCountry === 'australia' ? '/au' : redirectCountry === 'new_zealand' ? '/nz' : '';
      navigate(`${redirectPrefix}/epc/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid PIN');
    } finally { setLoading(false); }
  };

  // ── Reset PIN flow ─────────────────────────────────────────────────────────
  const handleResetOtpSend = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/reset-pin-otp', { email: selected?.email });
      setPopupMsg(data.message);
      setPopupOtp(!data.emailSent && data.otp ? data.otp : '');
      setShowPopup(true);
      setResetStep(2);
      setResetOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleResetPinVerify = async () => {
    if (resetOtp.length !== 6 || resetPin.length !== 4) { setError('Enter complete OTP and PIN'); return; }
    setError(''); setLoading(true);
    try {
      await epcApi.post('/api/epc/auth/reset-pin-verify', {
        email: selected?.email, otp: resetOtp, newPin: resetPin,
      });
      setShowReset(false); setResetStep(1);
      setResetOtp(''); setResetPin(''); setPin('');
      alert('PIN reset successfully! Enter your new PIN to login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      {showPopup && <OtpSentPopup message={popupMsg} otp={popupOtp} onClose={() => setShowPopup(false)} />}

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="EmergeSun" className="w-48 h-auto mx-auto mb-4 object-contain" />
          <p className="text-gray-500 text-sm">EPC Partner Portal</p>
        </div>

        <div className="flex gap-1 mb-5">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-orange-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

          {/* STEP 1 */}
          {step === 1 && !showReset && (
            <div className="space-y-4">
              <div>
                <h2 className="text-gray-800 font-bold text-lg">Login</h2>
                <p className="text-gray-400 text-xs mt-0.5">Select your state and company</p>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Country *</label>
                <select 
                  value={country} 
                  onChange={e => { setCountry(e.target.value); setState(''); setSelected(null); setSearch(''); }} 
                  className={inputCls}
                  disabled={locationsLoading}
                >
                  <option value="">Select Country</option>
                  {getCountries().map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {/* Fallbacks if DB is empty but we still want to show them temporarily, otherwise just map getCountries() */}
                  {getCountries().length === 0 && !locationsLoading && (
                    <>
                      <option value="india">India</option>
                      <option value="australia">Australia</option>
                      <option value="new_zealand">New Zealand</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">State *</label>
                <select 
                  value={state} 
                  onChange={e => { setState(e.target.value); setSelected(null); setSearch(''); }} 
                  className={inputCls}
                  disabled={!country || locationsLoading}
                >
                  <option value="">Select State</option>
                  {getStates(country).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {state && (
                <div className="relative">
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Company Name *</label>
                  <input type="text" placeholder="Type to search..."
                    value={selected ? selected.companyName : search}
                    onChange={e => { setSearch(e.target.value); setSelected(null); }}
                    onFocus={() => companies.length && setShowDrop(true)}
                    className={inputCls} />
                  {showDrop && companies.length > 0 && !selected && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 overflow-hidden">
                      {companies.map(c => (
                        <button key={c._id} onClick={() => { setSelected(c); setSearch(c.companyName); setShowDrop(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-0">
                          <p className="text-gray-800 text-sm font-medium">{c.companyName}</p>
                          <p className="text-gray-400 text-xs">{c.district}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selected && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-orange-600 text-xs">Registered email:</p>
                  <p className="text-orange-800 font-bold text-sm mt-0.5">{selected.email?.replace(/(.{2}).*(@)/, '$1***$2')}</p>
                </div>
              )}
              <button onClick={handleContinue} disabled={!selected || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                {loading ? 'Please wait...' : 'Login'}
              </button>
              <p className="text-center text-gray-400 text-xs">
                If you don't find your EPC company name in the dropdown, please register first.<br/><br/>
                New EPC? <Link to="/epc/register" className="text-orange-600 font-medium">Register here</Link>
              </p>
            </div>
          )}

          {/* STEP 2 — OTP (sirf first-time login) */}
          {step === 2 && !showReset && (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep(1)} className="text-gray-400 text-xs hover:text-orange-600 mb-2">← Back</button>
                <h2 className="text-gray-800 font-bold text-lg text-center">Enter OTP</h2>
                <p className="text-gray-400 text-xs mt-0.5 text-center">First-time login — verify via <strong>{maskedEmail}</strong></p>
              </div>
              <OtpInput length={6} value={otp} onChange={setOtp} />
              <button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button onClick={handleResendOtp} disabled={loading} className="w-full text-orange-500 text-xs hover:underline py-1">
                Resend OTP
              </button>
            </div>
          )}

          {/* STEP 3 — PIN (set or enter) */}
          {step === 3 && !showReset && (
            <div className="space-y-5">
              <div>
                <h2 className="text-gray-800 font-bold text-lg text-center">
                  {isSetPin ? '🔐 Set Your PIN' : 'Enter PIN'}
                </h2>
                <p className="text-gray-400 text-xs mt-0.5 text-center">
                  {isSetPin ? 'Create a 4-digit PIN for quick login next time' : `Login as ${selected?.companyName || ''}`}
                </p>
              </div>
              <OtpInput length={4} value={pin} onChange={setPin} secret={true} />
              <button onClick={isSetPin ? handleSetPin : handleLoginWithPin} disabled={pin.length !== 4 || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                {loading ? 'Please wait...' : isSetPin ? 'Set PIN & Login' : 'Login'}
              </button>
              {!isSetPin && (
                <button onClick={() => { setShowReset(true); setResetStep(1); }}
                  className="w-full text-gray-400 text-xs hover:text-blue-600 py-1">
                  Forgot PIN? Reset it
                </button>
              )}
            </div>
          )}

          {/* Reset PIN */}
          {showReset && (
            <div className="space-y-4">
              <div>
                <button onClick={() => { setShowReset(false); setResetStep(1); }} className="text-gray-400 text-xs hover:text-blue-600 mb-2">← Back</button>
                <h2 className="text-gray-800 font-bold text-lg">Reset PIN</h2>
              </div>
              {resetStep === 1 && (
                <>
                  <p className="text-gray-500 text-sm text-center">OTP will be sent to<br/><strong>{selected?.email?.replace(/(.{2}).*(@)/, '$1***$2')}</strong></p>
                  <button onClick={handleResetOtpSend} disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                    {loading ? 'Sending...' : 'Send Reset OTP'}
                  </button>
                </>
              )}
              {resetStep === 2 && (
                <>
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-2 text-center">Enter OTP</p>
                    <OtpInput length={6} value={resetOtp} onChange={setResetOtp} />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-2 text-center">New 4-digit PIN</p>
                    <OtpInput length={4} value={resetPin} onChange={setResetPin} secret={true} />
                  </div>
                  <button onClick={handleResetPinVerify} disabled={resetOtp.length !== 6 || resetPin.length !== 4 || loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                    {loading ? 'Resetting...' : 'Reset PIN'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpcLogin;
