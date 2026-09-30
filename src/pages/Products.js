import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { Breadcrum, ProductCard, SectionError, Sidebar } from '../components/common';
import { ProductsPageSkeleton } from '../components/common/skeleton';
import { fetchAllProducts, setIsSidebarOpen } from '../redux/slice/productSlice';
import { clearSectionError } from '../redux/slice/globalErrorSlice';
import { filterCount, readFilters, withoutFilters } from '../utils/productFilters';

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

// The shop's products, phone first: a title with how many there are, a Filters button and a Sort box (44 px), the products two to a
// row, and "Load more" under them. What the shopper chose lives in the address (`utils/productFilters`), and ANY change of it is a
// new list from its first page: the old list is never added to (it used to be, so a new sort after "more" showed another page of
// the new list under the old one). While the next page loads the list stays on the screen; while a new list loads, only the
// cards wait (skeleton), the title and the controls stay.
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items: products, isLoading, isLoadingMore, error, hasMore, count, listKey, listPage, isSidebarOpen } = useSelector((state) => state.product);
  const [asked, setAsked] = useState(false); // nothing of an earlier visit's list is drawn before this visit's first request
  const [moreFailed, setMoreFailed] = useState(false);

  const query = searchParams.toString();
  const filters = readFilters(searchParams);
  const chosen = filterCount(filters);

  useEffect(() => {
    setMoreFailed(false);
    dispatch(fetchAllProducts({ ...readFilters(new URLSearchParams(query)), page: 1, key: query }));
    setAsked(true);
  }, [dispatch, query]);

  const retry = () => {
    dispatch(clearSectionError('products'));
    dispatch(fetchAllProducts({ ...filters, page: 1, key: query }));
  };

  const loadMore = async () => {
    setMoreFailed(false);
    const result = await dispatch(fetchAllProducts({ ...filters, page: listPage + 1 }));
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
        onClearFilters={() => setSearchParams(withoutFilters(searchParams))}
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

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={() => dispatch(setIsSidebarOpen(false))}></div>
      )}

      <div className="mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar (Sliding from below the Navbar on mobile) */}
        <div className={`lg:col-span-1 fixed lg:sticky top-0 left-0 h-full bg-white z-20 transform ${
            isSidebarOpen ? 'translate-x-0 mt-[100px]' : '-translate-x-full'
          } transition-transform duration-300 lg:translate-x-0`}>
          <Sidebar onClose={() => dispatch(setIsSidebarOpen(false))} />
        </div>

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
              onClick={() => dispatch(setIsSidebarOpen(true))}
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

          {list}
        </div>
      </div>
    </div>
  );
};

export default Products;
