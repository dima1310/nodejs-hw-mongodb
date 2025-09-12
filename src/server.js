import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { getAllContacts, getContactById } from './services/contacts.js';

const PORT = 8080;

export const startServer = () => {
  const app = express();

  app.get('contacts', async (req, res) => {
    const contacts = await getAllContacts();

    res.status(200).json({
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      res.status(404).json({
        message: 'Contact not found',
      });
      return;
    }

    res.status(200).json({
      data: contact,
    });
  });

  app.use(express.json());
  app.use(cors());

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

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
