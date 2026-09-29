import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';
import {ProductSection} from '../common';
import {SectionSkeleton} from '../common/skeleton';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const PAGE_SIZE = 12;

// The homepage's "All Products": the first page, then "Load more" adds the next one under it without leaving the page.
const AllProducts = () => {
  const {isLoading, items:products, error, hasMore} = useSelector((state)=> state.product);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["products"]);

    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreFailed, setMoreFailed] = useState(false);
    // A failure only replaces the section when there is nothing to show; a failed "Load more" keeps the products already on screen
    const nothingToShow = !products || products.length === 0;

    useEffect(() => {
      dispatch(fetchAllProducts({page_size:PAGE_SIZE}));
    }, [dispatch]);

    // "Try again" on the error card: forget the error and ask for this part again
    const retry = () => {
      ['products'].forEach((section) => dispatch(clearSectionError(section)));
      setPage(1);
      setMoreFailed(false);
      dispatch(fetchAllProducts({page_size:PAGE_SIZE}));
    };

    const loadMore = async () => {
      const next = page + 1;
      setLoadingMore(true);
      setMoreFailed(false);
      const result = await dispatch(fetchAllProducts({page: next, page_size: PAGE_SIZE}));
      setLoadingMore(false);
      if (fetchAllProducts.rejected.match(result)) setMoreFailed(true);
      else setPage(next);
    };

    if (sectionError && nothingToShow) {
      return <SectionError message={sectionError} onRetry={retry} />;
    }

  return (
    <>
      {isLoading && nothingToShow ? <SectionSkeleton /> :
      error && nothingToShow ? (
      <SectionError message={error} onRetry={retry} />
    ) :
      <div className="container mx-auto my-12">
        <ProductSection className="" title="All Products" subtitle="Browse everything in our store." to="/products" products={products} />
        {!nothingToShow && hasMore && (
          <div className="mt-6 text-center">
            {moreFailed && <p role="alert" className="mb-2 text-sm text-red-600">We couldn&apos;t load more products. Please try again.</p>}
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-lg border border-blue-600 px-8 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
      }
    </>
  );
};

export default AllProducts;
