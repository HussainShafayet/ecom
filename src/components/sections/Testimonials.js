import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import { SectionHeader } from '../common';
import { fetchTestimonials } from '../../redux/slice/testimonialsSlice';

const CARD = 'w-[85%] shrink-0 snap-start sm:w-[46%] md:w-auto';

const Stars = ({ rating }) => (
  <span role="img" aria-label={`${rating} out of 5 stars`} className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar key={star} aria-hidden="true" className={`h-3.5 w-3.5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </span>
);

// What real customers say: the reviews the shop shows on the homepage (backend: GET /products/reviews/featured/, the ones the staff
// ticked, else the shop's own pick). A row you swipe on a phone, a grid from `md`. Each card is a ring-avatar with the reviewer's
// initial, the stars, the words (4 lines), a "Verified buyer" chip when it came from a delivered purchase, the review's first photo if
// it has one, and a link to the product. Draws nothing until there is a review to show, and nothing if they could not be loaded:
// the rest of the page does not depend on it.
const Testimonials = () => {
  const dispatch = useDispatch();
  const { isLoading, reviews } = useSelector((state) => state.testimonials);

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  if (reviews.length === 0) {
    if (!isLoading) return null;
    return (
      <div className="my-6 flex animate-pulse gap-3 overflow-hidden" aria-hidden="true">
        {[1, 2, 3].map((card) => (
          <div key={card} className={`${CARD} h-40 rounded-lg bg-gray-200`} />
        ))}
      </div>
    );
  }

  return (
    <section aria-label="What our customers say" className="container mx-auto my-6">
      <SectionHeader title="What Our Customers Say" subtitle="Reviews from the people who shop here." />
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
        {reviews.map((review) => (
          <li key={review.id} className={CARD}>
            <article className="flex h-full flex-col rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-lg font-bold text-white shadow ring-2 ring-indigo-100"
                >
                  {review.reviewer.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{review.reviewer}</p>
                  <Stars rating={review.rating} />
                </div>
              </div>

              {review.verified && (
                <p className="mt-2 inline-flex items-center gap-1 self-start rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <FaCheckCircle aria-hidden="true" className="h-3 w-3" /> Verified buyer
                </p>
              )}

              <blockquote className="mt-3 line-clamp-4 text-sm text-gray-700">“{review.comment}”</blockquote>

              <div className="mt-auto flex items-center gap-3 pt-3">
                {review.image && <img src={review.image} alt="Photo from this review" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
                <Link to={`/products/detail/${review.product_slug}`} className="inline-flex min-h-10 min-w-0 items-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  <span className="truncate">On {review.product_name}</span>
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Testimonials;
