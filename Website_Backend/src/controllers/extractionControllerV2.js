import { BillExtraction } from '../models/BillExtraction.js';

export const getExtractionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const extraction = await BillExtraction.findById(id);
    
    if (!extraction) return res.status(404).json({ message: 'Extraction not found' });
    
    return res.status(200).json(extraction);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
