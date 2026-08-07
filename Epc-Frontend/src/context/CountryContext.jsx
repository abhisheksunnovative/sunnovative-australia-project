import React, { createContext, useContext, useState } from "react";

const TRANSLATIONS = {
  IN: {
    country: "India", currency: "₹", currencyCode: "INR",
    solarScheme: "PM Surya Ghar Yojana",
  },
  AU: {
    country: "Australia", currency: "A$", currencyCode: "AUD",
    solarScheme: "Small-scale Renewable Energy Scheme (SRES)",
    stc: {
      defaultPrice: 39, // $39 per STC
      deemingPeriod: {
        2026: 10,
        2027: 9,
        2028: 8,
        2029: 7,
        2030: 6,
        2031: 5
      },
      zones: {
        1: 1.536,
        2: 1.382,
        3: 1.185,
        4: 1.008
      }
    }
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
