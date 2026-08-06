import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import epcApi from '../../../api/epcApi';
import OtpInput from '../../../components/epc/OtpInput';

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
          <p className="text-yellow-600 text-xs">Your OTP (shown until SMS is active):</p>
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

const EpcRegister = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState(1); // 1=GST, 2=Mobile+OTP, 3=Details, 4=PIN
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [showPopup, setShowPopup]     = useState(false);
  const [popupMsg, setPopupMsg]       = useState('');
  const [popupOtp, setPopupOtp]       = useState('');

  // Step 1 - GST
  const [gstNumber, setGstNumber]         = useState('');
  const [gstValidating, setGstValidating] = useState(false);
  const [gstValid, setGstValid]           = useState(false);
  const [gstData, setGstData]             = useState(null);

  // Step 2 - Mobile
  const [mobile, setMobile]               = useState('');
  const [mobileValidating, setMobileValidating] = useState(false);
  const [otp, setOtp]                     = useState('');
  const [otpSent, setOtpSent]             = useState(false);

  // Step 3 - Details
  const [form, setForm] = useState({
    country: 'india',
    companyName: '', ownerName: '', email: '',
    state: '', district: '', city: '', pincode: '', address: '',
    yearsOfExperience: '0',
  });

  // Step 4 - PIN
  const [pin, setPin]               = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  const inputCls = 'w-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';

  // ── GST Auto Validate ──────────────────────────────────────────────────────
  useEffect(() => {
    if (gstNumber.length !== 15) { setGstValid(false); setGstData(null); return; }
    const timer = setTimeout(async () => {
      setGstValidating(true);
      setError('');
      try {
        const { data } = await epcApi.post('/api/epc/auth/validate-gst', { gstNumber });
        setGstValid(true);
        setGstData(data);
        setForm(f => ({
          ...f,
          companyName: data.companyName || f.companyName,
          state:       data.state       || f.state,
        }));
      } catch (err) {
        setGstValid(false);
        setGstData(null);
        setError(err.response?.data?.message || 'GST validation failed');
      } finally { setGstValidating(false); }
    }, 800);
    return () => clearTimeout(timer);
  }, [gstNumber]);

  // ── Mobile Validate + Send OTP ────────────────────────────────────────────
  const handleValidateMobile = async () => {
    if (mobile.length !== 10) { setError('Enter valid 10-digit mobile'); return; }
    setError(''); setMobileValidating(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/validate-mobile', { gstNumber, mobile });
      setOtpSent(true);
      setOtp('');
      setPopupMsg(data.message || `OTP sent to ${mobile.slice(0,3)}XXXXXXX`);
      // SMS bypass status check logic
      setPopupOtp(data.otp ? data.otp : '');
      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Mobile validation failed');
    } finally { mobileValidating(false); }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      await epcApi.post('/api/epc/auth/verify-mobile-otp', { mobile, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.companyName || !form.ownerName || !form.email)
      return setError('Please fill all required fields');
    setError(''); setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/register', { ...form, mobile, gstNumber });
      
      // 🔴 FORCE SYNC FORWARD: Async lock todne ke liye session container use kiya
      setTempToken(data.tempToken);
      sessionStorage.setItem('currentTempToken', data.tempToken);

      setPin(''); setPinConfirm('');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // ── Set PIN ───────────────────────────────────────────────────────────────
  const handleSetPin = async () => {
    if (pin.length !== 4) return setError('Enter complete 4-digit PIN');
    if (pin !== pinConfirm) return setError('PINs do not match');
    setError(''); setLoading(true);

    // 🔴 FRESH CONTAINER TOKEN LOAD
    const tokenToSend = tempToken || sessionStorage.getItem('currentTempToken');
    console.log("PIN set karte waqt ye token ja rha hai:", tokenToSend);

    try {
      const { data } = await epcApi.post('/api/epc/auth/set-pin', { pin },
        { headers: { Authorization: `Bearer ${tokenToSend}` } });
      
      sessionStorage.removeItem('currentTempToken');
      localStorage.setItem('epcPartner', JSON.stringify(data));
      const redirectCountry = (data?.country || '').toLowerCase().trim();
      const redirectPrefix = redirectCountry === 'australia' ? '/au' : redirectCountry === 'new_zealand' ? '/nz' : '';
      navigate(`${redirectPrefix}/epc/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set PIN');
    } finally { setLoading(false); }
  };

  const stepLabels = ['GST', 'Mobile', 'Details', 'PIN'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {showPopup && <OtpSentPopup message={popupMsg} otp={popupOtp} onClose={() => setShowPopup(false)} />}

      <div className="w-full max-w-lg">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">EPC Partner Registration</h1>
        </div>

        <div className="flex gap-2 mb-5">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-1 ${step > i ? 'bg-blue-500' : step === i+1 ? 'bg-blue-300' : 'bg-gray-200'}`} />
              <p className={`text-xs ${step === i+1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

          {/* STEP 1: GST */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-gray-800 font-bold text-lg">GST Verification</h2>
                <p className="text-gray-400 text-xs mt-0.5">Enter your GST number to auto-verify</p>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-medium mb-1.5">Country *</label>
                <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={inputCls}>
                  <option value="india">India</option>
                  <option value="australia">Australia</option>
                  <option value="new_zealand">New Zealand</option>
                </select>
              </div>

              {form.country === 'india' ? (
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">GST Number *</label>
                  <div className="relative">
                    <input type="text" placeholder="e.g. 24AABCU9603R1ZP"
                      value={gstNumber}
                      onChange={e => setGstNumber(e.target.value.toUpperCase().replace(/\s/g,'').slice(0,15))}
                      className={`${inputCls} pr-10`} maxLength={15} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {gstValidating && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                      {gstValid && !gstValidating && <span className="text-green-500 text-lg">✓</span>}
                      {!gstValid && !gstValidating && gstNumber.length === 15 && <span className="text-red-400 text-lg">✗</span>}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">15-character GST number — auto validates</p>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1.5">Business Registration No. *</label>
                  <input type="text" placeholder="e.g. ABN 12 345 678 901"
                    value={gstNumber}
                    onChange={e => {
                      setGstNumber(e.target.value);
                      if (e.target.value.length > 5) setGstValid(true); else setGstValid(false);
                    }}
                    className={inputCls} />
                  <p className="text-gray-400 text-xs mt-1">Enter your valid business registration number</p>
                </div>
              )}

              {gstValid && gstData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-green-700 text-xs font-semibold">✅ GST Verified</p>
                  <p className="text-green-800 text-sm font-bold mt-0.5">{gstData.companyName}</p>
                  {gstData.state && <p className="text-green-600 text-xs">📍 {gstData.state}</p>}
                  <p className="text-green-600 text-xs">PAN: {gstData.pan}</p>
                </div>
              )}

              <button onClick={() => setStep(2)} disabled={!gstValid}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                Continue
              </button>
              <p className="text-center text-gray-400 text-xs">
                Already registered? <Link to="/epc/login" className="text-blue-600 font-medium">Login here</Link>
              </p>
            </div>
          )}

          {/* STEP 2: Mobile + OTP Boxes */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <button onClick={() => setStep(1)} className="text-gray-400 text-xs hover:text-blue-600 mb-2">← Back</button>
                <h2 className="text-gray-800 font-bold text-lg">Mobile Verification</h2>
                <p className="text-gray-400 text-xs mt-0.5">Enter GST registered mobile number</p>
              </div>

              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-gray-600 text-xs font-medium mb-1.5">Mobile Number *</label>
                    <input type="tel" placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,10))}
                      className={inputCls} maxLength={10} />
                  </div>
                  <button onClick={handleValidateMobile} disabled={mobile.length !== 10 || mobileValidating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                    {mobileValidating ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm text-center">
                    OTP sent to <strong>{mobile.slice(0,3)}XXXXXXX</strong>
                  </p>
                  <OtpInput length={6} value={otp} onChange={setOtp} />
                  <button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                    {loading ? 'Verifying...' : 'Verify OTP & Continue'}
                  </button>
                  <button onClick={handleValidateMobile} disabled={mobileValidating}
                    className="w-full text-blue-500 text-xs hover:underline py-1">Resend OTP</button>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <button onClick={() => setStep(2)} className="text-gray-400 text-xs hover:text-blue-600 mb-2">← Back</button>
                <h2 className="text-gray-800 font-bold text-lg">Company Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1">Company Name *</label>
                  <input type="text" value={form.companyName}
                    onChange={e => setForm({...form, companyName: e.target.value})}
                    className={inputCls} placeholder="Auto filled from GST" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1">Owner Name *</label>
                  <input type="text" value={form.ownerName}
                    onChange={e => setForm({...form, ownerName: e.target.value})}
                    className={inputCls} placeholder="Authorized person name" />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1">Email *</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className={inputCls} placeholder="company@example.com" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">State</label>
                  <input type="text" value={form.state}
                    onChange={e => setForm({...form, state: e.target.value})}
                    className={inputCls} placeholder="Gujarat" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">District</label>
                  <input type="text" value={form.district}
                    onChange={e => setForm({...form, district: e.target.value})}
                    className={inputCls} placeholder="Surat" />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">City</label>
                  <input type="text" value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-1">Pincode</label>
                  <input type="text" value={form.pincode} maxLength={6}
                    onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g,'')})}
                    className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-600 text-xs font-medium mb-1">Experience</label>
                  <select value={form.yearsOfExperience}
                    onChange={e => setForm({...form, yearsOfExperience: e.target.value})}
                    className={inputCls}>
                    {['0','1','2','3','4','5','6','7','8','9','10+'].map(y => (
                      <option key={y} value={y}>{y} year{y !== '1' ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          )}

          {/* STEP 4: Set PIN Boxes */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-gray-800 font-bold text-lg text-center">🔐 Set Your PIN</h2>
                <p className="text-gray-400 text-xs mt-0.5 text-center">
                  Create a 4-digit PIN — you'll use this every time to login
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-blue-700 text-xs text-center">
                  ⚠️ Account pending admin approval. Once approved, login with email + PIN.
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-xs font-medium mb-2 text-center">Enter PIN</p>
                <OtpInput length={4} value={pin} onChange={setPin} secret={true} />
              </div>

              <div>
                <p className="text-gray-600 text-xs font-medium mb-2 text-center">Confirm PIN</p>
                <OtpInput length={4} value={pinConfirm} onChange={setPinConfirm} secret={true} />
                {pinConfirm.length === 4 && pin !== pinConfirm && (
                  <p className="text-red-500 text-xs mt-2 text-center">PINs do not match</p>
                )}
              </div>

              <button onClick={handleSetPin} disabled={pin.length !== 4 || pin !== pinConfirm || loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm">
                {loading ? 'Setting PIN...' : 'Set PIN & Finish'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpcRegister;