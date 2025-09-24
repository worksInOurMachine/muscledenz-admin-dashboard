export function calculateDiscount(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    console.error("Discount percent must be between 0 and 100");
  }

  const discount = (price * discountPercent) / 100;
  return Math.round((price - discount) * 100) / 100;
}