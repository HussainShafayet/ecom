import React, { useEffect, useState } from 'react';
import {ProductCard} from '../common'; // Assuming you have a ProductCard component
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';

const BestSelling = () => {
  const {isLoading, items:products, error} = useSelector((state)=> state.product);


  const dispatch = useDispatch();

  useEffect(() => {
   dispatch(fetchAllProducts({limit:4}));
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Best Selling Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSelling;
