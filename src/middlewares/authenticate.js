import createHttpError from 'http-errors';
import { Session, User } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    const session = await Session.findOne({ accessToken: token });

    if (!session) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (new Date() > session.accessTokenValidUntil) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    const user = await User.findById(session.userId);

    if (!user) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    console.error('Authentication:', error);
    next(createHttpError(401, 'Unauthorized'));
  }
};
