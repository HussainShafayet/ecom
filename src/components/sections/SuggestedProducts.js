import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProductSection } from '../common';
import { SectionSkeleton } from '../common/skeleton';
import { fetchBestSellingProducts } from '../../redux/slice/product/bestSellingSlice';

// "Where to look next" for a page that would otherwise be a dead end (page not found, order placed, an empty wishlist): the shop's best
// sellers under the heading the page gives. A suggestion, not part of the page: a placeholder while it loads, and nothing at all when it
// could not be loaded or there is nothing to suggest. It sets no page title (the Home section of the same list does, and would take this
// page's name away). Put it in a `LazySection` so a phone does not load it until it is near.
const SuggestedProducts = ({ title = 'You may also like', subtitle = 'What other shoppers buy the most.' }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.best_selling?.best_selling_Loading);
  const products = useSelector((state) => state.best_selling?.best_selling);

  useEffect(() => {
    dispatch(fetchBestSellingProducts({ page_size: 12 }));
  }, [dispatch]);

  if (loading && !products?.length) return <SectionSkeleton />;
  return <ProductSection title={title} subtitle={subtitle} to="/products/best-selling" products={products} carousel />;
};

export default SuggestedProducts;
