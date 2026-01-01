const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const publicRoutes = [
    '/api/user/login',
    '/api/user/signup',
    '/api/user/forgot-password',
    '/api/user/reset-password', // base path
  ];

  console.log('REQUEST PATH:', req.path);

  const isPublicRoute = publicRoutes.some(route =>
    req.path.startsWith(route)
  );

  console.log('PUBLIC ROUTES:', isPublicRoute);

  // 🔓 Allow public routes
  if (isPublicRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. Token missing.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};
