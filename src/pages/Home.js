import React from 'react';
import { HeroSection, CategoryStrip, FeaturedProducts, NewArrival, BestSelling, FlashSale, AllProducts, RecentlyViewed, Testimonials, MidBanner } from '../components/sections';
import { LazySection } from '../components/common';

// The order is what a shopper needs first: the offer (hero), a way into any category, what is on sale now, what others buy,
// what is new, the shop's picks, where they left off, what customers say, then everything. (Categories are the one strip under
// the hero.) The admin's mid-page banner sits between what sells and what is new; it uses the hero's home content, so no request of its own.
// The hero, the categories and the flash sale are what the first screen shows, so they load with the page; the sections
// below are `LazySection`s that only load when the customer scrolls near them (four requests at opening instead of eight).
const Home = () => {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <FlashSale />
      <LazySection><BestSelling /></LazySection>
      <MidBanner />
      <LazySection><NewArrival /></LazySection>
      <LazySection><FeaturedProducts /></LazySection>
      <RecentlyViewed />
      <LazySection placeholder={<div className="h-40" aria-hidden="true" />}><Testimonials /></LazySection>
      <LazySection><AllProducts /></LazySection>
    </>
  )
}

export default Home;
