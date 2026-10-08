import React from 'react';
import { useSelector } from 'react-redux';

// The shop's own look, in one place: a band in the site's blue-to-purple with the SHOP's logo and name (and its tagline, in the larger one),
// two translucent circles and a dotted patch for decoration. The sign-in pages (`AuthLayout`), the account page (`ProfileHeader`) and the
// page-not-found page draw it, and a card or a round badge overlaps its lower edge. Everything is CSS: no picture from another website.
// The logo and the name come from the site settings (`state.site.site`, read as `state.site?.site` so a store without the slice works).
//   compact       the small one (a 32 px logo, only the name): the account page's. Without it: a 44 px logo, the name and the tagline
//   fallbackName  what the name says until the site settings have arrived (or when the shop has no name)
//   className     the band's size and corners (padding, height, rounding): each page has its own
//   children      what sits in the band under the logo row. It is drawn over the decoration, so give it `relative`
const ShopBand = ({ compact = false, fallbackName = '', className = '', children }) => {
  const site = useSelector((state) => state.site?.site);
  const name = site?.name || '';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white ${className}`}>
      {/* decoration only */}
      {compact ? (
        <>
          <span aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute bottom-4 right-6 h-14 w-14 opacity-30 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:10px_10px]" />
        </>
      ) : (
        <>
          <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute bottom-6 right-6 h-16 w-16 opacity-30 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:10px_10px]" />
        </>
      )}

      <div className={`relative flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
        <img
          src={site?.logo || '/static image/gocart-logo.svg'}
          alt={name ? `${name} logo` : 'Shop logo'}
          className={`shrink-0 rounded-full bg-white object-contain shadow ${compact ? 'h-8 w-8 p-1' : 'h-11 w-11 p-1.5'}`}
        />
        <div className="min-w-0">
          <p className={`truncate ${compact ? 'text-sm font-semibold' : 'text-lg font-bold leading-tight'}`}>{name || fallbackName}</p>
          {!compact && site?.tagline && <p className="truncate text-xs text-indigo-100">{site.tagline}</p>}
        </div>
      </div>

      {children}
    </div>
  );
};

export default ShopBand;
