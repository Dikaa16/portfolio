// Wraps an async route handler so rejected promises reach the error middleware
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// Fields a client may echo back from a fetched document but must never write
const PROTECTED_FIELDS = ['_id', '__v', 'createdAt', 'updatedAt'];

export const writableFields = (body = {}) => {
  const data = { ...body };
  PROTECTED_FIELDS.forEach(field => delete data[field]);
  return data;
};

export const notFound = (res) => res.status(404).json({ message: 'Not found' });

// Client errors keep their message (it helps fix form input); anything else is
// logged and answered generically so internals are never exposed.
const CLIENT_ERROR_NAMES = ['ValidationError', 'CastError', 'MulterError'];

export const errorHandler = (err, req, res, next) => {
  if (CLIENT_ERROR_NAMES.includes(err.name) || err.code === 11000) {
    return res.status(400).json({ message: err.message });
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.expose ? err.message : 'Bad request' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
};
