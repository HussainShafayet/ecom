import React, { useEffect, useId, useState } from 'react';
import { controlClass, describedBy } from '../common';
import { formatPrice } from '../../utils/formatPrice';
import { priceProblem } from '../../utils/productFilters';

const digits = (value) => value.replace(/\D/g, '');

// The price range: two 48 px boxes (From / To, ৳ in front, a number keyboard), digits only. `commit`: 'change' tells the panel at
// every key (the phone's sheet keeps a draft until Show results), 'blur' only when the customer leaves a box or presses Enter
// (the desktop's sidebar filters as soon as it is told, and a request per key would be too many). A range the wrong way round
// is said under the boxes and, on the desktop, not told to anyone (the phone's sheet refuses Show results for it).
const PriceFilter = ({ min, max, bounds, commit, onChange }) => {
  const uid = useId();
  const [low, setLow] = useState(min || '');
  const [high, setHigh] = useState(max || '');

  useEffect(() => { // the address or the panel changed it (a chip was removed, Clear all)
    setLow(min || '');
    setHigh(max || '');
  }, [min, max]);

  const problem = priceProblem({ min_price: low, max_price: high });
  const tell = (nextLow, nextHigh) => onChange({ min_price: nextLow || null, max_price: nextHigh || null });
  const type = (setter, other) => (event) => {
    const value = digits(event.target.value);
    setter(value);
    if (commit === 'change') tell(...other(value));
  };
  const leave = () => { if (commit === 'blur' && !problem) tell(low, high); };
  const enter = (event) => {
    if (event.key === 'Enter' && commit === 'blur') {
      event.preventDefault();
      if (!problem) tell(low, high);
    }
  };

  const box = (name, label, value, setter, other) => (
    <div>
      <label htmlFor={`${uid}-${name}`} className="mb-1 block text-sm font-medium text-gray-800">{label}</label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">৳</span>
        <input
          id={`${uid}-${name}`} data-filter={`${name}-price`} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" enterKeyHint="done"
          value={value} onChange={type(setter, other)} onBlur={leave} onKeyDown={enter}
          aria-invalid={Boolean(problem)} aria-describedby={describedBy(`${uid}-problem`, problem)}
          className={`${controlClass(problem)} pl-8`}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {box('min', 'From', low, setLow, (value) => [value, high])}
        {box('max', 'To', high, setHigh, (value) => [low, value])}
      </div>
      {problem && <p id={`${uid}-problem`} role="alert" className="mt-1 text-sm text-red-600">{problem}</p>}
      {!problem && bounds?.max_range > 0 && (
        <p className="mt-1 text-xs text-gray-500">Prices here run from {formatPrice(bounds.min_range || 0)} to {formatPrice(bounds.max_range)}.</p>
      )}
    </div>
  );
};

export default PriceFilter;
