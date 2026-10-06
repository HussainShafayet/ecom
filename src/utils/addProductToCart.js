import { addToCart, handleAddtoCart, handleClonedProduct } from '../redux/slice/cartSlice';
import { minimumOf } from './minimumOrder';

// Puts one product card's product in the cart the way the card's "Add to Cart" does (a signed-in customer's cart is the server's: it must
// take it first; a guest's is here), with the product's smallest order as the quantity. Resolves true when it is in the cart, false when the
// shop did not take it; rejects with the shop's refusal (`errors[0]` / `error`) so the caller can say why.
export const addProductToCart = async (dispatch, isAuthenticated, product) => {
  const quantity = minimumOf(product);
  if (isAuthenticated) {
    const response = await dispatch(
      handleAddtoCart({ product_id: product.id, quantity, variant_id: product.variant_id, action: 'increase' })
    ).unwrap();
    if (!response.success) return false;
  }
  const cloned = dispatch(handleClonedProduct(product, null, null, quantity));
  if (!cloned) return false;
  dispatch(addToCart(cloned));
  return true;
};

// What "Add all to cart" does with each wishlist product: a product that needs a colour or size is chosen on its own page, a sold-out one
// can not be bought, one already in the cart is left alone (adding it again would raise its quantity), the rest are added.
export const sortForAddAll = (products = [], cartItems = []) => {
  // A product without options has one line in the cart, found by its id (a line added from a card has no `variant_id`, a line from the
  // server has one: the id is what both have)
  const inCart = (product) => cartItems.some((item) => item.id === product.id);
  const groups = { add: [], needOptions: 0, soldOut: 0, already: 0 };
  products.forEach((product) => {
    if (product.has_variants) groups.needOptions += 1;
    else if (!product.availability_status) groups.soldOut += 1;
    else if (inCart(product)) groups.already += 1;
    else groups.add.push(product);
  });
  return groups;
};

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// The one sentence the customer reads afterwards: what went in, and what did not and why.
export const addAllSummary = ({ added, already, needOptions, soldOut, refused }) => {
  const parts = [];
  if (added) parts.push(`Added ${plural(added, 'item', 'items')} to your cart.`);
  if (already) parts.push(`${plural(already, 'item is', 'items are')} already in your cart.`);
  if (needOptions) parts.push(`${plural(needOptions, 'item needs', 'items need')} a colour or size: open ${needOptions === 1 ? 'it' : 'them'} to choose.`);
  if (soldOut) parts.push(`${plural(soldOut, 'item is', 'items are')} sold out.`);
  if (refused) parts.push(refused);
  return parts.join(' ') || 'Nothing to add.';
};
