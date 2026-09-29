import React from 'react';
import { HeroSection, FeaturedProducts, CategoriesSection, NewArrival, BestSelling, FlashSale, AllProducts, RecentlyViewed } from '../components/sections';
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
      <RecentlyViewed />
      <AllProducts />
      {/*<Testimonials />*/}
      
      
    </>
  )
}

export default Home;
