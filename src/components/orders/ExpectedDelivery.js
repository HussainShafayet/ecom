import React from 'react';
import { FaTruck } from 'react-icons/fa';
import { expectedText } from '../../utils/delivery';

// "Expected Oct 5 – 7": when the shop said the order would arrive (`expected_delivery`, only while it is on its way). Nothing when it made
// no promise.
const ExpectedDelivery = ({ expected, className = '' }) => {
  const text = expectedText(expected);
  if (!text) return null;
  return (
    <p className={`flex items-center gap-2 text-sm font-medium text-indigo-700 ${className}`}>
      <FaTruck aria-hidden="true" /> Expected {text}
    </p>
  );
};

export default ExpectedDelivery;
