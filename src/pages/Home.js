import React from 'react';
import { HeroSection, CategoryStrip, FeaturedProducts, NewArrival, BestSelling, FlashSale, AllProducts, RecentlyViewed } from '../components/sections';
import { LazySection } from '../components/common';
import Testimonials from '../components/sections/Testomonials';

// The order is what a shopper needs first: the offer (hero), a way into any category, what is on sale now, what others buy,
// what is new, the shop's picks, where they left off, then everything. (Categories are the one strip under the hero.)
// The hero, the categories and the flash sale are what the first screen shows, so they load with the page; the sections
// below are `LazySection`s that only load when the customer scrolls near them (four requests at opening instead of eight).
const Home = () => {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <FlashSale />
      <LazySection><BestSelling /></LazySection>
      <LazySection><NewArrival /></LazySection>
      <LazySection><FeaturedProducts /></LazySection>
      <RecentlyViewed />
      <LazySection><AllProducts /></LazySection>
      {/*<Testimonials />*/}
    </>
  )
}

export default Home;
