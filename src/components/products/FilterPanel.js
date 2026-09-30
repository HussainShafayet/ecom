import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SectionError } from '../common';
import { SidebarSkeleton } from '../common/skeleton';
import { fetchShopContent } from '../../redux/slice/contentSlice';
import { categoryAncestors, discountText } from '../../utils/productFilters';
import CategoryTree from './CategoryTree';
import FilterSection from './FilterSection';
import PriceFilter from './PriceFilter';

const SHOWN = 8; // a long list (the shop's brands) shows this many, and "Show all" for the rest

const toggle = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

// A long list of names as 48 px checkbox rows (the whole row is the label: a 16 px box is not a thing to hit). What is chosen is
// always shown, even past the first few.
const CheckList = ({ items, chosen, onToggle }) => {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.filter((item, index) => index < SHOWN || chosen.includes(item));
  return (
    <div>
      <ul>
        {shown.map((item) => (
          <li key={item}>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-gray-50">
              <input type="checkbox" checked={chosen.includes(item)} onChange={() => onToggle(item)} className="h-5 w-5 shrink-0 accent-blue-600" />
              <span className="min-w-0 flex-1 break-words text-gray-800">{item}</span>
            </label>
          </li>
        ))}
      </ul>
      {items.length > shown.length && (
        <button type="button" onClick={() => setAll(true)} className="min-h-11 px-2 text-sm font-medium text-blue-700 underline">Show all {items.length}</button>
      )}
      {all && items.length > SHOWN && (
        <button type="button" onClick={() => setAll(false)} className="min-h-11 px-2 text-sm font-medium text-blue-700 underline">Show fewer</button>
      )}
    </div>
  );
};

// Sizes and colours are things to tap, drawn as 44 px buttons that say whether they are on (`aria-pressed`)
const Chip = ({ on, onClick, children }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={`flex h-11 min-w-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium ${on ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'}`}
  >
    {children}
  </button>
);

// Every way to narrow the list, one group under another. It edits `filters` (what is chosen) and hands each change to `onChange`
// with the new `filters`; it keeps nothing of its own, so the phone's sheet (a draft until Show results) and the desktop's sidebar
// (the address itself) are the same panel. Groups the shop has nothing for are not drawn; a group with something chosen is open.
const FilterPanel = ({ filters, onChange, commitPrice = 'change' }) => {
  const dispatch = useDispatch();
  const { categories, brands, tags, colors, sizes, price_range: bounds, discounts, shopLoaded, shopError } = useSelector((state) => state.content);
  const set = (patch) => onChange({ ...filters, ...patch });

  if (!shopLoaded) {
    return shopError
      ? <SectionError message={shopError} onRetry={() => dispatch(fetchShopContent())} />
      : <SidebarSkeleton />;
  }

  const priceChosen = filters.min_price || filters.max_price ? 1 : 0;
  const discountChosen = filters.discount_value ? 1 : 0;

  return (
    <div>
      {categories?.length > 0 && (
        <FilterSection title="Category" count={filters.category ? 1 : 0} defaultOpen>
          <CategoryTree
            categories={categories}
            selected={filters.category}
            opened={filters.category ? categoryAncestors(categories, filters.category) || [] : []}
            onSelect={(category) => set({ category })}
          />
        </FilterSection>
      )}

      <FilterSection title="Price" count={priceChosen} defaultOpen>
        <PriceFilter
          min={filters.min_price}
          max={filters.max_price}
          bounds={bounds}
          commit={commitPrice}
          onChange={set}
        />
      </FilterSection>

      {brands?.length > 0 && (
        <FilterSection title="Brand" count={filters.brands.length} defaultOpen={filters.brands.length > 0}>
          <CheckList items={brands} chosen={filters.brands} onToggle={(brand) => set({ brands: toggle(filters.brands, brand) })} />
        </FilterSection>
      )}

      {colors?.length > 0 && (
        <FilterSection title="Color" count={filters.colors.length} defaultOpen={filters.colors.length > 0}>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Chip key={color.name} on={filters.colors.includes(color.name)} onClick={() => set({ colors: toggle(filters.colors, color.name) })}>
                <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border border-gray-300" style={{ background: color.hex_code }} />
                {color.name}
              </Chip>
            ))}
          </div>
        </FilterSection>
      )}

      {sizes?.length > 0 && (
        <FilterSection title="Size" count={filters.sizes.length} defaultOpen={filters.sizes.length > 0}>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Chip key={size} on={filters.sizes.includes(size)} onClick={() => set({ sizes: toggle(filters.sizes, size) })}>{size}</Chip>
            ))}
          </div>
        </FilterSection>
      )}

      {discounts?.length > 0 && (
        <FilterSection title="Discount" count={discountChosen} defaultOpen={discountChosen > 0}>
          <div role="radiogroup" aria-label="Discount">
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-gray-50">
              <input type="radio" name="discount" checked={!filters.discount_value} onChange={() => set({ discount_type: null, discount_value: null })} className="h-5 w-5 shrink-0 accent-blue-600" />
              <span className="text-gray-800">Any</span>
            </label>
            {discounts.map((discount) => (
              <label key={`${discount.discount_type}-${discount.value}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-gray-50">
                <input
                  type="radio"
                  name="discount"
                  checked={String(filters.discount_value) === String(discount.value) && filters.discount_type === discount.discount_type}
                  onChange={() => set({ discount_type: discount.discount_type, discount_value: String(discount.value) })}
                  className="h-5 w-5 shrink-0 accent-blue-600"
                />
                <span className="text-gray-800">{discountText(discount.value, discount.discount_type)}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {tags?.length > 0 && (
        <FilterSection title="Tag" count={filters.tags.length} defaultOpen={filters.tags.length > 0}>
          <CheckList items={tags} chosen={filters.tags} onToggle={(tag) => set({ tags: toggle(filters.tags, tag) })} />
        </FilterSection>
      )}
    </div>
  );
};

export default FilterPanel;
