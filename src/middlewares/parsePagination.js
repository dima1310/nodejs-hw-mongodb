export const parsePagination = (req, res, next) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedPerPage = parseInt(perPage, 10);

  const validPage = parsedPage > 0 ? parsedPage : 1;
  const validPerPage =
    parsedPerPage > 0 && parsedPerPage <= 100 ? parsedPerPage : 10;

  const allowedSortFields = [
    'name',
    'phoneNumber',
    'email',
    'contactType',
    'isFavourite',
    'createdAt',
    'updatedAt',
  ];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const validSortOrder = sortOrder == 'desc' ? 'desc' : 'asc';

  const filter = {};

  if (type && ['work', 'home', 'personal'].includes(type)) {
    filter.contactType = type;
  }

  if (isFavourite !== undefined) {
    if (isFavourite == 'true' || isFavourite == '1') {
      filter.isFavorite = true;
    } else if (isFavourite == 'false' || isFavourite == '0') {
      filter.isFavorite = false;
    }
  }

  req.pagination = {
    page: validPage,
    perPage: validPerPage,
  };

  req.sort = {
    sortBy: validSortBy,
    sortOrder: validSortOrder,
  };

  req.filter = filter;

  next();
};
