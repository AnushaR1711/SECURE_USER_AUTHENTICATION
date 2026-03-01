const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions'
      });
    }

    next();
  };
};

module.exports = requireRole;
