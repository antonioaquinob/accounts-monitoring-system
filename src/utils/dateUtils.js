export const formatDate = (date) =>
  new Date(date).toISOString().split('T')[0];

export const daysUntil = (date) => {
  const now = new Date();
  const future = new Date(date);
  return Math.floor((future - now) / (1000 * 60 * 60 * 24));
};
