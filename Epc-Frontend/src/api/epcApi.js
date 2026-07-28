import axios from 'axios';

const epcApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4005',
  withCredentials: true   // ✅ YE ADD KAR
});


// Attach EPC token to every request and inject x-country
epcApi.interceptors.request.use((config) => {
  const epcData = localStorage.getItem('epcPartner');
  
  // Only inject if it's not already set manually (like in set-pin flow)
  if (epcData && !config.headers.Authorization && !config.headers.authorization) {
    const { token } = JSON.parse(epcData);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject country from URL
  const path = window.location.pathname;
  if (path.startsWith('/au/')) {
    config.headers['x-country'] = 'australia';
  } else if (path.startsWith('/nz/')) {
    config.headers['x-country'] = 'new_zealand';
  } else {
    config.headers['x-country'] = 'india';
  }

  return config;
});

// 401 → redirect to EPC login (but avoid loop if already on login/register page)
epcApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const onAuthPage = window.location.pathname.includes('/epc/login') ||
        window.location.pathname.includes('/epc/register');
      if (!onAuthPage) {
        localStorage.removeItem('epcPartner');
        const path = window.location.pathname;
        let loginUrl = '/epc/login';
        if (path.startsWith('/au/')) loginUrl = '/au/epc/login';
        if (path.startsWith('/nz/')) loginUrl = '/nz/epc/login';
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(err);
  }
);

export default epcApi;