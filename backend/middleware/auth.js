import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    // Try to get token from different header formats
    let token = req.headers.token || req.headers.authorization;
    
    // Remove Bearer if present
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    console.log('Auth middleware - token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };

    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been locked. Please contact administrator."
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: "Invalid token",
      error: error.message 
    });
  }
};

export default auth;
