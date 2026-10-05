import React, {useEffect, useRef} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {FaPrint} from 'react-icons/fa';
import {clearOrder, fetchOrder} from '../redux/slice/orderSlice';
import {clearSectionError} from '../redux/slice/globalErrorSlice';
import {handleFetchSite, selectSite} from '../redux/slice/siteSlice';
import {SectionError} from '../components/common';
import {OrderDetailSkeleton} from '../components/common/skeleton';
import {OrderTotals, addressLines, formatDate, formatMoney} from '../components/orders';

const Label = ({children}) => <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</h2>;

// One of my orders as a printable invoice. It is drawn OUTSIDE the storefront's layout (see App.js): no header, footer or bottom bar, and
// the page scrolls as a normal document, so the browser prints all of it, on as many sheets as it needs ("Save as PDF" is the same print).
// The buttons are `print:hidden`; the browser's own title (the order number) becomes the name of the saved file. The shop's details come
// from `GET /site/`, the same as the footer.
const OrderInvoice = () => {
  const {orderId} = useParams();
  const dispatch = useDispatch();
  const {order, orderError, orderNotFound} = useSelector((state) => state.order);
  const site = useSelector(selectSite);
  const siteLoaded = useSelector((state) => state.site.isLoaded);
  const siteLoading = useSelector((state) => state.site.isLoading);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, orderId]);

  // outside the layout nobody else reads the shop's details. Asked once: if it fails the invoice is drawn without them, it does not keep asking
  const askedSite = useRef(false);
  useEffect(() => {
    if (askedSite.current || siteLoaded || siteLoading) return;
    askedSite.current = true;
    dispatch(handleFetchSite());
  }, [dispatch, siteLoaded, siteLoading]);

  // a saved PDF is named after the page's title
  useEffect(() => {
    const before = document.title;
    document.title = `Invoice ${orderId}`;
    return () => {
      document.title = before;
    };
  }, [orderId]);

  const retry = () => {
    dispatch(clearSectionError('order-details'));
    dispatch(fetchOrder(orderId));
  };

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-6 text-center">
        {orderError ? (
          <>
            {orderNotFound ? (
              <div role="alert" className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50 px-4 py-6">
                <p className="font-semibold text-gray-800">We couldn&apos;t find this order.</p>
                <p className="mt-1 text-sm text-gray-600">{orderError.join(' ')}</p>
              </div>
            ) : (
              <SectionError message={orderError.join(' ')} onRetry={retry} />
            )}
            <Link to="/orders" className="mt-2 inline-flex h-11 items-center text-blue-700 underline">Back to my orders</Link>
          </>
        ) : (
          <OrderDetailSkeleton />
        )}
      </div>
    );
  }

  const {name, logo, contact} = site;
  const place = addressLines(order);
  const paidOn = order.payment?.paid_at ? formatDate(order.payment.paid_at) : '';

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:py-8 print:min-h-0 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <Link to={`/orders/${order.order_id}`} className="inline-flex h-11 items-center text-sm text-blue-700 hover:underline">← Back to the order</Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            <FaPrint aria-hidden="true" /> Print or save as PDF
          </button>
        </div>

        <article aria-labelledby="invoice-title" className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 text-sm text-gray-600">
              {logo && <img src={logo} alt="" className="mb-2 h-10 w-auto max-w-[10rem] object-contain" />}
              {name && <p className="text-lg font-bold text-gray-900">{name}</p>}
              {contact.address && <p>{contact.address}</p>}
              {contact.phone && <p>{contact.phone}</p>}
              {contact.email && <p className="break-all">{contact.email}</p>}
            </div>
            <div className="text-sm text-gray-600 sm:text-right">
              <h1 id="invoice-title" className="text-2xl font-bold text-gray-900">Invoice</h1>
              <p className="break-all font-semibold text-gray-900">{order.order_id}</p>
              <p>Date: {formatDate(order.created_at)}</p>
              <p>Status: {order.status_display}</p>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-4 py-4 text-sm text-gray-700 sm:grid-cols-2">
            <div>
              <Label>Billed and shipped to</Label>
              <p className="font-medium text-gray-900">{order.name}</p>
              {place.map((line) => <p key={line}>{line}</p>)}
              <p>{order.phone_number}</p>
              {order.email && <p className="break-all">{order.email}</p>}
            </div>
            <div>
              <Label>Payment</Label>
              {order.payment ? (
                <>
                  <p className="font-medium text-gray-900">{order.payment.method_display}</p>
                  <p>{order.payment.status_display}{paidOn ? ` on ${paidOn}` : ''}</p>
                </>
              ) : (
                <p>No payment record.</p>
              )}
            </div>
          </section>

          <table className="w-full text-left text-sm">
            <caption className="sr-only">Items of order {order.order_id}</caption>
            <thead>
              <tr className="border-b border-gray-300 text-xs uppercase tracking-wide text-gray-500">
                <th scope="col" className="py-2 pr-2 font-semibold">Item</th>
                <th scope="col" className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Price</th>
                <th scope="col" className="px-2 py-2 text-right font-semibold">Qty</th>
                <th scope="col" className="py-2 pl-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(order.items || []).map((item, index) => (
                <tr key={`${item.sku}-${index}`} className="align-top">
                  <td className="py-2 pr-2">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_label && item.variant_label !== 'Default' && <p className="text-gray-500">{item.variant_label}</p>}
                    {item.sku && <p className="text-xs text-gray-400">SKU {item.sku}</p>}
                    <p className="text-gray-500 sm:hidden">{formatMoney(item.unit_price)} each</p>
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-2 text-right sm:table-cell">{formatMoney(item.unit_price)}</td>
                  <td className="px-2 py-2 text-right">{item.quantity}</td>
                  <td className="whitespace-nowrap py-2 pl-2 text-right font-medium text-gray-900">{formatMoney(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-4 max-w-xs border-t border-gray-300 pt-3">
            <OrderTotals order={order} />
          </div>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
            {name ? `Thank you for shopping with ${name}.` : 'Thank you for your order.'}
          </footer>
        </article>
      </div>
    </div>
  );
};

export default OrderInvoice;
