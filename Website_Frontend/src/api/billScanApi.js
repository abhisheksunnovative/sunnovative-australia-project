// Agar tumhare project me already ek shared axios instance hai (jaise epcApi.js),
// toh usi pattern se billScanApi.js bana lo. Example:

import axios from 'axios';

const billScanApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4005',
});

export default billScanApi;