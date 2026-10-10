import React from 'react';
import { FaStar } from 'react-icons/fa';
import { STARS } from '../../utils/reviews';

const CHIP = 'flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400';

// Which reviews to read: all, only those with photos, one star rating (only the ones that exist), and in what order. The counts are of the
// reviews read so far (`counts` from utils/reviews `countReviews`).
const ReviewFilters = ({ counts, filter, onFilter, sort, onSort }) => {
  const chips = [
    { id: 'all', label: 'All', count: counts.all },
    counts.photos > 0 && { id: 'photos', label: 'With photos', count: counts.photos },
    ...STARS.filter((stars) => counts[stars] > 0).map((stars) => ({ id: String(stars), stars, count: counts[stars] })),
  ].filter(Boolean);

  return (
    <div className="mt-4 flex items-center gap-2">
      {/* `relative`: the screen-reader-only words inside the chips are `position: absolute`; without a positioned parent they escape this row's clipping and make the whole page wider than the phone */}
      <div role="group" aria-label="Filter reviews" className="relative flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const on = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={on}
              onClick={() => onFilter(chip.id)}
              className={`${CHIP} ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'}`}
            >
              {chip.stars ? (<>{chip.stars}<FaStar aria-hidden="true" className={on ? 'text-yellow-300' : 'text-yellow-500'} /><span className="sr-only"> {chip.stars === 1 ? 'star' : 'stars'}</span></>) : chip.label}
              <span className={`text-xs ${on ? 'text-indigo-100' : 'text-gray-400'}`}>{chip.count}</span>
            </button>
          );
        })}
      </div>
      <select
        aria-label="Sort reviews"
        value={sort}
        onChange={(event) => onSort(event.target.value)}
        className="h-9 shrink-0 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <option value="newest">Newest</option>
        <option value="highest">Highest rated</option>
        <option value="lowest">Lowest rated</option>
      </select>
    </div>
  );
};

export default ReviewFilters;
