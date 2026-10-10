// Helpers for the reviews of a product, all on the reviews already read (the shop sends them newest first, 30 a page).
// A review: { id, user_name, rating, comment, created_at, can_edited, media_urls: [{ file, type }] } (backend docs/API_CONTRACT.md section 7).

const VIDEO_FILE = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i;
export const isVideo = (media) => String(media?.type || '').startsWith('video') || VIDEO_FILE.test(media?.file || '');

// The pictures and videos of one review in the shape the full-screen viewer takes
export const reviewMedia = (review) => (review?.media_urls || [])
  .filter((media) => media?.file)
  .map((media) => ({ file_url: media.file, thumbnail_url: null, file_type: isVideo(media) ? 'video' : 'image' }));

// Every picture and video of all of them, newest review first
export const allReviewMedia = (reviews) => reviews.flatMap(reviewMedia);

export const STARS = [5, 4, 3, 2, 1];

// How many reviews each filter would show: { all, photos, 5, 4, 3, 2, 1 }
export const countReviews = (reviews) => {
  const counts = { all: reviews.length, photos: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    if (reviewMedia(review).length > 0) counts.photos += 1;
    const stars = Math.round(review.rating);
    if (counts[stars] !== undefined) counts[stars] += 1;
  });
  return counts;
};

// filter: 'all' | 'photos' | 1..5 (a number or its text)
export const filterReviews = (reviews, filter) => {
  if (filter === 'all') return reviews;
  if (filter === 'photos') return reviews.filter((review) => reviewMedia(review).length > 0);
  return reviews.filter((review) => Math.round(review.rating) === Number(filter));
};

// sort: 'newest' | 'highest' | 'lowest'; ties go to the newer review
export const sortReviews = (reviews, sort) => {
  const newer = (a, b) => new Date(b.created_at) - new Date(a.created_at);
  if (sort === 'highest') return [...reviews].sort((a, b) => b.rating - a.rating || newer(a, b));
  if (sort === 'lowest') return [...reviews].sort((a, b) => a.rating - b.rating || newer(a, b));
  return [...reviews].sort(newer);
};

// "Rahim U." -> "RU", "Customer" -> "C"; never empty
export const initials = (name) => {
  const letters = String(name || '').split(/\s+/).filter(Boolean).map((word) => word[0].toUpperCase());
  return (letters.length > 1 ? letters[0] + letters[letters.length - 1] : letters[0]) || 'C';
};

export const reviewDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// The average of the reviews in hand, for a page that was not told the product's own (0 without reviews)
export const averageOf = (reviews) => (reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0);
