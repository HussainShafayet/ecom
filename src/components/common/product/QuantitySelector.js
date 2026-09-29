import React, { useEffect, useState } from 'react';

// How many to buy: − and + (40 px), and the number itself can be typed. `onChange(n)` is told every valid number; the owner
// (productSlice `setQuantity`, the cart's line update) keeps it between the product's minimum order and the cart's limit and
// gives back what it kept. On the product page it has a "Quantity" label and says the minimum order under itself; on a cart
// line (`label={null}`, `showMinimum={false}`) the line says it, and `name` tells screen readers which line this is.
const QuantitySelector = ({ quantity, minimum = 1, onChange, label = 'Quantity', showMinimum = true, name }) => {
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
  const of = name ? ` of ${name}` : '';
  return (
    <div>
      <div className="flex items-center gap-3">
        {label && <span className="text-sm text-gray-600">{label}</span>}
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
          <button type="button" aria-label={`Decrease quantity${of}`} disabled={quantity <= minimum} onClick={() => onChange(quantity - 1)} className={BUTTON}>−</button>
          <input
            type="text"
            inputMode="numeric"
            aria-label={`Quantity${of}`}
            value={draft}
            onChange={type}
            onBlur={() => setDraft(String(quantity))}
            className="h-10 w-14 border-x border-gray-300 text-center text-base"
          />
          <button type="button" aria-label={`Increase quantity${of}`} onClick={() => onChange(quantity + 1)} className={BUTTON}>+</button>
        </div>
      </div>
      {showMinimum && minimum > 1 && <p className="mt-1 text-xs text-gray-500">Minimum order: {minimum}</p>}
    </div>
  );
};

export default QuantitySelector;
