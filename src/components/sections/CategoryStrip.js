import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaThLarge } from 'react-icons/fa';
import { fetchAllCategories } from '../../redux/slice/categorySlice';
import defaultImage from '../../assets/images/default_product_image.jpg';
import { discountLabel } from '../../utils/formatPrice';

// How many categories the homepage shows (the rest are behind "All", /categories)
const HOME_CATEGORY_COUNT = 12;

const ITEM = 'flex w-16 shrink-0 flex-col items-center gap-1.5 text-center sm:w-20';
const CIRCLE = 'h-14 w-14 rounded-full sm:h-16 sm:w-16';

// The first thing under the hero: one tap into any category. Round pictures in a row you swipe on a phone (all of it
// shows on a computer), then "All". A category with a discount carries a small pill saying so. Draws nothing until there are
// categories, and nothing if they could not be loaded (the rest of the page does not depend on them). `title` is an optional heading above the row.
const CategoryStrip = ({ title }) => {
  const dispatch = useDispatch();
  const { isLoading, categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchAllCategories({ page: 1, page_size: HOME_CATEGORY_COUNT }));
  }, [dispatch]);

  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <div className="my-4 flex animate-pulse gap-4 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={ITEM}>
            <div className={`${CIRCLE} bg-gray-200`} />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <nav aria-label="Shop by category" className="my-4">
      {title && <h2 className="mb-2 text-base font-semibold text-gray-800">{title}</h2>}
      <ul className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-between">
        {categories.map((category) => (
          <li key={category.id}>
            <Link to={`/products/?category=${category.slug}`} className={`${ITEM} group`}>
              <span className="relative">
                <img
                  src={category.image || defaultImage}
                  alt=""
                  loading="lazy"
                  className={`${CIRCLE} border border-gray-200 object-cover transition-transform group-hover:scale-105`}
                />
                {category.has_discount && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {discountLabel(category.discount_amount, category.discount_type)}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-xs font-medium leading-tight text-gray-700 group-hover:text-blue-600">{category.name}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to="/categories" className={`${ITEM} group`}>
            <span className={`${CIRCLE} flex items-center justify-center bg-blue-50 text-blue-600 transition-transform group-hover:scale-105`}>
              <FaThLarge aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">All</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default CategoryStrip;
