import jwt from 'jsonwebtoken';
import EpcPartner from '../models/EpcPartner.js';

export const protectEpc = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'epc') {
      return res.status(401).json({ message: 'Not authorized as EPC partner' });
    }

    const epc = await EpcPartner.findById(decoded.id).select('-password');
    if (!epc) {
      return res.status(401).json({ message: 'EPC not found' });
    }

    if (!epc.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    req.epc = epc;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export const requireVerified = (req, res, next) => {
  if (!['Approved', 'Verified'].includes(req.epc.onboardingStatus)) {
    return res.status(403).json({ message: 'Account not approved by admin' });
  }
  next();
};

// middleware/protectEpc.js में protectEpcBasic को बदलें:

export const protectEpcBasic = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];


    // 🔴 DEBUG — decode WITHOUT verifying, taaki expired hone par bhi dikhe
    const rawDecoded = jwt.decode(token);
    console.log('Token payload:', rawDecoded);
    console.log('Token issued at (iat):', new Date(rawDecoded.iat * 1000));
    console.log('Token expires at (exp):', new Date(rawDecoded.exp * 1000));
    console.log('Server time right now:', new Date());
    console.log('Difference in seconds:', rawDecoded.exp - Math.floor(Date.now() / 1000))
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'epc') {
      return res.status(401).json({ message: 'Not authorized as EPC partner' });
    }

    const epc = await EpcPartner.findById(decoded.id).select('-password');
    if (!epc) {
      return res.status(401).json({ message: 'EPC not found' });
    }

    // यहाँ कोई isActive चेक नहीं होना चाहिए (जो कि सुरक्षित है क्योंकि ये सिर्फ PIN सेट करने के लिए है)
    req.epc = epc;
    next();
  } catch (error) {
    console.error("Middleware Error:", error.message); // इससे आपको कंसोल में असली एरर दिखेगी
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};