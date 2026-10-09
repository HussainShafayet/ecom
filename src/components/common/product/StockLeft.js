import React from 'react';

// "Only 3 left": the backend says it (stock_left) only when a few are in stock, and never gives a well-stocked product's real
// number away, so draw nothing for null.
const StockLeft = ({ count }) => (
  count > 0 ? <p className="text-sm font-semibold text-red-600">Only {count} left in stock - order soon</p> : null
);

export default StockLeft;
