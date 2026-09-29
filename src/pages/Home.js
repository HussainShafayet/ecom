import React from 'react';
import { HeroSection, CategoryStrip, FeaturedProducts, NewArrival, BestSelling, FlashSale, AllProducts, RecentlyViewed } from '../components/sections';
import Testimonials from '../components/sections/Testomonials';

// The order is what a shopper needs first: the offer (hero), a way into any category, what is on sale now, what others buy,
// what is new, the shop's picks, where they left off, then everything. (Categories are the one strip under the hero.)
const Home = () => {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <FlashSale />
      <BestSelling />
      <NewArrival />
      <FeaturedProducts />
      <RecentlyViewed />
      <AllProducts />
      {/*<Testimonials />*/}
    </>
  )
}

export default Home;
