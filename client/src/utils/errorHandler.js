export const normalizeApiError = (error, fallbackMessage = 'So‘rovda xatolik yuz berdi.') => {
  if (!error) return new Error(fallbackMessage);
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  if (typeof error.message === 'string') return new Error(error.message);
  return new Error(fallbackMessage);
};

export const createApiError = (message, status = 500, payload = null) => {
  const err = new Error(message || 'So‘rovda xatolik yuz berdi.');
  err.status = status;
  err.payload = payload;
  return err;
};
