// The products page keeps everything the shopper chose in its address (`?category=..&brands=a,b&min_price=500&ordering=-price`), so a
// link, a refresh and the back button all bring the same list. These read that address and say what is chosen. There is no `page`
// in it: "Load more" adds the next page under the first without changing the address, so an old `?page=3` is ignored.

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
