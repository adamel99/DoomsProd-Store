export const formatProductType = (type) => {
  if (!type) return "Product";

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};
