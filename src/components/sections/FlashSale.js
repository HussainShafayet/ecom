import React, {useCallback, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {ProductSection} from '../common';
import FlashSaleCountdown from './FlashSaleCountdown';
import RouteBanner from './RouteBanner';
import {fetchFlashSaleContent} from '../../redux/slice/contentSlice';
import {SectionSkeleton} from '../common/skeleton';
import {fetchFlashSaleProducts} from '../../redux/slice/product/flashSaleSlice';
import {SectionError} from '../common';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';

// What the flash sale page says when the shop has nothing to show because of the sale's window: it has not started (with the time to
// its start) or it is over. Not drawn on the homepage, where the whole section simply is not there.
const NotLiveNotice = ({sale, onStart}) => (
  <div className="my-6 flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center shadow-sm">
    {sale.startsAt ? (
      <>
        <h2 className="text-lg font-bold text-gray-900">The flash sale has not started yet</h2>
        <p className="mt-1 text-sm text-gray-600">Come back when the clock runs out.</p>
        <div className="mt-3"><FlashSaleCountdown endsAt={sale.startsAt} label="Starts in" onEnd={onStart} /></div>
      </>
    ) : (
      <>
        <h2 className="text-lg font-bold text-gray-900">This flash sale has ended</h2>
        <p className="mt-1 text-sm text-gray-600">Thank you for shopping with us. The next one is on its way.</p>
        <Link to="/products" className="mt-4 flex h-12 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700">See all products</Link>
      </>
    )}
  </div>
);

const FlashSale = ({forRoute}) => {
  const dispatch = useDispatch();
  const {
    flash_sale_Loading,
    flash_sale: products,
    flash_sale_error,
    flash_window: sale,
  } = useSelector((state) => state.flash_sale, shallowEqual);

  // When a countdown reaches zero the shop is asked what is true now: it answers with no products once the sale is over (or with them,
  // once it has started), so the section goes away, or appears, by itself
  const refresh = useCallback(() => dispatch(fetchFlashSaleProducts({ page_size: 12 })), [dispatch]);

  const sectionError = useSelector(
    (state) => state.globalError.sectionErrors["flash-sale"]
  );


  // ✅ useEffect dependency fix
  useEffect(() => {
    if (forRoute) {
      dispatch(fetchFlashSaleContent());
    }
    dispatch(fetchFlashSaleProducts({ page_size: 12 }));
  }, [dispatch, forRoute]);

  // "Try again" on the error card: forget the error and ask for this part again
  const retry = () => {
    ['flash-sale', 'flash-sale-content'].forEach((section) => dispatch(clearSectionError(section)));
    if (forRoute) dispatch(fetchFlashSaleContent());
    dispatch(fetchFlashSaleProducts({ page_size: 12 }));
  };

  if (sectionError) {
    return (
      <SectionError message={sectionError} onRetry={retry} />
    );
  }

  return (
    <>
     {flash_sale_Loading ? <SectionSkeleton forRoute={forRoute} /> :
      flash_sale_error ? (
      <SectionError message={flash_sale_error} onRetry={retry} />
    ) :
      <div className="container mx-auto">
        {forRoute && <RouteBanner />}
       
         
        <ProductSection
          title="Flash Sale"
          subtitle="Limited-time deals on popular products."
          to={forRoute ? undefined : '/products/flash-sale'}
          products={products}
          carousel={!forRoute}
          extra={sale?.isLive && sale.endsAt ? <FlashSaleCountdown endsAt={sale.endsAt} onEnd={refresh} /> : null}
        />

        {forRoute && products.length === 0 && sale && !sale.isLive && <NotLiveNotice sale={sale} onStart={refresh} />}

      </div>
     }
    </>
  );
};

export default FlashSale;
