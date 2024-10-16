import React from 'react';

const Button = ({ label, onClick, type = "button", styleClass }) => {
  return (
    <button
      type={type}
      className={`bg-blue-500 text-white py-2 px-4 rounded-lg ${styleClass}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
