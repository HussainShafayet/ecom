import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCompass, FaSearch } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';
import { LazySection, ShopBand } from '../components/common';
import { CategoryStrip, SuggestedProducts } from '../components/sections';

// A dead link is not the end of the visit. The shop's own look (the band of the sign-in pages: its logo and name over the blue-to-purple
// gradient, the card overlapping it with an icon badge), then what a lost customer needs, in the order they need it: say what they were
// looking for (a search box), go home or to everything, pick a category, and last the best sellers. Phone first, one column; everything is
// drawn with CSS. The categories and the suggestions load by themselves and draw nothing when they cannot.
const NotFound = () => {
  usePageTitle('Page not found');
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const search = (event) => {
    event.preventDefault();
    const text = term.trim();
    navigate(text ? `/products?search=${encodeURIComponent(text)}` : '/products');
  };

  return (
    <>
    <div className="mx-auto w-full max-w-3xl">
      <ShopBand className="rounded-b-3xl px-5 pb-20 pt-5 sm:rounded-3xl" fallbackName="Welcome">
        <p aria-hidden="true" className="relative mt-6 text-6xl font-extrabold leading-none tracking-tight text-white/90">404</p>
      </ShopBand>

      <div className="relative -mt-12 px-4">
        <div className="relative rounded-2xl border border-gray-100 bg-white px-5 pb-6 pt-11 text-center shadow-xl sm:px-8">
          <span aria-hidden="true" className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-white text-2xl text-indigo-600 shadow-lg ring-4 ring-indigo-100">
            <FaCompass />
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
          <p className="mt-1 text-sm text-gray-600">The link may be old or mistyped. Tell us what you are looking for, or pick a category below.</p>

          <form role="search" onSubmit={search} className="mt-4 flex gap-2 text-left">
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button type="submit" className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700">
              <FaSearch aria-hidden="true" /> Search
            </button>
          </form>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link to="/" className="flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 sm:flex-1">
              Go to Home
            </Link>
            <Link to="/products" className="flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white font-semibold text-gray-800 hover:bg-gray-50 sm:flex-1">
              Shop all products
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CategoryStrip title="Browse by category" />
      </div>
    </div>
    {/* outside the narrow column: a row of cards sizes itself by the screen, not by the column it sits in */}
    <div className="container mx-auto px-3 pb-6">
      <LazySection><SuggestedProducts title="Popular right now" /></LazySection>
    </div>
    </>
  );
};

export default NotFound;
