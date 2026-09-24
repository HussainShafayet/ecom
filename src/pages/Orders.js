import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {fetchOrders} from '../redux/slice/orderSlice';
import {ErrorDisplay, Loader} from '../components/common';
import {OrderStatusBadge, formatDate, formatMoney} from '../components/orders';

const PAGE_SIZE = 10;

// My orders (signed in): newest first, one card per order, a page at a time.
const Orders = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const {orders, ordersCount, ordersNext, ordersPrevious, ordersLoading, ordersError} = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({page, page_size: PAGE_SIZE}));
  }, [dispatch, page]);

  return (
    <div className="container mx-auto my-8 p-4 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      <ErrorDisplay errors={ordersError} />
      {ordersLoading && <Loader message="Loading your orders" />}

      {!ordersLoading && !ordersError && orders.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center shadow-md">
          <p className="text-gray-600 mb-4">You have not placed any order yet.</p>
          <Link to="/products" className="inline-block bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
            Start shopping
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {!ordersLoading && orders.map((order) => (
          <div key={order.order_id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div>
                <Link to={`/orders/${order.order_id}`} className="font-semibold text-blue-600 hover:underline">
                  {order.order_id}
                </Link>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
              </div>
              <OrderStatusBadge status={order.status} label={order.status_display} />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {order.items?.map((item, index) => (
                item.image
                  ? <img key={index} src={item.image} alt={item.product_name} title={item.product_name} className="w-14 h-14 rounded object-cover flex-none" />
                  : <div key={index} title={item.product_name} className="w-14 h-14 rounded bg-gray-100 flex-none" />
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
              <p className="text-gray-600 text-sm">
                {order.items_count} item{order.items_count === 1 ? '' : 's'} · <span className="font-semibold text-gray-800">{formatMoney(order.total)}</span>
              </p>
              <Link to={`/orders/${order.order_id}`} className="text-sm bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {(ordersPrevious || ordersNext) && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((current) => current - 1)}
            disabled={!ordersPrevious || ordersLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Newer
          </button>
          <span className="text-sm text-gray-500">Page {page} of {Math.max(1, Math.ceil(ordersCount / PAGE_SIZE))}</span>
          <button
            onClick={() => setPage((current) => current + 1)}
            disabled={!ordersNext || ordersLoading}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Older
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
