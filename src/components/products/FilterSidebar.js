import React from 'react';
import { filterCount } from '../../utils/productFilters';
import FilterPanel from './FilterPanel';

// The filters on a computer: the same panel, beside the list, and every choice goes straight into the address (the price, when
// the customer leaves its box). It stays in view while the list scrolls.
const FilterSidebar = ({ filters, onChange, onClear }) => (
  <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      {filterCount(filters) > 0 && (
        <button type="button" onClick={onClear} className="min-h-11 text-sm font-medium text-blue-700 underline">Clear all</button>
      )}
    </div>
    <FilterPanel filters={filters} onChange={onChange} commitPrice="blur" />
  </div>
);

export default FilterSidebar;
