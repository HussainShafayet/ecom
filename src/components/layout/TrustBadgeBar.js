import React from 'react';
import { useSelector } from 'react-redux';
import { FaAward, FaHeadset, FaLock, FaMoneyBillWave, FaTruck, FaUndo } from 'react-icons/fa';
import { selectSite } from '../../redux/slice/siteSlice';

// `icon` is a fixed list on the backend (docs/API_CONTRACT.md section 9); the picture is ours.
const ICONS = {
  delivery: FaTruck,
  returns: FaUndo,
  secure_payment: FaLock,
  cash_on_delivery: FaMoneyBillWave,
  support: FaHeadset,
  warranty: FaAward,
};

// The "why buy from us" strip under the header (free delivery, easy returns, ...). The admin lists the badges in
// Site settings; without any nothing is drawn. An icon we do not know still shows its words.
const TrustBadgeBar = () => {
  const { trust_badges: badges } = useSelector(selectSite);
  if (!badges?.length) return null;

  return (
    <section className="bg-gray-50 border-b" aria-label="Why shop with us">
      <ul className="container mx-auto flex gap-6 overflow-x-auto px-3 py-2 md:justify-around scrollbar-custom">
        {badges.map(({ icon, title, subtitle }, index) => {
          const Icon = ICONS[icon];
          return (
            <li key={`${icon}-${index}`} className="flex shrink-0 items-center gap-2 text-gray-700">
              {Icon && <Icon className="text-blue-600" size={22} aria-hidden="true" />}
              <div className="leading-tight">
                <p className="text-sm font-semibold">{title}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default TrustBadgeBar;
