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
        const json = await res.json();
        
        // Settings are stored in json.data.journeys or json.projectTypes depending on API version
        let rawProjectTypes = [];
        if (json && json.data && json.data.journeys) {
          rawProjectTypes = json.data.journeys;
        } else if (json && json.projectTypes) {
          rawProjectTypes = json.projectTypes;
        }

        if (rawProjectTypes && rawProjectTypes.length > 0) {
          const formatted = rawProjectTypes
            .filter(pt => pt.enabled !== false) // enabled by default unless explicitly false
            .map(pt => {
              // Convert kebab-case or similar to Title Case if label is missing
              const fallbackLabel = pt.projectType
                .split(/[-_]+/)
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              return {
                value: pt.projectType,
                label: pt.projectTypeLabel || fallbackLabel
              };
            });
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
