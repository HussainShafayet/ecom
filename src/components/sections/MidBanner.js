import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ContentLink } from '../common';

// A wide promo banner between the sections of the Home page (the admin's "Mid-page banner", `apps/content`): one picture that leads
// where the admin chose, with the headline and the button (`cta_label`: empty = no button) over it when they wrote some. It reads the
// home content the hero already asked for, so it costs no request of its own, and draws nothing until there is a banner. A phone
// gets it 2:1, wider from `sm` and `lg`, `object-cover` whatever the picture's shape.
const MidBanner = () => {
  const banner = useSelector((state) => state.content.mid_banner);
  const [loaded, setLoaded] = useState(false);

  if (!banner?.media) return null;
  const label = banner.cta_label ?? '';

  return (
    <section aria-label="Promotion" className="my-6">
      <ContentLink item={banner} className="group relative block aspect-[2/1] overflow-hidden rounded-lg bg-gray-100 sm:aspect-[3/1] lg:aspect-[4/1]">
        {!loaded && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-gray-200" />}
        <img
          src={banner.media}
          alt={banner.caption || 'Promotion'}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 group-hover:scale-[1.02] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {(banner.caption || label) && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-left sm:p-6">
            {banner.caption && <p className="line-clamp-2 max-w-xl text-lg font-bold text-white drop-shadow sm:text-2xl lg:text-3xl">{banner.caption}</p>}
            {label && <span className="mt-2 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-900">{label}</span>}
          </div>
        )}
      </ContentLink>
    </section>
  );
};

export default MidBanner;
