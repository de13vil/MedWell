const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
  // START OF NEW LOGGING
  console.log("\n--- PROTECT MIDDLEWARE CHECK ---"); 
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log("Found 'Authorization' header.");
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("Token Extracted:", token);

      // This will show us if the secret is loaded correctly from .env
      console.log("Verifying token with secret:", process.env.JWT_SECRET); 
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token Decoded Successfully. User ID:", decoded.userId);

      req.user = await User.findById(decoded.userId).select('-password');
      next(); // Success! Proceed to the actual route.

    } catch (error) {
      // This will tell us the exact reason the token failed
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.error("!!!!! TOKEN VERIFICATION FAILED !!!!!");
      console.error("REASON:", error.message); 
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log("No token found in headers.");
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };