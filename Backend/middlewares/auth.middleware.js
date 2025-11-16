import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

//Authentication for Loged in
const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized: No token provided please login',
      success: false,
      error: true,
    });
  }

  try {
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized: Invalid token',
      success: false,
      error: true,
    });
  }
};

//Check role
const authorizedRole = (...roles) => {
  return async (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: 'You do not have permission to add course.',
        success: false,
        error: true,
      });
    }

    next();
  };
};

export { isAuthenticated, authorizedRole };
