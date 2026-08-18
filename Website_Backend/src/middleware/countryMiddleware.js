export const extractCountry = (req, res, next) => {
  // Read country from header (x-country) or query param
  // Default to 'india' if not provided
  let country = req.headers['x-country'] || req.query.country || 'india';
  
  // Normalize to lowercase
  let norm = country.toLowerCase().trim();
  if (norm === 'in') norm = 'india';
  if (norm === 'au') norm = 'australia';
  
  req.country = norm;
  // Override query parameter so controllers reading req.query.country also get the mapped name
  req.query.country = norm;
  
  next();
};
