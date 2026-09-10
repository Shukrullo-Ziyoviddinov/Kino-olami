/**
 * News sana: createdAt dan kun / oy / yil.
 * Admin news yaratganda timestamps.createdAt avtomatik qo'yiladi.
 */

const pad2 = (n) => String(Number(n) || 0).padStart(2, "0");

const getNewsDateParts = (createdAt) => {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    date,
  };
};

const formatNewsDate = (createdAt) => {
  const parts = getNewsDateParts(createdAt);
  if (!parts) return "";
  return `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year}`;
};

const attachNewsDateFields = (row = {}) => {
  const parts = getNewsDateParts(row.createdAt);
  if (!parts) {
    return {
      ...row,
      day: null,
      month: null,
      year: null,
      dateLabel: "",
    };
  }

  return {
    ...row,
    day: parts.day,
    month: parts.month,
    year: parts.year,
    dateLabel: formatNewsDate(row.createdAt),
  };
};

module.exports = {
  getNewsDateParts,
  formatNewsDate,
  attachNewsDateFields,
};
