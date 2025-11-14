export const generateSlug = (name: string) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")   // replace special chars with -
    .replace(/^-+|-+$/g, "");       // remove starting/ending -

  const random = Math.random().toString(36).substring(2, 8); // 6 random chars
  return `${base}-${random}`;
};