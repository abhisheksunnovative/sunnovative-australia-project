/**
 * geoLocationService.js
 * Free reverse geocoding using OpenStreetMap Nominatim API
 * No API key required — fair usage policy: max 1 request/second
 * Docs: https://nominatim.org/release-docs/latest/api/Reverse/
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Required by Nominatim usage policy — identify your app
const USER_AGENT = "EmergeSunEnergySystems/1.0 (contact: info@sunnovative.com)";

/**
 * Reverse Geocode — Lat/Long se district, taluka, pincode, address nikalo
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&accept-language=en`;

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      return {
        success: false,
        message: "Location data nahi mila is coordinate ke liye",
      };
    }

    const addr = data.address || {};

    // Nominatim ke fields India ke liye:
    // state_district / county = district
    // suburb / town / village = taluka level
    // postcode = pincode
    // city / town / village = city
    return {
      success: true,
      data: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        formattedAddress: data.display_name || "",
        district: addr.state_district || addr.county || addr.city_district || "",
        taluka: addr.suburb || addr.town || addr.county || "",
        pincode: addr.postcode || "",
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
        country: addr.country || "India",
        rawAddress: addr,
      },
    };
  } catch (err) {
    console.error("reverseGeocode error:", err.message);
    return {
      success: false,
      message: "Geocoding service abhi available nahi hai: " + err.message,
    };
  }
};

/**
 * Forward Geocode — Address se Lat/Long nikalo (manual entry ke liye)
 * @param {string} address
 * @returns {Promise<object>}
 */
export const forwardGeocode = async (address) => {
  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(
      address
    )}&format=jsonv2&addressdetails=1&countrycodes=in&limit=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "Is address ke liye location nahi mili",
      };
    }

    const result = data[0];
    const addr = result.address || {};

    return {
      success: true,
      data: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name || "",
        district: addr.state_district || addr.county || "",
        taluka: addr.suburb || addr.town || "",
        pincode: addr.postcode || "",
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
      },
    };
  } catch (err) {
    console.error("forwardGeocode error:", err.message);
    return {
      success: false,
      message: "Geocoding service abhi available nahi hai: " + err.message,
    };
  }
};

/**
 * Haversine formula — 2 coordinates ke beech distance (km mein)
 * Nearby EPC partners dhundne ke liye use hoga
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
};