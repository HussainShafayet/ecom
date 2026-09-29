import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCategories } from '../../redux/slice/categorySlice';
import CategorySectionSkeleton from '../common/skeleton/CategorySectionSkeleton';
import SectionHeader from '../common/SectionHeader';
import defaultImage from '../../assets/images/default_product_image.jpg';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const CategoriesSection = () => {
  const { isLoading, categories, error } = useSelector((state) => state.category);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["categories"]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllCategories({page:1, page_size:8}));
  }, [dispatch]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['categories'].forEach((section) => dispatch(clearSectionError(section)));
    dispatch(fetchAllCategories({page:1, page_size:8}));
  };

  if (sectionError) {
    return <SectionError message={sectionError} onRetry={retry} />;
  }

  return (
    <>
    {isLoading ? <CategorySectionSkeleton /> :
      error ? (
      <SectionError message={error} onRetry={retry} />
    ) :
      <>
      {categories?.length !== 0  &&
      <div className="container mx-auto my-8">
        <SectionHeader title="Shop by Category" subtitle="Discover the latest trends with Categories." to="/categories" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((category) => (
            <Link
              key={category?.id}
              to={`/products/?category=${category?.slug}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl group block"
            >
              {category?.has_discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-xs px-1 rounded z-10">
                  {category?.discount_amount}{category?.discount_type === 'percentage'?'%':'৳'} OFF
                </span>
              )}
              <img
                src={category?.image || defaultImage}
                alt={category?.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                <span className="text-white font-semibold text-lg truncate">{category?.name}</span>
                <span className="text-white/80 text-xs">Shop now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      }
      </>
    }
    </>
  );
};

export default CategoriesSection;
