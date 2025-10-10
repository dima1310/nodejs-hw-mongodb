import createHttpError from 'http-errors';
import { contact } from '../db/models/contact.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/uploadToCloudinary.js';

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

  const contacts = await contact
    .find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(perPage);

  const totalItems = await contact.countDocuments(filter);

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

export const getContactById = async (contactId, userId) => {
  return contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload, userId, file) => {
  let photoUrl = null;
  if (file) {
    photoUrl = await uploadToCloudinary(file.path);
  }
  return contact.create({ ...payload, userId, photo: photoUrl });
};

export const updateContact = async (
  contactId,
  payload,
  userId,
  file,
  options = {},
) => {
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  let photoUrl = contact.photo;
  if (file) {
    if (contact.photo) {
      await deleteFromCloudinary(contact.photo);
    }
    photoUrl = await uploadToCloudinary(file.path);
  }
  const rawResult = await contact.findOneAndUpdate(
    { _id: contactId, userId },
    { ...payload, photo: photoUrl },
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

export const deleteContact = async (contactId, userId) => {
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  if (contact.photo) {
    await deleteFromCloudinary(contact.photo);
  }
  return contact.findOneAndDelete({ _id: contactId, userId });
};
