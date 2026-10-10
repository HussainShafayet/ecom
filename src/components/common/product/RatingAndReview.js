import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';
import { fetchMoreReviews, fetchReviews, resetReviewFormData, updateReviewFormData } from '../../../redux/slice/reviewSlice';
import { allReviewMedia, averageOf, countReviews, filterReviews, sortReviews } from '../../../utils/reviews';
import ReviewSummary from '../../reviews/ReviewSummary';
import ReviewFilters from '../../reviews/ReviewFilters';
import ReviewItem from '../../reviews/ReviewItem';
import ReviewSheet from '../../reviews/ReviewSheet';
import ImageViewer from './ImageViewer';

// Why the signed-in customer can not write a review (yet). `status` is the backend's review_status; `orderId` is the
// order they are waiting for when it is 'waiting_for_delivery'. Anything else (an older backend sends no status) gets
// the general rule.
const ReviewEligibility = ({ status, orderId }) => {
  if (status === 'reviewed') {
    return <p className="text-sm text-gray-600">You have already reviewed this product. Use the Edit button on your review to change it.</p>;
  }
  if (status === 'waiting_for_delivery') {
    return (
      <p className="text-sm text-gray-600">
        You can review this product once your order has been delivered.{' '}
        {orderId && <Link to={`/orders/${orderId}`} className="text-blue-500 underline">View my order</Link>}
      </p>
    );
  }
  return <p className="text-sm text-gray-600">You can review a product once you have bought it and your order has been delivered.</p>;
};

const PRIMARY = 'flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400';

// The reviews of a product, phone first: the summary (average, stars, how many, the customers' photos and the way to write one), the filters,
// the reviews, "Load more" for the next 30, and the form in a sheet (`ReviewSheet`) instead of open in the middle of the page.
// The filters and the order work on the reviews read so far (the shop sends 30 at a time); the average and the count are the shop's own.
const RatingAndReview = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { reviews, reviewsCount, reviewsHasMore, reviewsMoreLoading, can_review, review_status, review_order_id } = useSelector((state) => state.review);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [sheet, setSheet] = useState(null); // null, or { editing: the review's id | null }
  const [viewer, setViewer] = useState(null); // null, or { media, index }
  const [moreProblem, setMoreProblem] = useState('');

  useEffect(() => {
    if (!product?.id) return;
    dispatch(fetchReviews(product.id));
    dispatch(updateReviewFormData({ product_id: product.id }));
    setFilter('all');
    setSort('newest');
  }, [product?.id, dispatch]);

  const total = reviewsCount || Number(product?.total_reviews) || 0;
  // With every review in hand the average is worked out here (it is right at once after the customer's own); else it is the shop's
  const rating = total > 0 && reviews.length === total ? averageOf(reviews) : Number(product?.avg_rating) || averageOf(reviews);
  const counts = countReviews(reviews);
  const shown = sortReviews(filterReviews(reviews, filter), sort);

  const signIn = () => navigate('/signin', { state: { from: location } });
  const write = () => {
    dispatch(resetReviewFormData());
    dispatch(updateReviewFormData({ product_id: product.id }));
    setSheet({ editing: null });
  };
  const edit = (review) => {
    dispatch(updateReviewFormData({ product_id: review.product_id, rating: review.rating, comment: review.comment, media: review.media_urls || [] }));
    setSheet({ editing: review.id });
  };
  const loadMore = async () => {
    setMoreProblem('');
    const result = await dispatch(fetchMoreReviews(product.id));
    if (fetchMoreReviews.rejected.match(result) && !result.meta?.condition) setMoreProblem('Could not load more reviews. Please try again.');
  };

  let action;
  if (!isAuthenticated) {
    action = <button type="button" onClick={signIn} className={PRIMARY}><FaPen aria-hidden="true" />Sign in to write a review</button>;
  } else if (can_review) {
    action = <button type="button" onClick={write} className={PRIMARY}><FaPen aria-hidden="true" />Write a review</button>;
  } else {
    action = <ReviewEligibility status={review_status} orderId={review_order_id} />;
  }

  const photos = allReviewMedia(reviews);

  return (
    <section aria-labelledby="reviews-title" className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
      <h2 id="reviews-title" className="mb-4 text-xl font-bold text-gray-900">Customer reviews</h2>

      <ReviewSummary rating={rating} total={total} photos={photos} onOpenPhoto={(index) => setViewer({ media: photos, index })} action={action} />

      {reviews.length > 1 && <ReviewFilters counts={counts} filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} />}

      {reviews.length > 0 && (
        shown.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {shown.map((review) => (
              <ReviewItem key={review.id} review={review} onEdit={edit} onOpenMedia={(media, index) => setViewer({ media, index })} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-gray-600">
            No reviews match this filter.{' '}
            <button type="button" onClick={() => setFilter('all')} className="font-medium text-indigo-700 underline">Show all reviews</button>
          </p>
        )
      )}

      {reviews.length > 0 && reviewsHasMore && (
        <div className="mt-4 text-center">
          <p className="mb-2 text-xs text-gray-500">Showing {reviews.length} of {reviewsCount} reviews{filter !== 'all' ? ' (the filter looks at these)' : ''}</p>
          <button
            type="button"
            onClick={loadMore}
            disabled={reviewsMoreLoading}
            className="h-11 rounded-lg border border-indigo-200 px-6 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60"
          >
            {reviewsMoreLoading ? 'Loading...' : 'Load more reviews'}
          </button>
          {moreProblem && <p role="alert" className="mt-2 text-sm text-red-600">{moreProblem}</p>}
        </div>
      )}

      {sheet && <ReviewSheet editing={sheet.editing} onClose={() => setSheet(null)} />}
      {viewer && <ImageViewer media={viewer.media} startIndex={viewer.index} name={`${product?.name || 'Product'} reviews`} onClose={() => setViewer(null)} />}
    </section>
  );
};

export default RatingAndReview;
