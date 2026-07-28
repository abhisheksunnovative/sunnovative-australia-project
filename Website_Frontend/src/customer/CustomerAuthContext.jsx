import React, { createContext, useContext, useState, useEffect } from "react";
import { useCountry } from "../context/CountryContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:4005";
const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const { country } = useCountry();
  const [customer, setCustomer] = useState(null);
  const [token, setToken]       = useState(() => localStorage.getItem("customer_token"));
  const [loading, setLoading]   = useState(true);

  const getCountryCode = () => {
    if (country === "AU") return "australia";
    if (country === "NZ") return "new_zealand";
    return "india";
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/customer/auth/me`, { headers: { Authorization: `Bearer ${token}`, 'x-country': getCountryCode() } })
      .then(r => r.json())
      .then(d => { if (d.success) setCustomer(d.customer); else logout(); })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);

  const login = (tok, cust) => {
    localStorage.setItem("customer_token", tok);
    setToken(tok);
    setCustomer(cust);
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    setToken(null);
    setCustomer(null);
  };

  const authFetch = (url, opts = {}) =>
    fetch(`${API}${url}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-country": getCountryCode(), ...(opts.headers || {}) },
    });

  return (
    <CustomerAuthContext.Provider value={{ customer, token, loading, login, logout, authFetch, API }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);