import React from 'react';
import { FaTruck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setDistricts, setSelectedAddressId, setUpazilas, updateFormData } from '../../redux/slice/checkoutSlice';
import { districtsData, divisionsData, upazilasData } from '../../data/location';

const ShowAddress = () => {
  const dispatch = useDispatch();
  const { isLoading, selectedAddressId, addresses } = useSelector((state) => state.checkout);

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

  return (
    <div className="container mx-auto mb-3">
      <h3 className="text-lg font-semibold flex items-center mb-1">
        <FaTruck className="mr-2 text-blue-500" /> Select a Shipping Address
      </h3>

      {addresses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses?.map((address) => (
            <div
              key={address?.id}
              onClick={() => handleAddressSelection(address?.id)}
              className={`p-3 border rounded-md shadow-sm cursor-pointer transition ${
                selectedAddressId === address?.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <h4 className="font-semibold text-md mb-1">
                {address?.title || 'Untitled Address'}
              </h4>
              <p className="text-sm text-gray-600 truncate">
                {address?.address}
              </p>
              <p className="text-xs text-gray-500">
                {address?.shipping_type.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700 text-center">No addresses found!</p>
      )}
    </div>
  );
};

export default ShowAddress;
