import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import contactsRouter from './routers/contacts.js';
import { TEMP_UPLOAD_DIR } from './constants/index.js';
import fs from "fs/promises";

const PORT = Number(process.env.PORT) || 3000;

export const startServer = () => {
  const app = express();

  const createTempDir = async () => {
    try {
      await fs.access(TEMP_UPLOAD_DIR);
    } catch {
      await fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true });
    }
  };
  createTempDir();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser(0));

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'Server is running',
    });
  });

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Available at: http://localhost:${PORT}`);
    console.log(`📞 Contacts API: http://localhost:${PORT}/contacts`);
  });

  return app;
};
