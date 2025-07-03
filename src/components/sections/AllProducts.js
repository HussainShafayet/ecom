import {useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';
import {ProductCard} from '../common';
import {Link} from 'react-router-dom';
import {SectionSkeleton} from '../common/skeleton';

const AllProducts = () => {
  const {isLoading, items:products, error} = useSelector((state)=> state.product);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["products"]);

    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(fetchAllProducts({page_size:12}));
    }, [dispatch]);



    if (sectionError) {
      return <div className="text-center text-red-500 font-semibold py-4">
        {sectionError} - Please try again later.
      </div>;
    }

  return (
    <>
      {isLoading ? <SectionSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :
      <div className="container mx-auto my-12">
        
        {products?.length != 0  &&
        <>
          <h2 className="text-3xl font-bold">All Products</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <span className="text-sm md:text-base text-gray-600">
              Discover the latest trends with our All Products.
            </span>
            <Link
              to="/products"
              className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {products?.map((product) => (
              <ProductCard key={product?.id} product={product} />
            ))}
          </div>
        </>
        }
      </div>
      }
    </>
  );
};

export default AllProducts;
