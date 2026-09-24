// The smallest quantity of a product the shop takes (`minimum_order_quantity` on a product card, 1 unless the shop set
// more). The backend refuses an order below it at checkout ("The minimum order for X is N."); the cart and the cards use
// these to say so earlier.

export const minimumOf = (item) => Math.max(1, Number(item?.minimum_order_quantity) || 1);

// The lines of a cart whose quantity is below their product's minimum.
export const belowMinimum = (items = []) => items.filter((item) => (Number(item?.quantity) || 0) < minimumOf(item));

// The same sentence the backend gives, one per product.
export const minimumOrderProblems = (items = []) =>
  [...new Set(belowMinimum(items).map((item) => `The minimum order for ${item.name} is ${minimumOf(item)}.`))];
