// A part of a long page that loads when the customer is about to reach it (LazySection / useInView), and the homepage that uses it:
// the first screen (hero, categories, flash sale) loads with the page, the sections below only when scrolled near.
import React, {useEffect} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, render, screen} from '@testing-library/react';

import {LazySection} from '../components/common';
import Home from '../pages/Home';

// The sections themselves are stubs that say when they were mounted (mounting is what makes a real one ask the backend)
const mounted = [];
vi.mock('../components/sections', () => {
  const stub = (label) => {
    const Stub = () => {
      useEffect(() => { mounted.push(label); }, []);
      return <div>{`[${label}]`}</div>;
    };
    return Stub;
  };
  return {
    HeroSection: stub('hero'), CategoryStrip: stub('strip'), FlashSale: stub('flash'), BestSelling: stub('best'), NewArrival: stub('new'),
    FeaturedProducts: stub('featured'), RecentlyViewed: stub('recent'), Testimonials: stub('testimonials'), MidBanner: stub('mid'), AllProducts: stub('all'),
  };
});

// An IntersectionObserver the test drives: `see(true)` says the observed element came near the screen
const observers = [];
class FakeObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.disconnect = vi.fn();
    this.observe = vi.fn();
    observers.push(this);
  }
  see(isIntersecting) {
    this.callback([{isIntersecting}]);
  }
}

beforeEach(() => {
  cleanup();
  mounted.length = 0;
  observers.length = 0;
  window.IntersectionObserver = FakeObserver;
});

afterEach(() => {
  delete window.IntersectionObserver;
});

describe('LazySection', () => {
  const Child = () => {
    useEffect(() => { mounted.push('child'); }, []);
    return <p>the section</p>;
  };

  it('keeps a placeholder, and does not mount (so does not fetch) its content, until the customer is near', () => {
    const {container} = render(<LazySection><Child /></LazySection>);

    expect(screen.queryByText('the section')).toBeNull();
    expect(mounted).toEqual([]);
    expect(container.querySelector('.animate-pulse')).toBeTruthy(); // the placeholder holds its place

    act(() => observers[0].see(false)); // not yet
    expect(screen.queryByText('the section')).toBeNull();

    act(() => observers[0].see(true));
    expect(screen.getByText('the section')).toBeTruthy();
    expect(mounted).toEqual(['child']);
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });

  it('keeps its own placeholder instead of the product skeleton when given one', () => {
    const {container} = render(<LazySection placeholder={<div data-testid="spacer" />}><Child /></LazySection>);

    expect(screen.getByTestId('spacer')).toBeTruthy();
    expect(container.querySelector('.animate-pulse')).toBeNull(); // no fake product grid for a part that may draw nothing
    act(() => observers[0].see(true));
    expect(screen.queryByTestId('spacer')).toBeNull();
    expect(screen.getByText('the section')).toBeTruthy();
  });

  it('stops watching once it has shown, and never takes the section away again', () => {
    render(<LazySection><Child /></LazySection>);
    act(() => observers[0].see(true));

    expect(observers[0].disconnect).toHaveBeenCalled();
    act(() => observers[0].see(false)); // scrolled away again
    expect(screen.getByText('the section')).toBeTruthy();
  });

  it('looks 400 px ahead, and from the scroll box the page scrolls in (the shop scrolls inside Layout, not the window)', () => {
    render(
      <div data-testid="scroll-box" style={{overflowY: 'auto'}}>
        <LazySection><Child /></LazySection>
      </div>
    );

    expect(observers[0].options.rootMargin).toBe('400px');
    expect(observers[0].options.root).toBe(screen.getByTestId('scroll-box'));
    expect(observers[0].observe).toHaveBeenCalledTimes(1);
  });

  it('shows the content at once where the browser cannot observe (better everything than a section that never appears)', () => {
    delete window.IntersectionObserver;
    render(<LazySection><Child /></LazySection>);

    expect(screen.getByText('the section')).toBeTruthy();
    expect(mounted).toEqual(['child']);
  });
});

describe('The homepage', () => {
  it('loads the first screen with the page and the sections below only when scrolled near', () => {
    render(<Home />);

    // hero, categories, flash sale, the promotion banner (it asks for nothing), recently viewed: mounted; the rest wait
    expect(mounted).toEqual(['hero', 'strip', 'flash', 'mid', 'recent']);
    expect(screen.queryByText('[best]')).toBeNull();
    expect(screen.queryByText('[new]')).toBeNull();
    expect(screen.queryByText('[featured]')).toBeNull();
    expect(screen.queryByText('[testimonials]')).toBeNull();
    expect(screen.queryByText('[all]')).toBeNull();
    expect(observers).toHaveLength(5); // one per lazy section

    act(() => observers[0].see(true)); // the customer scrolls: best selling is near
    expect(mounted).toContain('best');
    expect(mounted).not.toContain('new');

    act(() => { observers[1].see(true); observers[2].see(true); observers[3].see(true); observers[4].see(true); });
    expect(mounted).toEqual(expect.arrayContaining(['best', 'new', 'featured', 'testimonials', 'all']));
    // still in the page's order
    const page = document.body.textContent;
    ['[hero]', '[strip]', '[flash]', '[best]', '[mid]', '[new]', '[featured]', '[recent]', '[testimonials]', '[all]'].forEach((label, index, all) => {
      if (index > 0) expect(page.indexOf(all[index - 1])).toBeLessThan(page.indexOf(label));
    });
  });
});
