import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUndo } from 'react-icons/fa';
import { cancelOrderReturn, requestOrderReturn } from '../../redux/slice/orderSlice';
import { ErrorDisplay } from '../common';
import { expectedText } from '../../utils/delivery';
import { formatDate, formatMoney } from './format';

const STATUS_COLORS = {
  requested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  received: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-700',
};

const lineName = (line) => `${line.product_name}${line.variant_label && line.variant_label !== 'Default' ? ` (${line.variant_label})` : ''}`;

// − 1 + : the units of one line to send back, never fewer than 1 or more than are free (44 px targets)
const Stepper = ({ value, max, onChange, name }) => {
  const button = 'flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-lg font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-40';
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Units of ${name} to return`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Fewer ${name}`} className={button}>−</button>
      <span className="w-10 text-center font-semibold text-gray-800" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${name}`} className={button}>+</button>
    </div>
  );
};

// What to send back: the lines (and units) the shop says are still free, a reason, and a few words. Nothing leaves the page until the
// answers are complete; the shop's own sentences (the window ended, the units are taken) are shown above the button.
const ReturnForm = ({ order, returns, onClose, onSent }) => {
  const dispatch = useDispatch();
  const { returnLoading, returnError } = useSelector((state) => state.order);
  const [picked, setPicked] = useState({}); // line id -> units
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [problems, setProblems] = useState([]);

  const lines = (returns.items || [])
    .map((free) => ({ free, item: (order.items || []).find((item) => item.id === free.item_id) }))
    .filter(({ item }) => item);

  // what sending it back costs for the reason chosen: the shop says which reasons are free (its own fault) and what the others cost
  const chosen = (returns.reasons || []).find((choice) => choice.value === reason);
  const charge = Number(returns.return_charge) || 0;
  const costsNothing = Boolean(chosen?.free) || charge === 0;

  const toggle = (id) => setPicked((now) => {
    const next = { ...now };
    if (next[id]) delete next[id]; else next[id] = 1;
    return next;
  });
  const setUnits = (id, units, max) => setPicked((now) => ({ ...now, [id]: Math.min(Math.max(units, 1), max) }));

  const submit = async (event) => {
    event.preventDefault();
    const found = [];
    if (Object.keys(picked).length === 0) found.push('Choose what you want to return.');
    if (!reason) found.push('Choose a reason.');
    if (reason === 'other' && !details.trim()) found.push('Please tell us what is wrong.');
    setProblems(found);
    if (found.length > 0) return;
    const items = Object.entries(picked).map(([id, quantity]) => ({ item_id: Number(id), quantity }));
    const result = await dispatch(requestOrderReturn({ orderId: order.order_id, reason, details: details.trim(), items }));
    if (requestOrderReturn.fulfilled.match(result)) onSent();
  };

  return (
    <form onSubmit={submit} noValidate className="mt-4 space-y-4">
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-gray-700">What do you want to return?</legend>
        <ul className="divide-y divide-gray-200">
          {lines.map(({ free, item }) => (
            <li key={item.id}>
              <label className="flex min-h-[4.5rem] cursor-pointer items-center gap-3 py-2">
                <input type="checkbox" checked={Boolean(picked[item.id])} onChange={() => toggle(item.id)} className="h-5 w-5 flex-none accent-blue-600" />
                {item.image ? (
                  <img src={item.image} alt="" className="h-14 w-14 flex-none rounded object-cover" />
                ) : (
                  <div className="h-14 w-14 flex-none rounded bg-gray-100" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block font-medium text-gray-800">{lineName(item)}</span>
                  <span className="block text-sm text-gray-500">{free.quantity === 1 ? '1 can be returned' : `Up to ${free.quantity} can be returned`}</span>
                </span>
              </label>
              {picked[item.id] && free.quantity > 1 && (
                <div className="flex items-center gap-3 pb-2 pl-8">
                  <span className="text-sm text-gray-600">How many?</span>
                  <Stepper value={picked[item.id]} max={free.quantity} onChange={(units) => setUnits(item.id, units, free.quantity)} name={item.product_name} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </fieldset>

      <div>
        <label htmlFor="return-reason" className="block text-sm font-medium text-gray-700">Why are you returning it?</label>
        <select
          id="return-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-800"
        >
          <option value="">Choose a reason</option>
          {(returns.reasons || []).map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
        </select>
        {chosen && (
          <p role="status" className={`mt-2 rounded-lg px-3 py-2 text-sm ${costsNothing ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>
            {costsNothing
              ? 'Free return: the shop pays for sending it back.'
              : `Return charge ${formatMoney(charge)}: the delivery charge of sending it back is taken off your refund.`}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="return-details" className="block text-sm font-medium text-gray-700">
          Tell us more <span className="font-normal text-gray-500">{reason === 'other' ? '(required)' : '(optional)'}</span>
        </label>
        <textarea
          id="return-details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={500}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-800"
        />
      </div>

      {problems.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 rounded-md border border-red-300 bg-red-50 py-3 pl-8 pr-3 text-sm text-red-700">
          {problems.map((sentence) => <li key={sentence}>{sentence}</li>)}
        </ul>
      )}
      <ErrorDisplay errors={returnError} />

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={returnLoading}
          className="h-12 rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 sm:flex-1"
        >
          {returnLoading ? 'Sending…' : 'Send return request'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={returnLoading}
          className="h-12 rounded-lg border border-gray-300 bg-white px-6 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 sm:flex-1"
        >
          Close
        </button>
      </div>
    </form>
  );
};

