import React, { useEffect, useState } from 'react';
import {Loader, ProductCard} from '../common'; // Assuming you have a ProductCard component
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts, fetchNewArrivalProducts} from '../../redux/slice/productSlice';
import {Link} from 'react-router-dom';

const NewArrival = () => {
  const {isLoading, new_arrival:products, error} = useSelector((state)=> state.product);

  const dispatch = useDispatch();

  useEffect(() => {
   dispatch(fetchNewArrivalProducts({limit:10}));
  }, [dispatch]);

  if (isLoading) {
    return <div className='container h-20 flex justify-center'><Loader message='Loading New Arrival' /></div>
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold">New Arrival</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <span className="text-sm md:text-base text-gray-600">
          Discover the latest trends with our New Arrival Products.
        </span>
        {!isLoading&&
          <Link
            to="/products"
            className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
          >
            View All
          </Link>
        }
      </div>
      {products.length === 0  ? <div className='text-center'>
        <span>Not found</span>
      </div>:

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      }
    </div>
  );
};

export default NewArrival;
