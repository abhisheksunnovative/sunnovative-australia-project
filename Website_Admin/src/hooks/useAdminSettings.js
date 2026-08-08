import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

export const useAdminSettings = (country) => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!country || country === "All") {
      setProjectTypes([]);
      return;
    }

    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/order-journey-settings?country=${country}`);
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
