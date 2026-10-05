import { useEffect } from 'react';
import {ProductSection} from '../common';
import RouteBanner from './RouteBanner';
import {useDispatch, useSelector} from 'react-redux';
import {fetchNewArrivalContent} from '../../redux/slice/contentSlice';
import {SectionSkeleton} from '../common/skeleton';
import {fetchNewArrivalProducts} from '../../redux/slice/product/newArrivalSlice';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

const NewArrival = ({forRoute}) => {
  const newArrivalLoading = useSelector((state) => state.new_arrival.new_arrival_Loading);
  const newArrival = useSelector((state) => state.new_arrival.new_arrival);
  const newArrivalError = useSelector((state) => state.new_arrival.new_arrival_error);

  const sectionError = useSelector((state) => state.globalError.sectionErrors["new-arrival"])

  const dispatch = useDispatch();

  useEffect(() => {
   if (forRoute) {
     dispatch(fetchNewArrivalContent());
   }
   dispatch(fetchNewArrivalProducts({page_size:12}));
  }, [dispatch,forRoute]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['new-arrival', 'new-arrival-content'].forEach((section) => dispatch(clearSectionError(section)));
    if (forRoute) dispatch(fetchNewArrivalContent());
    dispatch(fetchNewArrivalProducts({page_size:12}));
  };

  if (sectionError) {
    return <SectionError message={sectionError} onRetry={retry} />;
  }

  return (

    <>
    {newArrivalLoading ? <SectionSkeleton forRoute={forRoute} /> :
      newArrivalError ? (
      <SectionError message={newArrivalError} onRetry={retry} />
    ) :
      <div className="container mx-auto">

      {forRoute && <RouteBanner />}

        <ProductSection
          title="New Arrival"
          subtitle="The newest products in our store."
          to={forRoute ? undefined : '/products/new-arrival'}
          products={newArrival}
          carousel={!forRoute}
        />

      </div>
      }
    </>
  );
};

export default NewArrival;
