import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// Five stars rounded to the nearest half (4.1 is four stars, not five), the exact average and the number of reviews.
// One element for a screen reader: "Rated 4.3 out of 5 from 12 reviews".
const RatingStars = ({ rating, reviews, iconClass = 'h-3 w-3', className = 'text-xs text-gray-600', showNumbers = true }) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div
      role="img"
      aria-label={`Rated ${Number(rating).toFixed(1)} out of 5 from ${reviews} reviews`}
      className={`flex items-center gap-1 ${className}`}
    >
      <span className="flex text-yellow-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) =>
          rounded >= n ? <FaStar key={n} className={iconClass} />
            : rounded >= n - 0.5 ? <FaStarHalfAlt key={n} className={iconClass} />
              : <FaRegStar key={n} className={iconClass} />
        )}
      </span>
      {showNumbers && <span aria-hidden="true">{Number(rating).toFixed(1)}</span>}
      {showNumbers && <span aria-hidden="true" className="text-gray-400">({reviews})</span>}
    </div>
  );
};

export default RatingStars;
