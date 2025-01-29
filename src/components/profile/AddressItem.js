const AddressItem = ({ address }) => {
    // Helper function to render a field with a fallback message if the data is missing
    const renderField = (label, value, fallback = "N/A") => {
      return (
        <p className="text-gray-600">
          <span className="font-medium">{label}:</span> {value || fallback}
        </p>
      );
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-4 max-w-md mx-auto">
        <div className="space-y-2">
          {/* Title (if available) */}
          {address.title && (
            <h2 className="text-xl font-semibold text-gray-800">{address.title}</h2>
          )}
          <h2 className="text-xl font-semibold text-gray-800">Home</h2>
  
          {/* Address */}
          {renderField("Address", address.address)}
  
          {/* Area */}
          {renderField("Area", address.area)}
  
          {/* Division */}
          {renderField("Division", address.division)}
  
          {/* District */}
          {renderField("District", address.district)}
  
          {/* Thana */}
          {renderField("Thana", address.thana)}
  
          {/* Shipping Type */}
          {renderField("Shipping Type", address.shipping_type)}
        </div>
  
        {/* Fallback UI if all fields are missing */}
        {!address.title &&
          !address.address &&
          !address.area &&
          !address.division &&
          !address.district &&
          !address.thana &&
          !address.shipping_type && (
            <p className="text-gray-500 italic">No address details available.</p>
          )}
      </div>
    );
  };

  export default AddressItem ;