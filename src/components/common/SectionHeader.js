import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';

// The title row every homepage section shares: a title, an optional one-line subtitle and, when `to` is given, a
// "View All" link to the full list. Links stay in the same tab (this is a single-page app).
const SectionHeader = ({ title, subtitle, to, linkLabel = 'View All' }) => (
  <div className="mb-4 flex items-end justify-between gap-3">
    <div className="min-w-0">
      <h2 className="border-l-4 border-blue-600 pl-3 text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 pl-4 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {to && (
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
      >
        {linkLabel} <FaArrowRight aria-hidden="true" className="h-3 w-3" />
      </Link>
    )}
  </div>
);

export default SectionHeader;
