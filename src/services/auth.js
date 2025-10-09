import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User, Session } from '../db/models/user.js';
import { sendEmail } from '../utils/sendEmail.js';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const userWithoutPassword = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updateAt: newUser.updatedAt,
  };

  return userWithoutPassword;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.deleteOne({ userId: user._id });

  const accessToken = crypto.randomBytes(32).toString('base64');
  const refreshToken = crypto.randomBytes(32).toString('base64');

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 1000);

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    refreshTokenValidUntil: session.refreshTokenValidUntil,
  };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Unauthorized');
  }

  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Unauthorized');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.deleteOne({ _id: session._id });

  const newAccessToken = crypto.randomBytes(32).toString('base64');
  const newRefreshToken = crypto.randomBytes(32).toString('base64');

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  const newSession = await Session.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
    refreshTokenValidUntil: newSession.refreshTokenValidUntil,
  };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Unauthorized');
  }

  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.deleteOne({ _id: session._id });
};

export const sendResetEmailService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">This link will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPasswordService = async ({ token, password }) => {
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(user._id, { password: hashedPassword });

  await Session.deleteOne({ userId: user._id });
};
