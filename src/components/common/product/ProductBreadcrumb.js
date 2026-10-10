import React from 'react';
import { Link } from 'react-router-dom';

// Home > Category > this product. One line that scrolls sideways on a phone instead of wrapping (a long product name would take three lines).
// The generic `Breadcrum` reads the address (Products > Detail > the slug), which says nothing to a shopper.
//   category  { name, slug } or null
const SEP = <li aria-hidden="true" className="text-gray-400">›</li>;

const ProductBreadcrumb = ({ category, name }) => (
  <nav aria-label="Breadcrumb" className="mb-3 overflow-x-auto whitespace-nowrap text-xs text-gray-500 [scrollbar-width:none] sm:text-sm [&::-webkit-scrollbar]:hidden">
    <ol className="flex items-center gap-1.5">
      <li><Link to="/" className="rounded py-1 hover:text-blue-600">Home</Link></li>
      {category && (
        <>
          {SEP}
          <li><Link to={`/products?category=${encodeURIComponent(category.slug)}`} className="rounded py-1 hover:text-blue-600">{category.name}</Link></li>
        </>
      )}
      {SEP}
      <li aria-current="page" className="font-medium text-gray-800">{name}</li>
    </ol>
  </nav>
);

export default ProductBreadcrumb;
