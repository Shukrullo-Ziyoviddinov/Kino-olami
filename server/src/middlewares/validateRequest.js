const validateIdParam = (paramName = "id") => (req, res, next) => {
  const value = Number(req.params[paramName]);
  if (!Number.isFinite(value)) {
    return res.status(400).json({
      success: false,
      ok: false,
      data: null,
      message: `Noto'g'ri ${paramName}.`,
    });
  }
  req.params[paramName] = value;
  return next();
};

module.exports = {
  validateIdParam,
};
