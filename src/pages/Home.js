import React from 'react';
import { HeroSection, FeaturedProducts, CategoriesSection, TrendingProducts, DealsAndDiscounts, NewArrival } from '../components/sections';
import Testimonials from '../components/sections/Testomonials';

const Home = () => {
  return (
    <>
      <HeroSection />
      <NewArrival />
      <FeaturedProducts />
      <CategoriesSection />
      <Testimonials />
      <TrendingProducts />
      <DealsAndDiscounts />
      
    </>
  )
}

export default Home;
