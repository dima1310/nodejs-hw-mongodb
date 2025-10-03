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
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

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

export const getContactById = async (contactId, ownerId) => {
  return contactCollection.findOne({ _id: contactId, ownerId });
};

export const createContact = async (payload, ownerId) => {
  return contactCollection.create({ ...payload, ownerId });
};

export const updateContact = async (
  contactId,
  payload,
  ownerId,
  options = {},
) => {
  const rawResult = await contactCollection.findOneAndUpdate(
    { _id: contactId, ownerId },
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

export const deleteContact = async (contactId, ownerId) => {
  return contactCollection.findOneAndDelete({ _id: contactId, ownerId });
};
