import { contactCollection } from '../db/models/contact.js';

export const getAllContacts = async (options = {}) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    filter = {},
  } = options;

  const skip = (page - 1) * perPage;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder == 'desc' ? -1 : 1;

  const contacts = await contactCollection
    .find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(perPage);

  const totalItems = await contactCollection.countDocuments(filter);

  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
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
