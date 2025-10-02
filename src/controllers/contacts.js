import createHttpError from 'http-errors';
import * as contactServices from '../services/contacts.js';

export const getAllContactsController = async (req, res, next) => {
  const { page, perPage } = req.pagination;
  const { sortBy, sortOrder } = req.sort;
  const filter = req.filter;
  const ownerId = req.user._id;

  const paginationContacts = await contactServices.getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    ownerId,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: paginationContacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const ownerId = req.user._id;
  const { contactId } = req.params;
  const contact = await contactServices.getContactById(contactId, ownerId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const contact = await contactServices.createContact({
    ...req.body,
    ownerId: req.user.id,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const updateContactController = async (req, res) => {
  const ownerId = req.user._id;
  const { contactId } = req.params;
  const result = await contactServices.updateContact(
    contactId,
    req.body,
    ownerId,
  );

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

export const deleteContactController = async (req, res) => {
  const ownerId = req.user._id;
  const { contactId } = req.params;
  const contact = await contactServices.deleteContact(contactId, ownerId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
