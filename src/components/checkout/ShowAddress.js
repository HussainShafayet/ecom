import React, { useState } from 'react';
import {FaTruck} from 'react-icons/fa';

const ShowAddress = ({ addresses, onSelectAddress }) => {
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const handleAddressSelection = (id) => {
    setSelectedAddressId(id);
    onSelectAddress(id); // Pass the selected address ID to the parent component
  };

  return (
    <div className="container mx-auto ">
      <h3 className="text-lg font-semibold flex items-center mb-1">
        <FaTruck className="mr-2 text-blue-500" /> Select a Shipping Address
      </h3>

      {addresses.length > 0 ? (
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
        <p className="text-gray-700">No addresses found. Please add one.</p>
      )}

      {/* Add Address Button */}
      <button
        onClick={() => console.log('Redirect to Add Address')}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
      >
        Add New Address
      </button>
    </div>
  );
};

export default ShowAddress;
