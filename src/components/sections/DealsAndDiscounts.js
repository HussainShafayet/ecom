import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts} from '../../redux/slice/productSlice';
import {ProductCard} from '../common';

const DealsAndDiscounts = () => {
  const {isLoading, items:products, error} = useSelector((state)=> state.product);


    const dispatch = useDispatch();

    useEffect(() => {
    dispatch(fetchAllProducts({limit:8}));
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
        return <div>Loading trending products...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Deals & Discounts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} cardForTrending={true} />
        ))}
      </div>
    </div>


      //{/* Countdown Timer */}
      //<div className="mt-2 text-red-500 font-bold">
      //<p>Ends in:</p>
      //<div className="flex justify-center space-x-2">
      //  <div className="p-1 bg-red-100 rounded">
      //    <span>{timers[index]?.days || 0}d</span>
      //  </div>
      //  <div className="p-1 bg-red-100 rounded">
      //    <span>{timers[index]?.hours || 0}h</span>
      //  </div>
      //  <div className="p-1 bg-red-100 rounded">
      //    <span>{timers[index]?.minutes || 0}m</span>
      //  </div>
      //  <div className="p-1 bg-red-100 rounded">
      //    <span>{timers[index]?.seconds || 0}s</span>
      //  </div>
      //</div>
      //</div>
  );
};

export default DealsAndDiscounts;
