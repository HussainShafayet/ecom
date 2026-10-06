import React from 'react';
import { useSelector } from 'react-redux';
import { BADGE_ICONS } from '../../layout/TrustBadgeBar';

// The shop's "why buy from us" points (the same list as the strip under the header, edited in Site settings) at the spot where the customer
// decides: under the buy buttons. By the time a phone reaches them the strip under the header has scrolled away. Two columns that wrap their
// words; nothing is drawn without any badge, and an icon we do not know still shows its words.
const TrustPoints = () => {
  const badges = useSelector((state) => state.site?.site?.trust_badges);
  if (!badges?.length) return null;

  return (
    <ul aria-label="Why shop with us" className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
      {badges.map(({ icon, title, subtitle }, index) => {
        const Icon = BADGE_ICONS[icon];
        return (
          <li key={`${icon}-${index}`} className="flex min-w-0 items-start gap-2 text-gray-700">
            {Icon && <Icon className="mt-0.5 shrink-0 text-blue-600" size={16} aria-hidden="true" />}
            <div className="min-w-0 leading-tight">
              <p className="break-words text-xs font-semibold sm:text-sm">{title}</p>
              {subtitle && <p className="break-words text-xs text-gray-500">{subtitle}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TrustPoints;
