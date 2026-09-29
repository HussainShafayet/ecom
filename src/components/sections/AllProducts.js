import {useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';
import {ProductSection} from '../common';
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
        <ProductSection className="" title="All Products" subtitle="Browse everything in our store." to="/products" products={products} />
      </div>
      }
    </>
  );
};

export default AllProducts;
