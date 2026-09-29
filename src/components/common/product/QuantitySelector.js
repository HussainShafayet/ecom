import React, { useEffect, useState } from 'react';

// How many to buy: − and + (40 px), and the number itself can be typed. `onChange(n)` is told every valid number; the owner
// (productSlice `setQuantity`) keeps it between the product's minimum order and the cart's limit and gives back what it kept.
const QuantitySelector = ({ quantity, minimum = 1, onChange }) => {
  const [draft, setDraft] = useState(String(quantity));
  // What was kept (or changed by − and +) is what the box shows
  useEffect(() => setDraft(String(quantity)), [quantity]);

  const type = (event) => {
    const digits = event.target.value.replace(/\D/g, '');
    setDraft(digits); // may be empty while the customer retypes it
    const wanted = parseInt(digits, 10);
    if (wanted >= minimum) onChange(wanted);
  };

  const BUTTON = 'h-10 w-10 text-lg font-semibold text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300';
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= minimum} onClick={() => onChange(quantity - 1)} className={BUTTON}>−</button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Quantity"
            value={draft}
            onChange={type}
            onBlur={() => setDraft(String(quantity))}
            className="h-10 w-14 border-x border-gray-300 text-center text-base"
          />
          <button type="button" aria-label="Increase quantity" onClick={() => onChange(quantity + 1)} className={BUTTON}>+</button>
        </div>
      </div>
      {minimum > 1 && <p className="mt-1 text-xs text-gray-500">Minimum order: {minimum}</p>}
    </div>
  );
};

export default QuantitySelector;
