import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaEdit, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import { handleAddressDelete } from '../../redux/slice/profileSlice';
import { pushToast } from '../../redux/slice/toastSlice';
import { addressLines } from '../orders/format';

const action = 'flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold disabled:cursor-wait disabled:opacity-70';

// One saved address as a card: an icon chip, its title (or "Address"), whether it is inside or outside Dhaka, the address in
// lines (the same words the orders show), and two labelled 44 px buttons. Delete asks IN the card ("Delete this address?"), no
// browser dialog, no Undo; if the shop refuses, its sentence is shown in the card. Editing is the caller's (`onEdit`): the form
// takes the card's place.
const AddressItem = ({ address, onEdit }) => {
  const dispatch = useDispatch();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refusal, setRefusal] = useState('');

  const name = address?.title || 'address';
  const inside = address?.shipping_type === 'inside_dhaka';
  const lines = addressLines({
    shipping_type: address?.shipping_type,
    shipping_address: address?.address,
    shipping_area: address?.area,
    shipping_thana: address?.thana,
    shipping_district: address?.district,
    shipping_division: address?.division,
  });

  const remove = async () => {
    setDeleting(true);
    setRefusal('');
    try {
      await dispatch(handleAddressDelete(address.id)).unwrap();
      dispatch(pushToast('Address deleted', 'success', 3000)); // the card is gone with the list entry
    } catch (refused) {
      setRefusal(refused?.errors?.join(' ') || 'Could not delete the address. Please try again.');
      setConfirming(false);
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><FaMapMarkerAlt /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="break-words font-semibold text-gray-900">{address?.title || 'Address'}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inside ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
              {inside ? 'Inside Dhaka' : 'Outside Dhaka'}
            </span>
          </div>
          <p className="mt-1 break-words text-sm text-gray-600">
            {lines.map((line, index) => <span key={index} className="block">{line}</span>)}
          </p>
        </div>
      </div>

      {refusal && <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{refusal}</p>}

      {confirming ? (
        <div role="group" aria-label={`Delete ${name}?`} className="mt-3 rounded-lg bg-red-50 p-3">
          <p className="text-sm font-semibold text-red-800">Delete this address?</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={remove} disabled={deleting} className={`${action} border-red-600 bg-red-600 text-white hover:bg-red-700`}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={deleting} className={`${action} border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}>
              Keep address
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onEdit} aria-label={`Edit ${name}`} className={`${action} border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}>
            <FaEdit aria-hidden="true" /> Edit
          </button>
          <button type="button" onClick={() => { setRefusal(''); setConfirming(true); }} aria-label={`Delete ${name}`} className={`${action} border-red-200 bg-white text-red-600 hover:bg-red-50`}>
            <FaTrash aria-hidden="true" /> Delete
          </button>
        </div>
      )}
    </article>
  );
};

export default AddressItem;
