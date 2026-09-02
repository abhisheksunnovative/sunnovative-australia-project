import React, { createContext, useContext, useState, useEffect } from "react";
import epcApi from "../api/epcApi";

const TRANSLATIONS = {
  IN: {
    country: "India", currency: "₹", currencyCode: "INR",
    solarScheme: "PM Surya Ghar Yojana",
  },
  AU: {
    country: "Australia", currency: "A$", currencyCode: "AUD",
    solarScheme: "Small-scale Renewable Energy Scheme (SRES)",
    stc: {
      defaultPrice: 39,
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

  // Live Location State from Admin Backend
  const [allDistricts, setAllDistricts] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [distRes, countryRes] = await Promise.all([
          epcApi.get('/api/districts'),
          epcApi.get('/api/countries')
        ]);
        
        const distData = distRes.data;
        setAllDistricts(distData.success ? distData.data : (Array.isArray(distData) ? distData : []));

        const countryData = countryRes.data;
        if (countryData.success && Array.isArray(countryData.data)) {
          setCountriesList(countryData.data.filter(c => c.isActive).map(c => c.name));
        } else if (Array.isArray(countryData)) {
          setCountriesList(countryData.filter(c => c.isActive).map(c => c.name));
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Helper methods for dynamic dropdowns
  const getCountries = () => {
    return countriesList.length > 0 ? countriesList : [...new Set(allDistricts.map(d => d.country))];
  };

  const getStates = (countryName) => {
    if (!countryName) return [];
    const filtered = allDistricts.filter(
      d => d.country?.toLowerCase() === countryName.toLowerCase()
    );
    return [...new Set(filtered.map(d => d.state))];
  };

  const getDistricts = (countryName, stateName) => {
    if (!countryName) return [];
    let filtered = allDistricts.filter(d => d.country?.toLowerCase() === countryName.toLowerCase());
    if (stateName) {
      filtered = filtered.filter(d => d.state?.toLowerCase() === stateName.toLowerCase());
    }
    return [...new Set(filtered.map(d => d.district))];
  };

  return (
    <CountryContext.Provider value={{ 
      country, 
      t,
      allDistricts,
      locationsLoading,
      getCountries,
      getStates,
      getDistricts
    }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}
