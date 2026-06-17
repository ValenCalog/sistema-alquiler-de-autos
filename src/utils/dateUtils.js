
export const getTodayLocal = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const parseDateLocal = (dateString) => {
  if (!dateString) return null;
  const [y, m, d] = dateString.split('-');
  return new Date(y, m - 1, d);
};

export const formatDateLocal = (dateObj) => {
  if (!dateObj) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const isDateInPast = (date) => {
  return date < getTodayLocal();
};