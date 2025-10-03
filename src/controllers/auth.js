import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';

export const registerUserController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({ name, email, password });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const session = await loginUser({ email, password });

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: session.refreshTokenValidUntil,
      secure: process.env.NODE_ENV ==='production',
      sameSize: 'strict',
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshSessionController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    const session = await refreshSession(refreshToken);

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: session.refreshTokenValidUntil,
      secure: process.env.NODE_ENV === 'production',
      sameSize: 'strict',
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUserController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    await logoutUser(refreshToken);

    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
