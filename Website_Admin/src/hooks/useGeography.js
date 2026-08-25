import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4005';

export function useGeography(country, state) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      try {
        const url = country ? `${API_BASE}/api/districts/states?country=${country}` : `${API_BASE}/api/districts/states`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setStates(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching states:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, [country]);

  useEffect(() => {
    if (!state && country) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/api/districts?1=1`;
        if (country) url += `&country=${country}`;
        if (state) url += `&state=${state}`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.data) {
          const dists = data.data.map(d => d.district);
          setDistricts([...new Set(dists)]);
        } else if (Array.isArray(data)) {
          const dists = data.map(d => d.district);
          setDistricts([...new Set(dists)]);
        }
      } catch (err) {
        console.error('Error fetching districts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, [country, state]);

  return { states, districts, loading };
}
