import { useSelector } from 'react-redux';
import { ProductCard } from '../common';
import { selectRecentlyViewed } from '../../redux/slice/recentlyViewedSlice';

const RecentlyViewed = () => {
  const items = useSelector(selectRecentlyViewed);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto my-5">
      <h2 className="text-3xl font-bold">Recently Viewed</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <span className="text-sm md:text-base text-gray-600">
          Pick up where you left off.
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((product) => (
          <ProductCard key={product?.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
