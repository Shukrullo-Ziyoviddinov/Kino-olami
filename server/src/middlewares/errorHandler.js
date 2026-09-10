const { fail } = require("../utils/apiResponse");

const notFoundHandler = (_req, res) => {
  return fail(res, "Endpoint topilmadi", 404);
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err?.statusCode || err?.status || 500;
  const message = err?.message || "Server xatoligi";
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return fail(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
