// Why a customer can not review yet: the review form area of the product page, with the real slice and a mocked
// authenticated client (backend: GET /products/reviews/ answers can_review, review_status and order_id).
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import reviewReducer, {createReview, fetchReviews} from '../redux/slice/reviewSlice';
import authReducer, {logoutUser} from '../redux/slice/authSlice';
import api from '../api/axiosSetup';
import RatingAndReview from '../components/common/product/RatingAndReview';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));

const NUMBER = 'GC-20260924-0001';
const page = (extra) => ({data: {data: {count: 0, next: null, previous: null, results: [], can_review: false, review_status: 'not_purchased', order_id: null, ...extra}}});

const makeStore = (signedIn = true) => configureStore({
  reducer: {review: reviewReducer, auth: authReducer},
  preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderReviews = (signedIn = true) => {
  const store = makeStore(signedIn);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RatingAndReview product={{id: 23}} />
      </MemoryRouter>
    </Provider>
  );
  return store;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('The review area says why a customer can not review yet', () => {
  it('tells someone whose order is on its way to wait for delivery, and links to that order', async () => {
    api.get.mockResolvedValue(page({review_status: 'waiting_for_delivery', order_id: NUMBER}));
    renderReviews();

    expect(await screen.findByText(/once your order has been delivered/)).toBeTruthy();
    expect(screen.getByText('View my order').getAttribute('href')).toBe(`/orders/${NUMBER}`);
    expect(screen.queryByText('Submit Review')).toBeNull();
    expect(api.get).toHaveBeenCalledWith('products/reviews/?product_id=23', {section: 'get-review'});
  });

  it('does not tell a customer who has not bought it that they only have to buy it (the old, misleading text)', async () => {
    api.get.mockResolvedValue(page({review_status: 'not_purchased'}));
    renderReviews();

    expect(await screen.findByText(/once you have bought it and your order has been delivered/)).toBeTruthy();
    expect(screen.queryByText(/eligable/)).toBeNull();
    expect(screen.queryByText('View my order')).toBeNull();
  });

  it('says a customer who already reviewed it has, and points at the edit icon', async () => {
    api.get.mockResolvedValue(page({review_status: 'reviewed'}));
    renderReviews();
    expect(await screen.findByText(/You have already reviewed this product/)).toBeTruthy();
  });

  it('shows the form, and no excuse, when they can review', async () => {
    api.get.mockResolvedValue(page({can_review: true, review_status: 'can_review'}));
    renderReviews();

    expect(await screen.findByText('Submit Review')).toBeTruthy();
    expect(screen.queryByText(/once your order has been delivered/)).toBeNull();
    expect(screen.queryByText(/already reviewed/)).toBeNull();
  });

  it('falls back to the general rule when the backend sends no review_status', async () => {
    api.get.mockResolvedValue({data: {data: {results: [], can_review: false}}});
    renderReviews();
    expect(await screen.findByText(/You can review a product once you have bought it/)).toBeTruthy();
  });

  it('asks a guest to sign in (and shows none of the above)', async () => {
    api.get.mockResolvedValue(page({review_status: 'guest'}));
    renderReviews(false);

    expect(await screen.findByText('Sign in')).toBeTruthy();
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(screen.queryByText(/once your order has been delivered/)).toBeNull();
  });
});

describe('The review state', () => {
  it('closes the form for good after a review is written (one per product)', async () => {
    api.get.mockResolvedValue(page({can_review: true, review_status: 'can_review'}));
    api.post.mockResolvedValue({data: {data: {id: 1, product_id: 23, user_name: 'Rahim', rating: 5, comment: 'Good', created_at: '2026-09-24T10:00:00+06:00', can_edited: true, media_urls: []}}});
    const store = makeStore();
    await store.dispatch(fetchReviews(23));
    expect(store.getState().review).toMatchObject({can_review: true, review_status: 'can_review'});

    await store.dispatch(createReview(new FormData()));

    expect(store.getState().review).toMatchObject({can_review: false, review_status: 'reviewed', review_order_id: null});
    expect(store.getState().review.reviews).toHaveLength(1);
  });

  it('forgets the customer on logout (which reviews they may edit, whether they may review)', async () => {
    api.get.mockResolvedValue(page({can_review: true, review_status: 'can_review', results: [{id: 1, can_edited: true}]}));
    const store = makeStore();
    await store.dispatch(fetchReviews(23));

    store.dispatch({type: logoutUser.fulfilled.type});

    expect(store.getState().review).toMatchObject({can_review: false, review_status: null, reviews: []});
  });
});
