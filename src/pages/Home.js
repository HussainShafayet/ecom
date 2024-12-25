import React from 'react';
import { HeroSection, FeaturedProducts, CategoriesSection, DealsAndDiscounts, NewArrival, BestSelling, FlashSale } from '../components/sections';
import Testimonials from '../components/sections/Testomonials';

const Home = () => {
  return (
    <>
      <HeroSection />
      <NewArrival />
      <CategoriesSection />
      <BestSelling /> 
      <FlashSale />
      <FeaturedProducts />
      
       {/*   <Testimonials />
      <TrendingProducts />
      <DealsAndDiscounts />*/}
      
    </>
  )
}

export default Home;
