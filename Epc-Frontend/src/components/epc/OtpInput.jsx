import { useRef, useEffect } from 'react';

// OTP/PIN Box Input Component
// Usage: <OtpInput length={6} value={otp} onChange={setOtp} />
const OtpInput = ({ length = 6, value = '', onChange, secret = false }) => {
  const inputs = useRef([]);
  const vals = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (e, idx) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    const newVals = [...vals];
    newVals[idx] = ch;
    onChange(newVals.join(''));
    if (ch && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!vals[idx] && idx > 0) {
        const newVals = [...vals];
        newVals[idx - 1] = '';
        onChange(newVals.join(''));
        inputs.current[idx - 1]?.focus();
      } else {
        const newVals = [...vals];
        newVals[idx] = '';
        onChange(newVals.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={el => inputs.current[idx] = el}
          type={secret ? 'password' : 'text'}
          inputMode="numeric"
          maxLength={1}
          value={vals[idx]}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
            ${vals[idx]
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-gray-50 text-gray-800'
            }
            focus:border-blue-500 focus:bg-blue-50 focus:ring-2 focus:ring-blue-100`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
