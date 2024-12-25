import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAllProducts, fetchFlashSaleProducts} from '../../redux/slice/productSlice';
import {Loader, ProductCard} from '../common';
import {Link} from 'react-router-dom';

const FlashSale = () => {

    const {isLoading, flash_sale:products, error} = useSelector((state)=> state.product);


    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFlashSaleProducts({}));
    }, [dispatch]);

    if (isLoading) {
      return <div className='container h-20 flex justify-center'><Loader message='Loading Trending' /></div>
    }

    if (error) {
        return <div>{error}</div>;
    }

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold">Flash Sale</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <span className="text-sm md:text-base text-gray-600">
          Discover the latest trends with our Flash Sale Products.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      }
    </div>
  );
};

export default FlashSale;
