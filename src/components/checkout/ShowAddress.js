import React, { useState } from 'react';
import {FaTruck} from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedAddressId, updateFormData} from '../../redux/slice/checkoutSlice';

const ShowAddress = () => {
  const dispatch = useDispatch();
  const { adrressLoading, addresses } = useSelector(
    (state) => state.profile
  );
  const { selectedAddressId } = useSelector(
    (state) => state.checkout
  );

  const handleAddressSelection = (id) => {
    dispatch(setSelectedAddressId(id));

    const addressItem = addresses.find((item) => item.id === id);
    
    const {shipping_type, area, division , district, thana, address }  = addressItem;
    
    dispatch(updateFormData({ shipping_type, shipping_area: area, division, district, upazila: thana, address: address }))
  };

  return (
    <div className="container mx-auto ">
      <h3 className="text-lg font-semibold flex items-center mb-1">
        <FaTruck className="mr-2 text-blue-500" /> Select a Shipping Address
      </h3>

      {addresses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => handleAddressSelection(address.id)}
              className={`p-4 border rounded-lg shadow-sm cursor-pointer transition ${
                selectedAddressId === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">
                {address.title || 'Untitled Address'}
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Address:</strong> {address.address}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Area:</strong> {address.area || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Shipping Type:</strong>{' '}
                {address.shipping_type.replace('_', ' ')}
              </p>
              {address.division && (
                <p className="text-sm text-gray-600">
                  <strong>Division:</strong> {address.division}
                </p>
              )}
              {address.district && (
                <p className="text-sm text-gray-600">
                  <strong>District:</strong> {address.district}
                </p>
              )}
              {address.thana && (
                <p className="text-sm text-gray-600">
                  <strong>Thana:</strong> {address.thana}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700 mb-2 text-center">No addresses found!</p>
      )}
    </div>
  );
};

export default ShowAddress;
