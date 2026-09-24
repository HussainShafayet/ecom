import React, {useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import ErrorDisplay from '../common/ErrorDisplay';

// Why the shop refused the order (the backend's sentences: a minimum order, not enough stock, a product that is gone,
// delivery not available ...), shown where the customer just pressed "Place Order". Every problem is listed at once and
// nothing was ordered, so the way forward is the cart. Scrolled into view: the button is at the bottom of a long form.
const CheckoutErrors = ({ errors }) => {
  const box = useRef(null);
  const list = Array.isArray(errors) ? errors : errors ? [String(errors)] : [];

  useEffect(() => {
    if (list.length > 0 && box.current?.scrollIntoView) {
      box.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [list.length, errors]);

  if (list.length === 0) return null;
  return (
    <div ref={box} role="alert">
      <ErrorDisplay errors={list} />
      <p className="text-sm text-gray-600 -mt-2 mb-3">
        Nothing was ordered. <Link to="/cart" className="text-blue-500 underline">Go back to your cart</Link> to change it, then try again.
      </p>
    </div>
  );
};

export default CheckoutErrors;
