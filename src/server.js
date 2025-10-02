import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import contactsRouter from './routers/contacts.js';

const PORT = Number(process.env.PORT) || 3000;

export const startServer = () => {
  const app = express();

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

  app.use('/contacts', contactsRouter, authRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Available at: http://localhost:${PORT}`);
    console.log(`📞 Contacts API: http://localhost:${PORT}/contacts`);
  });

  return app;
};
