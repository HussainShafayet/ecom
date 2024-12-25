import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';
import {Loader, ProductCard} from '../common';
import {Link} from 'react-router-dom';

const AllProducts = () => {
  const {isLoading, items:products, error} = useSelector((state)=> state.product);


    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(fetchAllProducts({limit:10}));
    }, [dispatch]);



    // // Countdown timer function for each product
    //const calculateTimeLeft = (endDate) => {
    //  const difference = new Date(endDate) - new Date();
    //  let timeLeft = {};

    //  if (difference > 0) {
    //    timeLeft = {
    //      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    //      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    //      minutes: Math.floor((difference / 1000 / 60) % 60),
    //      seconds: Math.floor((difference / 1000) % 60),
    //    };
    //  }
    //  return timeLeft;
    //};

    //const [timers, setTimers] = useState(
    //  products.map((deal) => calculateTimeLeft(new Date().setDate(new Date().getDate() + 1)))
    //);

    //useEffect(() => {
    //  const timerId = setInterval(() => {
    //    setTimers(products.map((deal) => calculateTimeLeft(new Date().setDate(new Date().getDate() + 1))));
    //  }, 1000);

    //  return () => clearInterval(timerId);
    //}, [products]);


    if (isLoading) {
      return <div className='container h-20 flex justify-center'><Loader message='Loading Deals And Discount' /></div>
    }

    if (error) {
        return <div>{error}</div>;
    }

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold">All Products</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <span className="text-sm md:text-base text-gray-600">
          Discover the latest trends with our All Products.
        </span>
        <Link
          to="/products"
          className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
        >
          View All
        </Link>
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
  );
};

export default AllProducts;
