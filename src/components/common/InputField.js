import React from 'react';

const InputField = ({ label, value, onChange, type = 'text', className = '', ...rest }) => {
  return (
    <div className={`input-field ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`block w-full p-2 ${className}`} // Merge className prop with default styles
        {...rest} // Allow for any additional props like `min`, `max`, etc.
      />
    </div>
  );
};

export default InputField;
