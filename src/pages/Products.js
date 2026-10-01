import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { Breadcrum, ProductCard, SectionError } from '../components/common';
import { ActiveFilters, FilterSheet, FilterSidebar } from '../components/products';
import { ProductsPageSkeleton } from '../components/common/skeleton';
import { fetchAllProducts, restoreProductsList } from '../redux/slice/productSlice';
import { fetchShopContent } from '../redux/slice/contentSlice';
import { clearSectionError } from '../redux/slice/globalErrorSlice';
import useMediaQuery from '../hooks/useMediaQuery';
import { filterChips, filterCount, filtersToParams, readFilters, withoutFilters } from '../utils/productFilters';
import { recallScroll, rememberScroll, restoreScroll } from '../utils/scrollMemory';

// How long a list that was left (for a product) is still shown as it was when the shopper comes Back to it
const LIST_FRESH_MS = 5 * 60 * 1000;

const nothingYet = (items) => !items || items.length === 0;

// What the shopper can sort by. `discount_price` is what they pay (the backend's `price` is the price before a discount, which
// reads wrong next to a sale), so that is "Price". An address that carries one of the other orderings still shows it in the box.
const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'discount_price', label: 'Price: Low to High' },
  { value: '-discount_price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top rated' },
];
const OTHER_SORTS = {
  price: 'List price: Low to High',
  '-price': 'List price: High to Low',
  rating: 'Lowest rated first',
};

// "men-shirts" -> "Men shirts": the title of a category page, until the shop's own name for it is at hand
const humanize = (slug) => slug.replace(/-/g, ' ');

// When nothing came back: which of three reasons it is (a search, filters, or simply an empty shop) says what to do next
const NoProducts = ({ search, chosen, onClearFilters, onSeeAll }) => (
  <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-10 text-center shadow-sm">
    <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600"><FaSearch /></span>
    <h2 className="mt-3 break-words font-semibold text-gray-900">
      {chosen ? 'No products match these filters' : search ? `No results for “${search}”` : 'No products here yet'}
    </h2>
    <p className="mt-1 text-sm text-gray-600">
      {chosen ? 'Try taking a filter off.' : search ? 'Check the spelling or try a shorter word.' : 'Please check back soon.'}
    </p>
    {chosen && <button type="button" onClick={onClearFilters} className="mt-4 h-12 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">Clear filters</button>}
    {!chosen && search && <button type="button" onClick={onSeeAll} className="mt-4 h-12 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">See all products</button>}
    {!chosen && !search && <Link to="/" className="mt-4 flex h-12 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">Back to home</Link>}
  </div>
);

