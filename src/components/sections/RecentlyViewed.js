import { useSelector } from 'react-redux';
import { ProductSection } from '../common';
import { selectRecentlyViewed } from '../../redux/slice/recentlyViewedSlice';

// The shopper's own recently viewed products (kept on their device); nothing until they have viewed one.
//   exclude  a product id to leave out: the product page records the product it shows, and must not offer it back to its own shopper
const RecentlyViewed = ({ exclude }) => {
  const items = useSelector(selectRecentlyViewed);

  return (
    <ProductSection
      className="container mx-auto my-6"
      title="Recently Viewed"
      subtitle="Pick up where you left off."
      products={exclude ? items.filter((item) => item?.id !== exclude) : items}
      carousel
    />
  );
};

export default RecentlyViewed;
