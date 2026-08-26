export const formatProductType = (type) => {
  if (!type) return "Product";

  return type.replace(/_/g, " ");
};
