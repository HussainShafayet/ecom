import React from 'react';
import useBrandProducts from '../../../hooks/useBrandProducts';
import ProductSection from '../ProductSection';

const SHOWN = 12;

// "More from <brand>": the brand's other products, under the related ones, so a shopper who liked this one has somewhere to go that is likely
// to please them. Nothing is drawn while it loads, when the brand has no other product, or when the shop does not answer.
const BrandProducts = ({ brand, excludeId }) => {
  const products = useBrandProducts(brand);
  const others = (products || []).filter((item) => item?.id !== excludeId).slice(0, SHOWN);
  if (others.length === 0) return null;
  return <ProductSection className="my-10" title={`More from ${brand}`} products={others} carousel />;
};

export default BrandProducts;
