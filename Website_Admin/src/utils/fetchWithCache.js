let countriesCache = null;
let fetchPromise = null;

// Ek smart Fetch Wrapper jo normal fetch ko replace karega
export const fetchWithCache = (url, options = {}) => {
  const isCountriesApi = typeof url === 'string' && url.includes('/api/countries');
  const method = options.method || 'GET';

  // 1. Agar koi naya country ADD/UPDATE ho raha hai (POST/PUT), toh cache delete kar do
  if (isCountriesApi && method !== 'GET') {
    countriesCache = null; 
    return fetch(url, options); // Normal API call
  }

  // 2. Agar Countries GET kar rahe hain, toh CACHE use karo
  if (isCountriesApi && method === 'GET') {
    // Agar pehle se data saved hai, turant wahi wapas kar do (0ms delay)
    if (countriesCache) {
      return Promise.resolve({
        json: () => Promise.resolve(countriesCache),
        status: 200,
        ok: true
      });
    }

    // Agar ek component API call kar raha hai aur dusra component load ho gaya, toh wait karo
    if (fetchPromise) {
      return fetchPromise.then(data => ({
        json: () => Promise.resolve(data),
        status: 200,
        ok: true
      }));
    }

    // Pehli baar: Original API hit karo aur response ko save kar lo
    fetchPromise = fetch(url, options)
      .then(res => res.json())
      .then(data => {
        countriesCache = data; // Data save kar liya (Memory me)
        fetchPromise = null;
        return data;
      })
      .catch(err => {
        fetchPromise = null;
        throw err;
      });

    return fetchPromise.then(data => ({
      json: () => Promise.resolve(data),
      status: 200,
      ok: true
    }));
  }

  // 3. Kisi aur API (like /api/users) ke liye, normal fetch use karo
  return fetch(url, options);
};