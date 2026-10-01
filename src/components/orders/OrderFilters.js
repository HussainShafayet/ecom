import React from 'react';

// What "My orders" can be narrowed to. `show` is what goes in the address (?show=active), `status` what the backend is asked for
// (GET /orders/?status=, one status or several with commas), `empty` what an empty list says.
export const ORDER_FILTERS = [
  { show: '', label: 'All', status: '', empty: 'You have not placed any order yet.' },
  { show: 'active', label: 'On the way', status: 'pending,confirmed,paid,shipped', empty: 'No orders on the way.' },
  { show: 'delivered', label: 'Delivered', status: 'delivered', empty: 'No delivered orders yet.' },
  { show: 'closed', label: 'Cancelled', status: 'cancelled,returned,refunded', empty: 'No cancelled or returned orders.' },
];

// The filter an address names; anything else is "All"
export const orderFilterFor = (show) => ORDER_FILTERS.find((filter) => filter.show === show) || ORDER_FILTERS[0];

// A row of pills you swipe on a phone, each a 44 px button that says whether it is on (`aria-pressed`).
const OrderFilters = ({ current, onChange }) => (
  <div role="group" aria-label="Show orders" className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {ORDER_FILTERS.map((filter) => {
      const on = filter.show === current.show;
      return (
        <button
          key={filter.show}
          type="button"
          aria-pressed={on}
          onClick={() => onChange(filter)}
          className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          {filter.label}
        </button>
      );
    })}
  </div>
);

export default OrderFilters;
