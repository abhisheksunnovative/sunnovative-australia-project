import mongoose from 'mongoose';
import EpcPartner from './src/models/EpcPartner.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const req = {
    query: {
      state: 'Queensland',
      country: 'australia',
      brands: 'jinko,tesla'
    }
  };

  const { state, district, country } = req.query;
  const isAu = country.toLowerCase() === 'australia';

  let query = {};
  if (isAu) {
    query.country = "australia";
  }

  const stateRegex = new RegExp(`^${state || 'Queensland'}$`, 'i');
  const stateMatch = { $in: [stateRegex, /^all$/i] };

  query.$or = [
    { serviceAreas: { $elemMatch: { state: stateMatch } } },
    { activeDistricts: stateMatch }
  ];

  if (!state) {
      query.$or[0].serviceAreas.$elemMatch.state = { $in: [/^Gujarat$/i, /^all$/i] };
      query.$or[1].activeDistricts = { $in: [/^Gujarat$/i, /^all$/i] };
  }

  if (district && district !== 'All') {
     const distRegex = new RegExp(`^${district}$`, 'i');
     query.$or[0].serviceAreas.$elemMatch.district = { $in: [distRegex, /^all$/i] };
     query.$or[1].activeDistricts = { $in: [distRegex, /^all$/i] };
  }

  if (req.query.brands) {
    let brandsQuery = typeof req.query.brands === 'string' ? req.query.brands.split(',') : req.query.brands;
    const { default: Brand } = await import('./src/models/Brand.js');
    const brandDocs = await Brand.find({ name: { $in: brandsQuery.map(b => new RegExp('^' + b.trim() + '$', 'i')) } });
    const brandIds = brandDocs.map(b => b._id);
    
    if (brandIds.length > 0) {
      const { default: ProjectPricing } = await import('./src/models/ProjectPricing.js');
      const pricingDocs = await ProjectPricing.find({
        dynamicBrands: {
          $elemMatch: {
            brandIds: { $in: brandIds }
          }
        }
      });
      
      const epcIdsWithRates = pricingDocs.map(p => p.epcId).filter(id => id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { _id: { $in: epcIdsWithRates } },
          {
            brandOfferings: {
              $elemMatch: {
                $or: [
                  { solarBrands: { $in: brandIds } },
                  { inverterBrands: { $in: brandIds } }
                ]
              }
            }
          }
        ]
      });
    } else {
      console.log("No brands matched");
    }
  }

  console.log("Final Query:", JSON.stringify(query, null, 2));

  let epcs = await EpcPartner.find(query);
  console.log("Found EPCs:", epcs.length, epcs.map(e => e.companyName));

  if (epcs.length === 0 && district && district !== 'All') {
    let fallbackQuery = {};
    if (isAu) fallbackQuery.country = "australia";
    
    fallbackQuery.$or = [
      { serviceAreas: { $elemMatch: { state: stateMatch } } },
      { activeDistricts: stateMatch }
    ];
    
    if (query.$and) {
        fallbackQuery.$and = query.$and;
    }
    
    epcs = await EpcPartner.find(fallbackQuery);
    console.log("Fallback found:", epcs.length);
  }

  process.exit();
});
