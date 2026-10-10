import React, { useState } from 'react';
import { FaEdit, FaPlay, FaStar } from 'react-icons/fa';
import { initials, reviewDate, reviewMedia } from '../../utils/reviews';

const LONG = 220; // a comment longer than this folds to four lines, with "Read more"

// One review: who (a round initial in the shop's gradient), when, the stars, the words (long ones fold) and the pictures they took (a tap opens
// them full screen). The customer's own review says so and has an Edit button (a real button: the old pencil was an icon with a click handler).
//   onEdit(review)           opens the form on it
//   onOpenMedia(media, i)    opens this review's pictures full screen on the i-th
const ReviewItem = ({ review, onEdit, onOpenMedia }) => {
  const [expanded, setExpanded] = useState(false);
  const media = reviewMedia(review);
  const comment = review.comment || '';
  const folds = comment.length > LONG;

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-sm font-bold text-white ring-2 ring-indigo-100">
          {initials(review.user_name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-semibold text-gray-900">{review.user_name}</span>
            {review.can_edited && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">Your review</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
            <span role="img" aria-label={`${review.rating} out of 5 stars`} className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} aria-hidden="true" className={`h-3.5 w-3.5 ${n <= review.rating ? '' : 'text-gray-300'}`} />)}
            </span>
            <span>{reviewDate(review.created_at)}</span>
          </div>
        </div>
        {review.can_edited && (
          <button
            type="button"
            onClick={() => onEdit(review)}
            className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <FaEdit aria-hidden="true" />Edit<span className="sr-only"> your review</span>
          </button>
        )}
      </div>

      {comment && (
        <>
          <p className={`mt-3 whitespace-pre-line break-words text-sm text-gray-700 ${folds && !expanded ? 'line-clamp-4' : ''}`}>{comment}</p>
          {folds && (
            <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-1 py-1 text-sm font-medium text-indigo-700 hover:underline">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </>
      )}

      {media.length > 0 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {media.map((item, index) => (
            <li key={item.file_url} className="shrink-0">
              <button
                type="button"
                onClick={() => onOpenMedia(media, index)}
                aria-label={`Open ${item.file_type === 'video' ? 'video' : 'photo'} ${index + 1} of ${media.length} in ${review.user_name}'s review`}
                className="relative block h-20 w-20 overflow-hidden rounded-lg bg-gray-100 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {item.file_type === 'video' ? (
                  <span className="flex h-full w-full items-center justify-center bg-gray-900 text-white"><FaPlay aria-hidden="true" /></span>
                ) : (
                  <img src={item.file_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default ReviewItem;
