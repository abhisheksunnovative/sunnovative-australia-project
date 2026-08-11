import React, { useState, useEffect } from "react";

const DistrictPincodeSettings = ({ selectedCountry }) => {
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({ state: "", district: "", pincodes: "" });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const fetchDistricts = async () => {
    if (!selectedCountry) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/districts?country=${selectedCountry}`);
      const data = await response.json();
      setDistricts(data.data || data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [selectedCountry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCountry) return alert("Please select a country first");
    try {
      const response = await fetch(`${API_BASE}/api/districts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry,
          state: formData.state,
          district: formData.district,
          pincodes: formData.pincodes
        })
      });
      if (response.ok) {
        setFormData({ state: "", district: "", pincodes: "" });
        setShowAddForm(false);
        fetchDistricts();
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/districts/${id}`, {
        method: "DELETE", });
      if (response.ok) fetchDistricts();
    } catch (error) {
      console.error("Error deleting district:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#28377f" }}>District & Pincode Settings</h2>
      {selectedCountry ? (
        <p>Selected Country: <strong>{selectedCountry.toUpperCase()}</strong></p>
      ) : (
        <p style={{ color: "red" }}>Please select a country to view or add districts.</p>
      )}

      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ color: "#28377f", margin: 0 }}>Districts</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: "#28377f",
              color: "white",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: "bold"
            }}
          >
            + Add District
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "5px", position: "relative" }}>
          <button 
            type="button"
            onClick={() => setShowAddForm(false)}
            style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ?
          </button>

        <h3 style={{ color: "#28377f" }}>Add District</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>State Name:</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>District Name:</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Pincodes (comma-separated):</label>
            <textarea
              name="pincodes"
              value={formData.pincodes}
              onChange={handleChange}
              rows={4}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              placeholder="e.g. 1001, 1002, 1003"
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: "#f57c00",
              color: "white",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: "bold"
            }}
          >
            Add District
          </button>
        </form>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#28377f", color: "white", textAlign: "left" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>State</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>District</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Pincodes</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((d) => (
              <tr key={d._id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{d.state || "-"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{d.district}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{d.pincodes.join(", ")}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{d.isActive ? "Active" : "Inactive"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDelete(d._id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      borderRadius: "3px"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {districts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "10px", textAlign: "center", border: "1px solid #ddd" }}>
                  No districts found for this country.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DistrictPincodeSettings;
