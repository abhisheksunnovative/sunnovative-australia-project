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

  return children;
};

export default EpcProtectedRoute;