import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import EpcRoutes from './routes/EpcRoutes';
import { CountryProvider } from './context/CountryContext';

function CountryWrapper() {
  const { countryPrefix } = useParams();
  
  const prefixMap = { au: "AU", nz: "NZ" };
  if (countryPrefix && !prefixMap[countryPrefix]) {
    return <Navigate to="/epc/login" replace />;
  }

  const countryProp = countryPrefix ? prefixMap[countryPrefix] : "IN";

  return (
    <CountryProvider countryProp={countryProp}>
      <EpcRoutes />
    </CountryProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Country prefixed routes */}
        <Route path="/:countryPrefix/epc/*" element={<CountryWrapper />} />
        
        {/* Default India routing */}
        <Route path="/epc/*" element={<CountryWrapper />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/epc/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;