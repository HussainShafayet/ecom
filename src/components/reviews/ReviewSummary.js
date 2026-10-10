import React from 'react';
import { FaPlay } from 'react-icons/fa';
import RatingStars from '../common/product/RatingStars';

const MAX_PHOTOS = 8;

// The top of the reviews: what customers think at a glance (the average, five stars, how many wrote), the pictures they took, and what the
// signed-in or signed-out visitor may do about it (`action`: the "Write a review" button, or the reason they can not yet).
//   rating   the average, 0 when there is no review      total   how many reviews the shop has
//   photos   [{ file_url, thumbnail_url, file_type }] of all the reviews read so far, newest first
//   onOpenPhoto(index)   opens the full-screen viewer on that one
const ReviewSummary = ({ rating, total, photos, onOpenPhoto, action }) => {
  const shown = photos.slice(0, MAX_PHOTOS);
  const hidden = photos.length - shown.length;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 ring-1 ring-indigo-100">
      {total > 0 ? (
        <div className="flex items-center gap-4">
          <span className="text-5xl font-bold leading-none text-gray-900">{Number(rating).toFixed(1)}</span>
          <div>
            <RatingStars rating={rating} reviews={total} showNumbers={false} iconClass="h-5 w-5" className="text-sm" />
            <p className="mt-1 text-sm text-gray-600">Based on {total} {total === 1 ? 'review' : 'reviews'}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium text-gray-700">No reviews yet. Be the first to share your experience!</p>
      )}

      {shown.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-gray-900">Photos from customers</p>
          <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shown.map((item, index) => (
              <li key={item.file_url} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenPhoto(index)}
                  aria-label={`Open ${item.file_type === 'video' ? 'video' : 'photo'} ${index + 1} of ${photos.length} from customers`}
                  className="relative block h-16 w-16 overflow-hidden rounded-lg bg-white ring-1 ring-indigo-100 transition hover:ring-2 hover:ring-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:h-20 sm:w-20"
                >
                  {item.file_type === 'video' ? (
                    <span className="flex h-full w-full items-center justify-center bg-gray-900 text-white"><FaPlay aria-hidden="true" /></span>
                  ) : (
                    <img src={item.file_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                  {index === shown.length - 1 && hidden > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">+{hidden}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {action && <div className="mt-4 border-t border-indigo-100 pt-4">{action}</div>}
    </div>
  );
};

export default ReviewSummary;
