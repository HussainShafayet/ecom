// "What Our Customers Say" on the homepage: real reviews (backend docs/API_CONTRACT.md section 7, GET /products/reviews/featured/:
// the ones the staff ticked, else the shop's own pick). services/reviewService is mocked.
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import testimonialsReducer, {fetchTestimonials} from '../redux/slice/testimonialsSlice';
import {Testimonials} from '../components/sections';
import {getFeaturedReviews} from '../services/reviewService';

vi.mock('../services/reviewService', () => ({getFeaturedReviews: vi.fn()}));

const REVIEW = {
  id: 1, reviewer: 'Rahim U.', rating: 4, comment: 'Really good quality, it arrived on time.', created_at: '2026-09-30T10:00:00Z',
  verified: true, product_name: 'Modern Table Lamp', product_slug: 'modern-table-lamp', image: null,
};
const answer = (reviews) => ({data: {success: true, data: {reviews}}});

const makeStore = () => configureStore({
  reducer: {testimonials: testimonialsReducer},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderSection = () => {
  const store = makeStore();
  const utils = render(<Provider store={store}><MemoryRouter><Testimonials /></MemoryRouter></Provider>);
  return {store, ...utils};
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('fetchTestimonials', () => {
  it('keeps the reviews the shop answered with', async () => {
    getFeaturedReviews.mockResolvedValue(answer([REVIEW]));
    const store = makeStore();
    await store.dispatch(fetchTestimonials());
    expect(store.getState().testimonials).toEqual({reviews: [REVIEW], isLoading: false});
  });

  it('keeps what it had when a later request fails, and is empty when the first one does', async () => {
    const store = makeStore();
    getFeaturedReviews.mockRejectedValueOnce({response: {status: 500, data: {success: false, errors: ['Something went wrong.']}}});
    await store.dispatch(fetchTestimonials());
    expect(store.getState().testimonials).toEqual({reviews: [], isLoading: false});

    getFeaturedReviews.mockResolvedValueOnce(answer([REVIEW]));
    await store.dispatch(fetchTestimonials());
    getFeaturedReviews.mockRejectedValueOnce(new Error('offline'));
    await store.dispatch(fetchTestimonials());
    expect(store.getState().testimonials.reviews).toEqual([REVIEW]);
  });

  it('is an empty list for an answer that is not a list', async () => {
    getFeaturedReviews.mockResolvedValue({data: {data: {}}});
    const store = makeStore();
    await store.dispatch(fetchTestimonials());
    expect(store.getState().testimonials.reviews).toEqual([]);
  });
});

describe('The testimonials section', () => {
  it('draws each review: who, the stars, the words, and where to buy what they bought', async () => {
    getFeaturedReviews.mockResolvedValue(answer([REVIEW]));
    renderSection();

    const card = (await screen.findByText('Rahim U.')).closest('article');
    expect(screen.getByRole('heading', {name: 'What Our Customers Say'})).toBeTruthy();
    expect(within(card).getByRole('img', {name: '4 out of 5 stars'})).toBeTruthy();
    expect(within(card).getByText(/Really good quality, it arrived on time\./)).toBeTruthy();
    expect(within(card).getByText('R')).toBeTruthy(); // the avatar is the initial: no placeholder photo
    expect(within(card).getByText('Verified buyer')).toBeTruthy();
    expect(within(card).getByRole('link', {name: 'On Modern Table Lamp'}).getAttribute('href')).toBe('/products/detail/modern-table-lamp');
    expect(card.querySelector('img')).toBeNull(); // no photo on this review
  });

  it('says "Verified buyer" only for a review that came from a purchase, and shows its photo if it has one', async () => {
    getFeaturedReviews.mockResolvedValue(answer([
      REVIEW,
      {...REVIEW, id: 2, reviewer: 'Customer', verified: false, rating: 5, image: 'http://127.0.0.1:8000/media/reviews/a.png'},
    ]));
    renderSection();

    await screen.findByText('Rahim U.');
    expect(screen.getAllByText('Verified buyer')).toHaveLength(1);
    const photo = screen.getByAltText('Photo from this review');
    expect(photo.getAttribute('src')).toBe('http://127.0.0.1:8000/media/reviews/a.png');
    expect(photo.closest('article').textContent).toContain('Customer');
  });

  it('draws nothing when the shop has no review to show', async () => {
    getFeaturedReviews.mockResolvedValue(answer([]));
    const {container} = renderSection();

    await waitFor(() => expect(getFeaturedReviews).toHaveBeenCalled());
    await waitFor(() => expect(container.innerHTML).toBe(''));
  });

  it('draws nothing, and no error, when the reviews cannot be loaded', async () => {
    getFeaturedReviews.mockRejectedValue({response: {status: 500, data: {success: false, errors: ['Something went wrong.']}}});
    const {container} = renderSection();

    await waitFor(() => expect(getFeaturedReviews).toHaveBeenCalled());
    await waitFor(() => expect(container.innerHTML).toBe(''));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText(/try again/i)).toBeNull();
  });

  it('holds its place with a quiet skeleton while the reviews are on their way', async () => {
    let answerLater;
    getFeaturedReviews.mockReturnValue(new Promise((resolve) => { answerLater = resolve; }));
    const {container} = renderSection();

    await waitFor(() => expect(container.querySelector('.animate-pulse')).toBeTruthy());
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy(); // not read out by a screen reader

    answerLater(answer([REVIEW]));
    expect(await screen.findByText('Rahim U.')).toBeTruthy();
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });
});
