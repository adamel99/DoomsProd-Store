export const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

export const formatDate = (value, fallback = "Unknown") => {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (value, fallback = "Unknown") => {
  if (!value) return fallback;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