// One request: what was asked, where it stands, what is to be paid back, and the shop's own words. A request nobody answered can be
// called off, asked in the page (never a browser dialog), like cancelling an order.
const RequestRow = ({ order, request }) => {
  const dispatch = useDispatch();
  const { id, loading, error } = useSelector((state) => state.order.returnCancel);
  const [confirming, setConfirming] = useState(false);
  const mine = id === request.id;
  const pays = ['requested', 'approved', 'received', 'completed'].includes(request.status);

  const cancel = async () => {
    await dispatch(cancelOrderReturn({ orderId: order.order_id, requestId: request.id }));
    setConfirming(false);
  };

  return (
    <li className="rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800">Return #{request.id}</p>
          <p className="text-sm text-gray-500">Asked on {formatDate(request.created_at)} · {request.reason_display}</p>
        </div>
        <span className={`inline-block flex-none rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700'}`}>
          {request.status_display || request.status}
        </span>
      </div>

      <ul className="mt-2 space-y-0.5 text-sm text-gray-700">
        {(request.items || []).map((line) => <li key={line.item_id}>{line.quantity} × {lineName(line)}</li>)}
      </ul>
      {request.details && <p className="mt-2 break-words text-sm text-gray-600">Your note: {request.details}</p>}

      {pays && (
        <div className="mt-2 text-sm">
          {typeof request.goods_amount === 'number' && (
            <dl className="space-y-0.5 text-gray-700">
              <div className="flex justify-between gap-3"><dt>Goods</dt><dd>{formatMoney(request.goods_amount)}</dd></div>
              <div className="flex justify-between gap-3">
                <dt>Return charge</dt>
                <dd>{Number(request.return_charge) > 0 ? `−${formatMoney(request.return_charge)}` : 'Free'}</dd>
              </div>
            </dl>
          )}
          <p className="mt-1 flex justify-between gap-3 border-t border-gray-200 pt-1 font-semibold text-gray-900">
            <span>{request.status === 'completed' ? 'Refunded' : 'Estimated refund'}</span>
            <span>{formatMoney(request.refund_amount)}</span>
          </p>
          {request.status === 'received' && <p className="mt-1 text-xs text-gray-500">We have your goods. Your refund is being prepared.</p>}
          {['requested', 'approved'].includes(request.status) && <p className="mt-1 text-xs text-gray-500">The shop pays it back once it has the goods.</p>}
        </div>
      )}

      {request.response && (
        <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-semibold">From the shop</p>
          <p className="mt-0.5 break-words">{request.response}</p>
        </div>
      )}

      {request.status === 'requested' && (
        <div className="mt-3">
          {mine && <ErrorDisplay errors={error} />}
          {confirming ? (
            <div role="alertdialog" aria-label={`Cancel return #${request.id}?`} className="space-y-2">
              <p className="text-sm font-semibold text-gray-800">Cancel this return request?</p>
              <div className="flex flex-col gap-2 sm:flex-row-reverse">
                <button type="button" onClick={cancel} disabled={mine && loading} className="h-12 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60 sm:flex-1">
                  {mine && loading ? 'Cancelling…' : 'Yes, cancel request'}
                </button>
                <button type="button" onClick={() => setConfirming(false)} disabled={mine && loading} className="h-12 rounded-lg border border-gray-300 bg-white px-6 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 sm:flex-1">
                  Keep request
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="h-12 w-full rounded-lg border border-red-300 bg-white font-semibold text-red-700 hover:bg-red-50 sm:w-auto sm:px-8">
              Cancel request
            </button>
          )}
        </div>
      )}
    </li>
  );
};

// "Returns" on a delivered order (the backend's `returns` block, see docs/API_CONTRACT.md): the way to ask for some of its items back while the
// shop's window is open, the shop's reason when it is not (a window that ended, nothing left to return), and every request made so far with
// the shop's answer. Nothing for an order that is not delivered and has no request, and nothing at all without the block.
const Returns = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const returns = order?.returns;
  if (!returns) return null;

  const requests = returns.requests || [];
  const note = returns.message && (returns.until || requests.length > 0) ? returns.message : null; // "returns are off" is not worth saying on every order
  if (!returns.can_request && !note && requests.length === 0) return null;

  return (
    <section aria-labelledby="returns-title" className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 id="returns-title" className="mb-3 text-base font-semibold text-gray-800 sm:text-lg">Returns</h2>

      {sent && !open && (
        <p role="status" className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
          Your return request was sent. The shop will answer it here.
        </p>
      )}

      {returns.can_request && !open && (
        <div>
          <p className="mb-3 text-sm text-gray-600">
            Something wrong with an item? You can ask to return it until {expectedText({ earliest: returns.until, latest: returns.until })}.
          </p>
          <button
            type="button"
            onClick={() => { setSent(false); setOpen(true); }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white font-semibold text-blue-700 hover:bg-blue-50 sm:w-auto sm:px-8"
          >
            <FaUndo aria-hidden="true" className="h-4 w-4" /> Return items
          </button>
        </div>
      )}
      {returns.can_request && open && (
        <ReturnForm order={order} returns={returns} onClose={() => setOpen(false)} onSent={() => { setOpen(false); setSent(true); }} />
      )}
      {!returns.can_request && note && <p className="text-sm text-gray-600">{note}</p>}

      {requests.length > 0 && (
        <ul className={`space-y-3 ${returns.can_request || note || sent ? 'mt-4' : ''}`} aria-label="Return requests">
          {requests.map((request) => <RequestRow key={request.id} order={order} request={request} />)}
        </ul>
      )}
    </section>
  );
};

export default Returns;
