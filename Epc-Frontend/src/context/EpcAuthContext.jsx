import { createContext, useContext, useState, useEffect } from 'react';
import epcApi from '../api/epcApi';

const EpcAuthContext = createContext(null);

export const EpcAuthProvider = ({ children }) => {
  const [epc, setEpc] = useState(null);
  
  // 🚀 Optimization: Shuru me loading true rahegi jab tak localStorage check na ho jaye
  const [loading, setLoading] = useState(true);

  // App load hote hi sabse pehle bina kisi lag ke localstorage check hoga
  useEffect(() => {
    const stored = localStorage.getItem('epcPartner');
    if (stored) {
      setEpc(JSON.parse(stored));
    }
    setLoading(false); // Check hone ke baad loading turant false
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await epcApi.post('/api/epc/auth/login', { email, password });
      localStorage.setItem('epcPartner', JSON.stringify(data));
      setEpc(data);
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('epcPartner');
    setEpc(null);
    // 🚀 Fixed: Hard refresh hata diya, ab bina browser ghoome instant logout hoga
  };

  const updateEpcData = (newData) => {
    const updated = { ...epc, ...newData };
    localStorage.setItem('epcPartner', JSON.stringify(updated));
    setEpc(updated);
  };

  // ✅ NEW — jab OTP/PIN flow se localStorage mein already data save ho gaya ho,
  // ye function context state ko bhi sync kar deta hai (taaki ProtectedRoute turant pehchaan le)
  const setEpcDirect = (data) => {
    localStorage.setItem('epcPartner', JSON.stringify(data));
    setEpc(data);
  };

  return (
    <EpcAuthContext.Provider value={{ epc, loading, login, logout, updateEpcData, setEpcDirect }}>
      {children}
    </EpcAuthContext.Provider>
  );
};

export const useEpcAuth = () => {
  const ctx = useContext(EpcAuthContext);
  if (!ctx) throw new Error('useEpcAuth must be used within EpcAuthProvider');
  return ctx;
};