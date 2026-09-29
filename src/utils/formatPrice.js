// Prices come from the backend as plain numbers (docs/API_CONTRACT.md: money is a JSON number), so the storefront adds the
// currency: ৳3,579 · ৳881.10. A whole amount has no decimals, anything else always two.
export const formatPrice = (value) => {
  const amount = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(amount)) return '';
  const whole = Number.isInteger(amount);
  return `৳${amount.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
};

// The text of a discount badge: "25% OFF" for a percentage, "৳150 OFF" for a fixed amount.
export const discountLabel = (value, type) => (type === 'percentage' ? `${value}% OFF` : `${formatPrice(value)} OFF`);
