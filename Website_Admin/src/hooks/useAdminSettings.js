import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

// Map country codes to full names used by the backend
const CODE_TO_NAME = {
  AU: 'australia', IN: 'india', NZ: 'new_zealand', UK: 'uk', US: 'us',
  australia: 'australia', india: 'india', new_zealand: 'new_zealand', uk: 'uk', us: 'us',
};

export const useAdminSettings = (country) => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!country || country === "All") {
      setProjectTypes([]);
      return;
    }

    // Normalize: accept code (AU) or name (australia)
    const normalizedCountry = CODE_TO_NAME[country] || country.toLowerCase();

    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${normalizedCountry}`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        if (data && data.projectTypes) {
          const formatted = data.projectTypes
            .filter(pt => pt.enabled)
            .map(pt => ({
              value: pt.projectType,
              label: pt.projectTypeLabel || pt.projectType
            }));
          setProjectTypes(formatted);
        } else {
          setProjectTypes([]);
        }
      } catch (err) {
        console.error("Error fetching admin settings:", err);
        setError(err.message);
        setProjectTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [country]);

  return { projectTypes, loading, error };
};
