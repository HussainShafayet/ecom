import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { handleAddressCreate, handleAddressUpdate, handleGetAddress } from '../../redux/slice/profileSlice';
import { clearSectionError } from '../../redux/slice/globalErrorSlice';
import { pushToast } from '../../redux/slice/toastSlice';
import { SectionError } from '../common';
import AddressForm from './AddressForm';
import AddressItem from './AddressItem';
import { primary } from './styles';

const MAX_ADDRESSES = 20; // the backend's MAX_ADDRESSES_PER_USER: a 21st is refused there, so the button is not offered

// While the list is read for the first time, in the shape of two cards
const Skeleton = () => (
  <div className="animate-pulse space-y-3" aria-hidden="true">
    <div className="h-6 w-40 rounded bg-gray-300"></div>
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="h-40 rounded-2xl border bg-white"></div>
    ))}
  </div>
);

// The Addresses tab, phone first: a heading with a labelled "+ Add address" button, the form (one at a time: adding, or changing
// one address, in that card's place), and the cards. Nothing here is a browser dialog. A form closes only after the shop took the
// address, and says what the shop said when it did not; a list that could not be read is a SectionError with Try again, while a
// refresh that fails keeps the list that is already on the screen.
const AddressesTab = () => {
  const dispatch = useDispatch();
  const { addresses, addressesLoaded, addressError } = useSelector((state) => state.profile);
  const [editing, setEditing] = useState(null); // 'new', the id of the address being changed, or nothing

  useEffect(() => {
    dispatch(handleGetAddress());
  }, [dispatch]);

  const retry = () => {
    dispatch(clearSectionError('get-address'));
    dispatch(handleGetAddress());
  };

  // A promise that rejects with the shop's refusal (the form says it) and resolves when the address was saved
  const save = (fields, id) => {
    const request = id ? handleAddressUpdate({ id, ...fields }) : handleAddressCreate(fields);
    return dispatch(request).unwrap().then(() => {
      setEditing(null);
      dispatch(pushToast(id ? 'Address updated' : 'Address saved', 'success', 3000));
    });
  };

  if (addresses.length === 0 && addressError) return <SectionError message={addressError} onRetry={retry} />;
  if (addresses.length === 0 && !addressesLoaded) return <Skeleton />;

  const full = addresses.length >= MAX_ADDRESSES;

  return (
    <section aria-label="Saved addresses" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
          Saved addresses{addresses.length > 0 && <span className="font-normal text-gray-500"> ({addresses.length})</span>}
        </h2>
        {addresses.length > 0 && editing !== 'new' && !full && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-blue-600 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <FaPlus aria-hidden="true" /> Add address
          </button>
        )}
      </div>

      {editing === 'new' && <AddressForm heading="New address" onSave={(fields) => save(fields)} onCancel={() => setEditing(null)} />}

      {addresses.length === 0 && editing !== 'new' && (
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center shadow-sm">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600"><FaMapMarkerAlt /></span>
          <p className="mt-3 font-semibold text-gray-900">No saved addresses yet</p>
          <p className="mt-1 text-sm text-gray-600">Save one here and choose it in a tap at checkout.</p>
          <button type="button" onClick={() => setEditing('new')} className={`${primary} mt-4 sm:w-auto`}>Add your first address</button>
        </div>
      )}

      {full && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">You have saved {MAX_ADDRESSES} addresses, the most we keep. Delete one to add another.</p>}

      <ul className="space-y-3">
        {addresses.map((address) => (
          <li key={address.id}>
            {editing === address.id ? (
              <AddressForm heading="Edit address" address={address} submitLabel="Save changes" onSave={(fields) => save(fields, address.id)} onCancel={() => setEditing(null)} />
            ) : (
              <AddressItem address={address} onEdit={() => setEditing(address.id)} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AddressesTab;
