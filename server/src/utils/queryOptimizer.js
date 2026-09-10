const applyProjection = (query, fields) => {
  if (!fields) return query;
  return query.select(fields);
};

const applyPagination = (query, { skip = 0, limit = 20 } = {}) => {
  return query.skip(skip).limit(limit);
};

const applySort = (query, sort = null) => {
  if (!sort) return query;
  return query.sort(sort);
};

module.exports = {
  applyProjection,
  applyPagination,
  applySort,
};
