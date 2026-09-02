const isProduction = process.env.NODE_ENV === 'production';

const sanitizeValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return undefined;

  return errors.map((error) => ({
    message: error?.message,
    path: error?.path,
    type: error?.type,
  }));
};

const sanitizeError = (err) => {
  if (!err) return null;

  return {
    name: err.name,
    message: err.message,
    status: err.status,
    code: err.code,
    type: err.type,
    constraint: err.parent?.constraint,
    validationErrors: sanitizeValidationErrors(err.errors),
  };
};

const logError = (label, err, context = {}) => {
  console.error(label, {
    ...context,
    error: isProduction ? sanitizeError(err) : err,
  });
};

const logWarn = (label, context = {}) => {
  console.warn(label, context);
};

module.exports = {
  logError,
  logWarn,
  sanitizeError,
};
