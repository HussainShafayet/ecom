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
    HeroSection: stub('hero'), FlashSale: stub('flash'), NewArrival: stub('new'), CategoriesSection: stub('categories'),
    BestSelling: stub('best'), FeaturedProducts: stub('featured'), RecentlyViewed: stub('recent'), AllProducts: stub('all'),
  };
});

describe('Home', () => {
  it('shows the recently viewed list after the shop sections and before the full product list', () => {
    const {container} = render(<Home />);
    const page = container.textContent;
    expect(page).toContain('[recent]');
    expect(page.indexOf('[featured]')).toBeLessThan(page.indexOf('[recent]'));
    expect(page.indexOf('[recent]')).toBeLessThan(page.indexOf('[all]'));
  });
});
