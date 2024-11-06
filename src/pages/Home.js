import React from 'react';
import { HeroSection, FeaturedProducts, CategoriesSection, TrendingProducts, DealsAndDiscounts } from '../components/sections';
import Testimonials from '../components/sections/Testomonials';

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <Testimonials />
      <TrendingProducts />
      <DealsAndDiscounts />
      
    </>
  )
}

export default Home;
