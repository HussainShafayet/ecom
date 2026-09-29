import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDistricts, setSelectedAddressId, setUpazilas, updateFormData } from '../../redux/slice/checkoutSlice';
import { districtsData, divisionsData, upazilasData } from '../../data/location';

// A signed-in customer's saved addresses, one tap to fill the form with one. They are a radio group (a screen reader and the
// keyboard know which is chosen), each at least 64 px tall. Nothing is drawn for a customer without saved addresses: the form
// below is all they need.
const ShowAddress = () => {
  const dispatch = useDispatch();
  const {selectedAddressId, addresses } = useSelector((state) => state.checkout);

  const handleAddressSelection = (id) => {
    dispatch(setSelectedAddressId(id));

    const addressItem = addresses.find((item) => item?.id === id);
    const { shipping_type, area, division, district, thana, address } = addressItem;

    dispatch(updateFormData({
      title: addressItem?.title || '',
      shipping_type,
      shipping_area: area,
      division,
      district,
      upazila: thana,
      address,
    }));

    if (shipping_type === 'outside_dhaka') {
      const divisionItem = divisionsData?.find((item) => item.name === division);
      if (divisionItem) {
        const divisionDist = districtsData?.filter((item) => item.division_id === divisionItem.id);
        dispatch(setDistricts(divisionDist || []));
        const districtItem = divisionDist?.find((item) => item.name === district);
        if (districtItem) {
          const upzillaDist = upazilasData?.filter((item) => item.district_id === districtItem.id);
          dispatch(setUpazilas(upzillaDist || []));
        }
      }
    }
  };

  if (!addresses || addresses.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-medium text-gray-800">Use a saved address</h3>
      <div role="radiogroup" aria-label="Saved addresses" className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {addresses.map((address) => {
          const chosen = selectedAddressId === address?.id;
          return (
            <button
              key={address?.id}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => handleAddressSelection(address?.id)}
              className={`min-h-16 rounded-lg border p-3 text-left transition ${chosen ? 'border-2 border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}
            >
              <span className="block font-semibold text-gray-900">{address?.title || 'Untitled address'}</span>
              <span className="line-clamp-2 block text-sm text-gray-600">{address?.address}</span>
              <span className="block text-xs text-gray-500">{address?.shipping_type?.replace('_', ' ')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShowAddress;