// The shop's products, phone first: a title with how many there are, a Filters button (a sheet from the bottom; beside the list from
// `lg`) and a Sort box (44 px), a chip for each chosen filter, the products two to a row, and "Load more" under them. What the shopper chose lives in the address (`utils/productFilters`), and ANY change of it is a
// new list from its first page: the old list is never added to (it used to be, so a new sort after "more" showed another page of
// the new list under the old one). While the next page loads the list stays on the screen; while a new list loads, only the
// cards wait (skeleton), the title and the controls stay.
// Back from a product (the browser's Back, not a new visit) to the same list, loaded within the last few minutes: it comes back as it
// was, every page that had been loaded and the same scroll, with no request and no skeleton. A new visit (a link, a changed address)
// is still a new list from its first page. (The product page and the cart load their own products into the same `items`, so the list
// is kept apart in the slice: `savedList`.)
const Products = ({ scrollContainerRef }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { items: products, isLoading, isLoadingMore, error, hasMore, count, listKey, listPage, savedList } = useSelector((state) => state.product);
  const categories = useSelector((state) => state.content.categories);
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // the filters are a sidebar there, a sheet on a phone
  const [sheetOpen, setSheetOpen] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);

  const query = searchParams.toString();
  const filters = readFilters(searchParams);
  const chosen = filterCount(filters);

  // decided once, as the page opens: is this a Back to a list that is still good?
  const [cameBack] = useState(
    () => navigationType === 'POP' && savedList?.key === query && savedList.items.length > 0 && Date.now() - savedList.at < LIST_FRESH_MS
  );
  const [asked, setAsked] = useState(cameBack); // nothing of an earlier visit's list is drawn before this visit's first request
  const keepFor = useRef(cameBack ? query : null); // the address whose list is already there: no request for it, once

  useEffect(() => {
    setMoreFailed(false);
    if (keepFor.current === query) {
      setAsked(true);
      return;
    }
    keepFor.current = null; // any other address is a new list
    dispatch(fetchAllProducts({ ...readFilters(new URLSearchParams(query)), page: 1, key: query }));
    setAsked(true);
  }, [dispatch, query]);

  // Back: the saved list is `items` again before the first paint (a state change made in a layout effect is drawn before the screen is)
  useLayoutEffect(() => {
    if (cameBack) dispatch(restoreProductsList());
  }, [cameBack, dispatch]);

  // ...and the scroll is put back once it is drawn (the page scrolls inside Layout's box, which `ScrollToTop` leaves alone then). A list
  // that has to be asked for again starts at the top.
  const ready = asked && listKey === query && !nothingYet(products); // this address's list is what is on the screen
  const scrolled = useRef(false);
  useLayoutEffect(() => {
    const saved = navigationType === 'POP' ? recallScroll(location.key) : undefined;
    if (saved === undefined || scrolled.current) return;
    if (!cameBack) {
      scrolled.current = true;
      restoreScroll(scrollContainerRef?.current, 0);
    } else if (ready) {
      scrolled.current = true;
      restoreScroll(scrollContainerRef?.current, saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Where the shopper was, noted as they open a product (reading it as the page is left is too late: the product's page has replaced
  // this one, and the box has already been cut to its height)
  const leaving = () => rememberScroll(location.key, scrollContainerRef?.current?.scrollTop ?? 0);

  useEffect(() => {
    dispatch(fetchShopContent()); // what there is to filter by
  }, [dispatch]);

  const showFilters = (next) => setSearchParams(filtersToParams(searchParams, next)); // the address is the one place they live
  const clearFilters = () => setSearchParams(withoutFilters(searchParams));

  const retry = () => {
    dispatch(clearSectionError('products'));
    dispatch(fetchAllProducts({ ...filters, page: 1, key: query }));
  };

  const loadMore = async () => {
    setMoreFailed(false);
    const result = await dispatch(fetchAllProducts({ ...filters, page: listPage + 1, key: query }));
    if (fetchAllProducts.rejected.match(result)) setMoreFailed(true);
  };

  const changeSort = (event) => {
    const next = new URLSearchParams(searchParams);
    if (event.target.value) next.set('ordering', event.target.value);
    else next.delete('ordering');
    next.delete('page');
    setSearchParams(next);
  };

  const title = filters.search ? `Results for “${filters.search}”` : filters.category ? humanize(filters.category) : 'All products';
  const fresh = asked && listKey === query; // `items` is THIS address's list, not one another page loaded
  const nothing = !products || products.length === 0;
  const sorts = filters.ordering in OTHER_SORTS ? [...SORTS, { value: filters.ordering, label: OTHER_SORTS[filters.ordering] }] : SORTS;

  let list;
  if (!fresh || (isLoading && !isLoadingMore)) {
    list = <ProductsPageSkeleton />;
  } else if (error && nothing) {
    list = <SectionError message={error} onRetry={retry} />;
  } else if (nothing) {
    list = (
      <NoProducts
        search={filters.search}
        chosen={chosen > 0}
        onClearFilters={clearFilters}
        onSeeAll={() => setSearchParams({})}
      />
    );
  } else {
    list = (
      <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-6 text-center">
          {hasMore ? (
            <>
              {moreFailed && <p role="alert" className="mb-2 text-sm text-red-600">We couldn&apos;t load more products. Please try again.</p>}
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="h-12 w-full rounded-lg border border-blue-600 px-10 font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </button>
            </>
          ) : (
            <p className="my-4 text-gray-500">You&apos;ve seen every product here.</p>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Breadcrum />

      <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-5">
        {isDesktop && (
          <aside className="self-start lg:col-span-1">
            <FilterSidebar filters={filters} onChange={showFilters} onClear={clearFilters} />
          </aside>
        )}

        <div className="min-w-0 lg:col-span-4">
          <div className="mb-3">
            <h1 className="break-words text-xl font-bold capitalize sm:text-2xl">{title}</h1>
            {fresh && !isLoading && typeof count === 'number' && (
              <p className="text-sm text-gray-500">{count} {count === 1 ? 'product' : 'products'}</p>
            )}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 lg:flex lg:justify-end">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 lg:hidden"
            >
              <FaFilter aria-hidden="true" />
              Filters
              {chosen > 0 && (
                <span aria-label={`${chosen} chosen`} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">{chosen}</span>
              )}
            </button>

            <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-400">
              <label htmlFor="sort-by" className="shrink-0 text-sm text-gray-500">Sort</label>
              <select id="sort-by" value={filters.ordering} onChange={changeSort} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-900 focus:outline-none">
                {sorts.map((sort) => (
                  <option key={sort.value} value={sort.value}>{sort.label}</option>
                ))}
              </select>
            </div>
          </div>

          <ActiveFilters chips={filterChips(filters, categories)} onRemove={(chip) => showFilters(chip.remove(filters))} onClear={clearFilters} />

          <div onClickCapture={leaving}>{list}</div>
        </div>
      </div>

      {sheetOpen && !isDesktop && (
        <FilterSheet
          filters={filters}
          scrollRef={scrollContainerRef}
          onClose={() => setSheetOpen(false)}
          onApply={(next) => { showFilters(next); setSheetOpen(false); }}
        />
      )}
    </div>
  );
};

export default Products;
