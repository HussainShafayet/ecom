// The number in a small round badge (the cart icon, the wishlist tab): the count itself up to 99, then "99+", so a big number never pushes the
// badge out of its circle.
export const badgeCount = (count) => (count > 99 ? '99+' : String(count));
