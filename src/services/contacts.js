import { contactCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
  const contacts = await contactCollection.find();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await contactCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await contactCollection.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const rawResult = await contactCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

export const deleteContact = async (contactId) => {
  const contact = await contactCollection.findOneAndDelete({
    _id: contactId,
  });
  return contact;
};
