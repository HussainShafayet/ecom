import React from 'react';
import { HeroSection, FeaturedProducts, CategoriesSection, TrendingProducts, DealsAndDiscounts } from '../components/sections';

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <TrendingProducts />
      <DealsAndDiscounts />
    </>
  )
}

export default Home;
