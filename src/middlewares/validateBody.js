import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });

      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(', ');

        throw createHttpError(404, `Validation error: ${errorMessage}`);
      }
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};
