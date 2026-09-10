const success = (res, data = null, message = "OK", statusCode = 200, meta) => {
  const payload = {
    success: true,
    ok: true,
    data,
    message,
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const fail = (res, message = "Xatolik yuz berdi.", statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    success: false,
    ok: false,
    data,
    message,
  });
};

module.exports = { success, fail };
