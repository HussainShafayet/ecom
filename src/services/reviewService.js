// src/services/reviewService.js
// What customers say, for the homepage (backend docs/API_CONTRACT.md section 7). Public. The reviews of one product are
// still read and written from reviewSlice.
// { reviews: [{ id, reviewer ("Rahim U."), rating, comment, created_at, verified, product_name, product_slug, image }] }: at most 8,
// empty while the shop has nothing to show. Only decoration, so a failure is kept in its own section and never shown.
export const getFeaturedReviews = async () => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.get('/products/reviews/featured/', { section: "home-testimonials" });
};
