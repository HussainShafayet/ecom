import { useEffect } from 'react';
import {ProductSection} from '../common';
import RouteBanner from './RouteBanner';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFeaturedProducts} from '../../redux/slice/productSlice';
import {fetchFeaturedContent} from '../../redux/slice/contentSlice';
import {SectionSkeleton} from '../common/skeleton';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const FeaturedProducts = ({forRoute}) => {
  const {featured_Loading, featured:products, featured_error} = useSelector((state)=> state.product);
  const sectionError = useSelector((state) => state.globalError.sectionErrors["featured"]);



  const dispatch = useDispatch();

  useEffect(() => {
    if (forRoute) {
      dispatch(fetchFeaturedContent());
    }
   dispatch(fetchFeaturedProducts({page_size:12}));
  }, [dispatch, forRoute]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['featured', 'featured-content'].forEach((section) => dispatch(clearSectionError(section)));
    if (forRoute) dispatch(fetchFeaturedContent());
    dispatch(fetchFeaturedProducts({page_size:12}));
  };

  if (sectionError) {
    return <SectionError message={sectionError} onRetry={retry} />;
  }


  return (
    <>
    {featured_Loading ? <SectionSkeleton forRoute={forRoute} /> :
      featured_error ? (
      <SectionError message={featured_error} onRetry={retry} />
    ) :
      <div className="container mx-auto">
        {forRoute && <RouteBanner />}

        <ProductSection
          title="Featured Products"
          subtitle="Products we recommend."
          to={forRoute ? undefined : '/products/featured'}
          products={products}
          carousel={!forRoute}
        />

      </div>
    }
    </>
  );
};

export default FeaturedProducts;
