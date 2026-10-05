import { useEffect } from 'react';
import {ProductSection} from '../common';
import RouteBanner from './RouteBanner';
import {useDispatch, useSelector} from 'react-redux';
import {fetchBestSellingContent} from '../../redux/slice/contentSlice';
import {SectionSkeleton} from '../common/skeleton';
import {fetchBestSellingProducts} from '../../redux/slice/product/bestSellingSlice';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const BestSelling = ({forRoute}) => {
  const bestSellingLoading = useSelector((state) => state.best_selling.best_selling_Loading);
  const bestSelling = useSelector((state) => state.best_selling.best_selling);
  const bestSellingError = useSelector((state) => state.best_selling.best_selling_error);


   const sectionError = useSelector((state) => state.globalError.sectionErrors["best-sale"]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (forRoute) dispatch(fetchBestSellingContent());
    dispatch(fetchBestSellingProducts({ page_size: 12 }));
  }, [dispatch, forRoute]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['best-sale', 'best-selling-content'].forEach((section) => dispatch(clearSectionError(section)));
    if (forRoute) dispatch(fetchBestSellingContent());
    dispatch(fetchBestSellingProducts({ page_size: 12 }));
  };

  if (sectionError) {
    return <SectionError message={sectionError} onRetry={retry} />;
  }


  return (
    <>
    {bestSellingLoading ? <SectionSkeleton forRoute={forRoute} /> :
      bestSellingError ? (
      <SectionError message={bestSellingError} onRetry={retry} />
    ) :
      <div className="container mx-auto ">
      {forRoute && <RouteBanner />}


        <ProductSection
          title="Best Selling"
          subtitle="What other shoppers buy the most."
          to={forRoute ? undefined : '/products/best-selling'}
          products={bestSelling}
          carousel={!forRoute}
        />

      </div>
    }
    </>
  );
};

export default BestSelling;
