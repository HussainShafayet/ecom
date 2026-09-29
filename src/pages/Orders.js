import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {FaChevronRight} from 'react-icons/fa';
import {fetchOrders} from '../redux/slice/orderSlice';
import {clearSectionError} from '../redux/slice/globalErrorSlice';
import {SectionError} from '../components/common';
import {OrdersSkeleton} from '../components/common/skeleton';
import {OrderStatusBadge, formatDate, formatMoney} from '../components/orders';

const PAGE_SIZE = 10;
const THUMBS = 3; // pictures on a card; the rest is "+2"

// One order: the whole card is the tap target (the order number is a link stretched over it), so a thumb has no small button to hit.
const OrderCard = ({order}) => {
  const items = order.items || [];
  const more = items.length - THUMBS;
  return (
    <li className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/orders/${order.order_id}`} className="block break-all font-semibold text-blue-700 after:absolute after:inset-0 after:content-[''] hover:underline">
            {order.order_id}
          </Link>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} label={order.status_display} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {items.slice(0, THUMBS).map((item, index) => (
          item.image
            ? <img key={index} src={item.image} alt={item.product_name} title={item.product_name} className="h-14 w-14 flex-none rounded object-cover" />
            : <div key={index} title={item.product_name} className="h-14 w-14 flex-none rounded bg-gray-100" />
        ))}
        {more > 0 && <div className="flex h-14 w-14 flex-none items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600">+{more}</div>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          {order.items_count} item{order.items_count === 1 ? '' : 's'} · <span className="font-semibold text-gray-900">{formatMoney(order.total)}</span>
        </p>
        <FaChevronRight className="text-gray-400" aria-hidden="true" />
      </div>
    </li>
  );
};

// My orders (signed in): newest first, one card per order, ten at a time and "Load more" under them (the list stays where it is
// while the next ten come, instead of being swapped for a spinner).
const Orders = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const {orders, ordersCount, ordersNext, ordersLoading, ordersError} = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({page, page_size: PAGE_SIZE}));
  }, [dispatch, page]);

  const retry = () => {
    dispatch(clearSectionError('orders'));
    dispatch(fetchOrders({page, page_size: PAGE_SIZE}));
  };

  const firstLoad = ordersLoading && orders.length === 0;
  const hasOrders = orders.length > 0;

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-800 sm:mb-6 sm:text-3xl">My Orders</h1>

      {firstLoad && <OrdersSkeleton />}
      {ordersError && !hasOrders && <SectionError message={ordersError.join(' ')} onRetry={retry} />}

      {!ordersLoading && !ordersError && !hasOrders && (
        <div className="rounded-lg bg-gray-50 p-8 text-center shadow-md">
          <p className="mb-4 text-gray-600">You have not placed any order yet.</p>
          <Link to="/products" className="inline-flex h-12 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white transition-colors hover:bg-blue-700">
            Start shopping
          </Link>
        </div>
      )}

      {hasOrders && (
        <ul className="space-y-3">
          {orders.map((order) => <OrderCard key={order.order_id} order={order} />)}
        </ul>
      )}

      {hasOrders && (
        <div className="mt-5 text-center">
          <p className="mb-3 text-sm text-gray-500">Showing {orders.length} of {Math.max(ordersCount, orders.length)}</p>
          {ordersError && <p role="alert" className="mb-3 text-sm text-red-600">{ordersError.join(' ')} <button type="button" onClick={retry} className="font-semibold underline">Try again</button></p>}
          {ordersNext && !ordersError && (
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={ordersLoading}
              className="h-12 w-full rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-10"
            >
              {ordersLoading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
