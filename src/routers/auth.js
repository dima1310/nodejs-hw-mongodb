import express from 'express';
import {
  registerUserController,
  loginUserController,
  refreshSessionController,
  logoutUserController,
  sendResetEmail,
  resetPassword,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerUserSchema,
  loginUserSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  registerUserController,
);

router.post('/login', validateBody(loginUserSchema), loginUserController);

router.post('/refresh', refreshSessionController);

router.post('/logout', logoutUserController);
router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  sendResetEmail,
);
router.post('/reset-pwd', validateBody(resetPasswordSchema), resetPassword);

export default router;
