import React, { createContext, useContext, useState } from "react";

const TRANSLATIONS = {
  IN: {
    country: "India", currency: "₹", currencyCode: "INR",
    solarScheme: "PM Surya Ghar Yojana",
  },
  AU: {
    country: "Australia", currency: "A$", currencyCode: "AUD",
    solarScheme: "Small-scale Renewable Energy Scheme (SRES)",
  },
  NZ: {
    country: "New Zealand", currency: "NZ$", currencyCode: "NZD",
    solarScheme: "New Zealand Solar Scheme",
  }
};

const CountryContext = createContext();

export function CountryProvider({ children, countryProp = "IN" }) {
  const [country] = useState(countryProp); // 'IN', 'AU', 'NZ'
  const t = TRANSLATIONS[country] || TRANSLATIONS.IN;

  return (
    <CountryContext.Provider value={{ country, t }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
