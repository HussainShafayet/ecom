import {useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';
import {ProductSection} from '../common';
import {SectionSkeleton} from '../common/skeleton';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const AllProducts = () => {
  const {isLoading, items:products, error} = useSelector((state)=> state.product);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["products"]);

    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(fetchAllProducts({page_size:12}));
    }, [dispatch]);



    // "Try again" on the error card: forget the error and ask for this part again
    const retry = () => {
      ['products'].forEach((section) => dispatch(clearSectionError(section)));
      dispatch(fetchAllProducts({page_size:12}));
    };

    if (sectionError) {
      return <SectionError message={sectionError} onRetry={retry} />;
    }

  return (
    <>
      {isLoading ? <SectionSkeleton /> :
      error ? (
      <SectionError message={error} onRetry={retry} />
    ) :
      <div className="container mx-auto my-12">
        <ProductSection className="" title="All Products" subtitle="Browse everything in our store." to="/products" products={products} />
      </div>
      }
    </>
  );
};

export default AllProducts;
