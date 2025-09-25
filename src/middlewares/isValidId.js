import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  return (req, res, next) => {
    const { contactId } = req.params;

    if (!isValidObjectId(contactId)) {
      throw createHttpError(404, `Invalid contact ID format`);
    }

    next();
  };
};
