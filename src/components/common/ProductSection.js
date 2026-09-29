import React from 'react';
import SectionHeader from './SectionHeader';
import ProductCard from './product/ProductCard ';

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6';
// A phone swipes through one row of cards (snapping to each) instead of scrolling past a long 2-column grid;
// from `md` up it is the same grid as above.
const CAROUSEL =
  'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
  'md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-6';

// A titled list of product cards: `SectionHeader` + the cards. Draws nothing without products.
const ProductSection = ({ title, subtitle, to, products, carousel = false, className = 'my-6' }) => {
  if (!products?.length) return null;

  return (
    <section className={className} aria-label={title}>
      <SectionHeader title={title} subtitle={subtitle} to={to} />
      <div className={carousel ? CAROUSEL : GRID}>
        {products.map((product) =>
          carousel ? (
            <div key={product?.id} className="flex w-40 shrink-0 snap-start sm:w-44 md:w-auto">
              <ProductCard product={product} />
            </div>
          ) : (
            <ProductCard key={product?.id} product={product} />
          )
        )}
      </div>
    </section>
  );
};

export default ProductSection;
