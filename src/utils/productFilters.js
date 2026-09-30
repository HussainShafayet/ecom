// The products page keeps everything the shopper chose in its address (`?category=..&brands=a,b&min_price=500&ordering=-price`), so a
// link, a refresh and the back button all bring the same list. These read that address and say what is chosen. There is no `page`
// in it: "Load more" adds the next page under the first without changing the address, so an old `?page=3` is ignored.

import { formatPrice } from './formatPrice';

export const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 120;

const list = (value) => (value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []);

// What the products request is asked for, from the address (a URLSearchParams)
export const readFilters = (params) => {
  const size = parseInt(params.get('page_size'), 10);
  return {
    category: params.get('category') || null,
    brands: list(params.get('brands')),
    tags: list(params.get('tags')),
    colors: list(params.get('colors')),
    sizes: list(params.get('sizes')),
    min_price: params.get('min_price') || null,
    max_price: params.get('max_price') || null,
    discount_type: params.get('discount_type') || null,
    discount_value: params.get('discount_value') || null,
    search: params.get('search') || '',
    ordering: params.get('ordering') || '',
    page_size: size > 0 ? Math.min(size, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE,
  };
};

// How many things are filtered (the number on the Filters button): the category, each brand / tag / colour / size, the price
// range as one, the discount as one. Search and sorting are not filters.
export const filterCount = (filters) => (
  (filters.category ? 1 : 0)
  + filters.brands.length + filters.tags.length + filters.colors.length + filters.sizes.length
  + (filters.min_price || filters.max_price ? 1 : 0)
  + (filters.discount_value ? 1 : 0)
);

// The address without any filter: what "Clear filters" goes to. The search, the sorting and the page size stay.
export const withoutFilters = (params) => {
  const kept = new URLSearchParams();
  ['search', 'ordering', 'page_size'].forEach((name) => {
    if (params.get(name)) kept.set(name, params.get(name));
  });
  return kept;
};

// ---- the filters as the filter panel edits them ----------------------------------------------------------------------------

// Nothing chosen. A filter is `{category, brands, tags, colors, sizes, min_price, max_price, discount_type, discount_value}`: the
// fields of `readFilters` that narrow the list (not the search, the sort or the page size).
export const emptyFilters = () => ({
  category: null, brands: [], tags: [], colors: [], sizes: [], min_price: null, max_price: null, discount_type: null, discount_value: null,
});

// The address for `filters`: the filter parts replaced, the search, the sort and the page size kept, no `page`.
export const filtersToParams = (params, filters) => {
  const next = new URLSearchParams(params);
  next.delete('page');
  const set = (name, value) => (value ? next.set(name, value) : next.delete(name));
  set('category', filters.category);
  ['brands', 'tags', 'colors', 'sizes'].forEach((group) => set(group, filters[group].join(',')));
  set('min_price', filters.min_price);
  set('max_price', filters.max_price);
  set('discount_type', filters.discount_value ? filters.discount_type : null); // the two go together
  set('discount_value', filters.discount_value);
  return next;
};

// "The lowest price cannot be more than the highest", or '' when the range is fine (or only one end is given)
export const priceProblem = (filters) => (
  filters.min_price && filters.max_price && Number(filters.min_price) > Number(filters.max_price)
    ? 'The lowest price cannot be more than the highest' : ''
);

// A category (`{name, slug, children}`) by its slug anywhere in the shop's tree, and the slugs above it
export const findCategory = (categories, slug) => {
  for (const category of categories || []) {
    if (category.slug === slug) return category;
    const inside = findCategory(category.children, slug);
    if (inside) return inside;
  }
  return null;
};
export const categoryAncestors = (categories, slug, above = []) => {
  for (const category of categories || []) {
    if (category.slug === slug) return above;
    const found = categoryAncestors(category.children, slug, [...above, category.slug]);
    if (found) return found;
  }
  return null;
};

// "25% off" / "৳150 off": what the discount filter says (the badge on a card shouts it, "25% OFF")
export const discountText = (value, type) => (type === 'percentage' ? `${value}% off` : `${formatPrice(value)} off`);

// What is chosen, one chip each (the row under the controls): `{key, label, remove(filters) -> filters}`
export const filterChips = (filters, categories) => {
  const chips = [];
  if (filters.category) {
    chips.push({ key: 'category', label: findCategory(categories, filters.category)?.name || filters.category.replace(/-/g, ' '), remove: (current) => ({ ...current, category: null }) });
  }
  ['brands', 'tags', 'colors', 'sizes'].forEach((group) => {
    filters[group].forEach((value) => {
      chips.push({ key: `${group}:${value}`, label: value, remove: (current) => ({ ...current, [group]: current[group].filter((item) => item !== value) }) });
    });
  });
  if (filters.min_price || filters.max_price) {
    const from = formatPrice(filters.min_price);
    const to = formatPrice(filters.max_price);
    chips.push({
      key: 'price',
      label: from && to ? `${from} – ${to}` : from ? `From ${from}` : `Up to ${to}`,
      remove: (current) => ({ ...current, min_price: null, max_price: null }),
    });
  }
  if (filters.discount_value) {
    chips.push({ key: 'discount', label: discountText(filters.discount_value, filters.discount_type), remove: (current) => ({ ...current, discount_type: null, discount_value: null }) });
  }
  return chips;
};
