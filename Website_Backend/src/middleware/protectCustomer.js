import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

export const protectCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Login required' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'customer')
      return res.status(401).json({ message: 'Not authorized as customer' });

    const customer = await Customer.findById(decoded.id).select('-otp -otpExpiry');
    if (!customer) return res.status(401).json({ message: 'Customer not found' });
    if (!customer.isActive) return res.status(403).json({ message: 'Account deactivated' });

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};