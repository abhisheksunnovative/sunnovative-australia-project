import { Navigate } from 'react-router-dom';
import { useEpcAuth } from '../../context/EpcAuthContext';

const EpcProtectedRoute = ({ children }) => {
  const { epc, loading } = useEpcAuth();

  // 🚀 Optimization: Jab tak backend ya localStorage check ho rha hai, tab tak wait karo
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ fontFamily: 'sans-serif', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  // Loading poori hone ke baad hi check hoga ki user logged in hai ya nahi
  if (!epc) {
    return <Navigate to="/epc/login" replace />;
  }

  // Force correct country URL prefix path matching their registration country
  const redirectCountry = (epc.country || '').toLowerCase().trim();
  const currentPrefix = window.location.pathname.startsWith('/au/') ? 'australia' : window.location.pathname.startsWith('/nz/') ? 'new_zealand' : 'india';
  
  if (redirectCountry !== currentPrefix) {
    const redirectPrefix = redirectCountry === 'australia' ? '/au' : redirectCountry === 'new_zealand' ? '/nz' : '';
    const cleanPath = window.location.pathname.replace(/^\/(au|nz)\//, '/');
    window.location.href = `${redirectPrefix}${cleanPath}${window.location.search}`;
    return null;
  }

  return children;
};

export default EpcProtectedRoute;