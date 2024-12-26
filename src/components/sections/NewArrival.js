import React, { useEffect, useState } from 'react';
import {Loader, ProductCard, Slider} from '../common'; // Assuming you have a ProductCard component
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts, fetchNewArrivalProducts} from '../../redux/slice/productSlice';
import {Link} from 'react-router-dom';

const NewArrival = ({forRoute}) => {
  const {isLoading, new_arrival:products, error} = useSelector((state)=> state.product);

  const dispatch = useDispatch();

  useEffect(() => {
   dispatch(fetchNewArrivalProducts({page_size:12}));
  }, [dispatch]);

  if (isLoading) {
    return <div className='container h-20 flex justify-center'><Loader message='Loading New Arrival' /></div>
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto">

    {forRoute && 
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 h-[60vh]">
        {/*image slider*/}
        <div className="lg:w-3/5 flex h-full w-full">
            <Slider />
        </div>
  
        <div className="lg:w-2/5 flex flex-col space-y-4 h-full w-full border">
          <div className="flex-grow h-3/5">
            
          </div>
          
          <div className="flex flex-grow space-x-4 h-2/5">
          </div>
        </div>
      </div>
      }
      <div className='my-5'>
        <h2 className="text-3xl font-bold">New Arrival</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <span className="text-sm md:text-base text-gray-600">
            Discover the latest trends with our New Arrival Products.
          </span>

          
          {!forRoute && !isLoading&&
              <Link
                to="/products/new-arrival"
                className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
              >
                View All
              </Link>
            }
          
        </div>
        {products.length === 0  ? <div className='text-center'>
          <span>Not found</span>
        </div>:

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        }
      </div>


      {forRoute && 
        <div className='my-5'>
          <h2 className="text-3xl font-bold">Recomendent Products</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
            <span className="text-sm md:text-base text-gray-600">
              Discover the latest trends with our New Arrival Products.
            </span>
            {!forRoute && 
            <Link
              to="/products/flash-sale"
              className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
            >
              View All
            </Link>
            }
          </div>
          {products.length === 0  ? <div className='text-center'>
            <span>Not found</span>
          </div>:

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          }
        </div>
      }
    </div>
  );
};

export default NewArrival;
