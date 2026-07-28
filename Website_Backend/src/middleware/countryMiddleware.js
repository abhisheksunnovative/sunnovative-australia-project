export const extractCountry = (req, res, next) => {
  // Read country from header (x-country) or query param
  // Default to 'india' if not provided
  let country = req.headers['x-country'] || req.query.country || 'india';
  
  // Normalize to lowercase
  req.country = country.toLowerCase().trim();
  
  next();
};
