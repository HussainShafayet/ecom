import React from 'react';
import { HeroSection, FeaturedProducts, CategoriesSection, DealsAndDiscounts, NewArrival, BestSelling, FlashSale, AllProducts } from '../components/sections';
import Testimonials from '../components/sections/Testomonials';

const Home = () => {
  return (
    <>
      <HeroSection />
      <FlashSale />
      <NewArrival />
      <CategoriesSection />
      <BestSelling />
      <FeaturedProducts />
      <AllProducts />
      <Testimonials />
      
      
    </>
  )
}

export default Home;
