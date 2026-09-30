import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

// The products in the shape of the list (two to a row on a phone, like the cards themselves); the title and the filter / sort
// row above them stay on the screen, only the cards wait.
const ProductsPageSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" aria-hidden="true">
      {[...Array(8)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default ProductsPageSkeleton;
