const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query = {}) => {
  const pageRaw = Number(query.page);
  const limitRaw = Number(query.limit);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : DEFAULT_PAGE;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationMeta = (total, { page, limit }) => {
  const totalItems = Number(total) || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
