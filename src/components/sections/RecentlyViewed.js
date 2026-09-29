import { useSelector } from 'react-redux';
import { ProductSection } from '../common';
import { selectRecentlyViewed } from '../../redux/slice/recentlyViewedSlice';

// The shopper's own recently viewed products (kept on their device); nothing until they have viewed one.
const RecentlyViewed = () => {
  const items = useSelector(selectRecentlyViewed);

  return (
    <ProductSection
      className="container mx-auto my-6"
      title="Recently Viewed"
      subtitle="Pick up where you left off."
      products={items}
      carousel
    />
  );
};

export default RecentlyViewed;
