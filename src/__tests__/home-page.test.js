// What the Home page puts on it, and in which order (the sections themselves are stubs here; each has its own tests).
import React from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render} from '@testing-library/react';

import Home from '../pages/Home';

vi.mock('../components/sections', () => {
  const stub = (label) => {
    const Stub = () => <div>{`[${label}]`}</div>;
    return Stub;
  };
  return {
    HeroSection: stub('hero'), CategoryStrip: stub('strip'), FlashSale: stub('flash'), BestSelling: stub('best'), NewArrival: stub('new'),
    FeaturedProducts: stub('featured'), RecentlyViewed: stub('recent'), Testimonials: stub('testimonials'), MidBanner: stub('mid'), AllProducts: stub('all'),
  };
});

describe('Home', () => {
  it('goes from the offer to a way into any category, then what is on sale, what sells, the promotion, what is new, the picks, where they left off, what customers say, and everything', () => {
    const {container} = render(<Home />);
    const page = container.textContent;
    const order = ['[hero]', '[strip]', '[flash]', '[best]', '[mid]', '[new]', '[featured]', '[recent]', '[testimonials]', '[all]'];

    order.forEach((label) => expect(page).toContain(label));
    order.slice(1).forEach((label, index) => expect(page.indexOf(order[index])).toBeLessThan(page.indexOf(label)));
  });
});
