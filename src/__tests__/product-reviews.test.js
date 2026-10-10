// The reviews of a product: the summary (average, how many, the customers' photos), the filters and the order, one review (initial, stars, long
// words folded, pictures, the customer's own with Edit), the next 30 on "Load more", and writing or changing one in a sheet. The slice and the
// components are real, the shop's answers are mocked (backend docs/API_CONTRACT.md section 7).
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import reviewReducer, {fetchReviews} from '../redux/slice/reviewSlice';
import authReducer from '../redux/slice/authSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import RatingAndReview from '../components/common/product/RatingAndReview';
import {averageOf, countReviews, filterReviews, initials, reviewMedia, sortReviews} from '../utils/reviews';

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn()}}));
vi.mock('swiper/react', () => ({
  Swiper: ({children}) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({children}) => <div>{children}</div>,
}));

const review = (id, extra = {}) => ({
  id, product_id: 23, user_name: `Reviewer ${id}`, rating: 5, comment: `Comment ${id}`,
  created_at: `2026-09-${String(30 - id).padStart(2, '0')}T10:00:00+06:00`, can_edited: false, media_urls: [], ...extra,
});
const photo = (n) => ({file: `https://shop.test/r${n}.jpg`, type: 'image/jpeg'});
const page = (results, extra = {}) => ({data: {data: {count: results.length, next: null, previous: null, results, can_review: false, review_status: 'not_purchased', order_id: null, ...extra}}});

const makeStore = (signedIn = true) => configureStore({
  reducer: {review: reviewReducer, auth: authReducer, toast: toastReducer},
  preloadedState: {auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: signedIn}},
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

const renderReviews = async (answer, {signedIn = true, product = {id: 23, name: 'Blue Kettle', avg_rating: 4.3, total_reviews: 12}} = {}) => {
  api.get.mockResolvedValue(answer);
  const store = makeStore(signedIn);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RatingAndReview product={product} />
      </MemoryRouter>
    </Provider>
  );
  await screen.findByRole('heading', {name: 'Customer reviews'});
  await waitFor(() => expect(store.getState().review.reviewLoading).toBe(false));
  return store;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('The helpers', () => {
  const list = [
    review(1, {rating: 5, media_urls: [photo(1)]}),
    review(2, {rating: 3}),
    review(3, {rating: 5, media_urls: [{file: 'https://shop.test/v.mp4', type: 'video/mp4'}]}),
    review(4, {rating: 1}),
  ];

  it('count what each filter would show, and filter by them', () => {
    expect(countReviews(list)).toEqual({all: 4, photos: 2, 5: 2, 4: 0, 3: 1, 2: 0, 1: 1});
    expect(filterReviews(list, 'photos').map((r) => r.id)).toEqual([1, 3]);
    expect(filterReviews(list, '5').map((r) => r.id)).toEqual([1, 3]);
    expect(filterReviews(list, 3).map((r) => r.id)).toEqual([2]);
    expect(filterReviews(list, 'all')).toBe(list);
  });

  it('sort newest, highest or lowest first, the newer one winning a tie', () => {
    // review(1) is the newest (the lower the id, the later the date)
    expect(sortReviews(list, 'newest').map((r) => r.id)).toEqual([1, 2, 3, 4]);
    expect(sortReviews(list, 'highest').map((r) => r.id)).toEqual([1, 3, 2, 4]); // the two 5-star ones: the newer first
    expect(sortReviews(list, 'lowest').map((r) => r.id)).toEqual([4, 2, 1, 3]);
  });

  it('read a video by its type or its file name, and turn names into initials', () => {
    expect(reviewMedia(list[2])).toEqual([{file_url: 'https://shop.test/v.mp4', thumbnail_url: null, file_type: 'video'}]);
    expect(reviewMedia({media_urls: [{file: 'https://shop.test/clip.webm', type: ''}]})[0].file_type).toBe('video');
    expect(reviewMedia({media_urls: [{file: ''}]})).toEqual([]);
    expect(initials('Rahim U.')).toBe('RU');
    expect(initials('Customer')).toBe('C');
    expect(initials('')).toBe('C');
    expect(averageOf(list)).toBe(3.5);
    expect(averageOf([])).toBe(0);
  });
});

describe('The summary', () => {
  it('shows the shop\'s own average and count while only the first page is read', async () => {
    await renderReviews(page([review(1), review(2)], {count: 12, next: 'page-2'}));
    expect(screen.getByText('4.3')).toBeTruthy();
    expect(screen.getByText('Based on 12 reviews')).toBeTruthy();
    expect(screen.getByRole('img', {name: 'Rated 4.3 out of 5 from 12 reviews'})).toBeTruthy();
  });

  it('works the average out itself once every review is in hand (it is right at once after the customer\'s own)', async () => {
    await renderReviews(page([review(1, {rating: 5}), review(2, {rating: 4}), review(3, {rating: 3})]), {product: {id: 23, avg_rating: 5, total_reviews: 1}});
    expect(screen.getByText('4.0')).toBeTruthy();
    expect(screen.getByText('Based on 3 reviews')).toBeTruthy();
  });

  it('invites the first review when there is none', async () => {
    await renderReviews(page([]), {product: {id: 23}});
    expect(screen.getByText(/No reviews yet/)).toBeTruthy();
    expect(screen.queryByRole('group', {name: 'Filter reviews'})).toBeNull();
  });

  it('collects the customers\' photos, shows eight and how many more, and opens one full screen', async () => {
    const many = Array.from({length: 10}, (_, index) => review(index + 1, {media_urls: [photo(index + 1)]}));
    await renderReviews(page(many));
    const strip = within(screen.getByText('Photos from customers').closest('div'));
    expect(strip.getAllByRole('button')).toHaveLength(8);
    expect(strip.getByText('+2')).toBeTruthy();

    fireEvent.click(strip.getByRole('button', {name: /Open photo 3 of 10 from customers/}));

    const viewer = await screen.findByRole('dialog', {name: 'Blue Kettle reviews: pictures'});
    expect(within(viewer).getByText('3 / 10')).toBeTruthy();
  });
});

describe('The filters', () => {
  const list = [review(1, {rating: 5, media_urls: [photo(1)]}), review(2, {rating: 3}), review(3, {rating: 5}), review(4, {rating: 1})];

  it('offer only what exists: All, With photos and the star ratings that have a review, with their counts', async () => {
    await renderReviews(page(list));
    const chips = within(screen.getByRole('group', {name: 'Filter reviews'})).getAllByRole('button').map((chip) => chip.textContent.replace(/\s+/g, ' ').trim());
    expect(chips).toEqual(['All4', 'With photos1', '5 stars2', '3 stars1', '1 star1']);
    // the screen-reader-only words in the chips are position:absolute: the scrolling row must be positioned, or they widen the whole page on a phone
    expect(screen.getByRole('group', {name: 'Filter reviews'}).className).toContain('relative');
  });

  it('show only the reviews that match, and say so when none does after a new list', async () => {
    await renderReviews(page(list));
    fireEvent.click(screen.getByRole('button', {name: /5 stars/}));
    expect(screen.getAllByText(/^Reviewer \d$/).map((element) => element.textContent)).toEqual(['Reviewer 1', 'Reviewer 3']);
    expect(screen.getByRole('button', {name: /5 stars/}).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', {name: /With photos/}));
    expect(screen.getAllByText(/^Reviewer \d$/)).toHaveLength(1);
  });

  it('sort the reviews', async () => {
    await renderReviews(page(list));
    fireEvent.change(screen.getByLabelText('Sort reviews'), {target: {value: 'lowest'}});
    expect(screen.getAllByText(/^Reviewer \d$/).map((element) => element.textContent)).toEqual(['Reviewer 4', 'Reviewer 2', 'Reviewer 1', 'Reviewer 3']);
  });

  it('are not offered for a single review', async () => {
    await renderReviews(page([review(1)]));
    expect(screen.queryByRole('group', {name: 'Filter reviews'})).toBeNull();
  });
});

describe('One review', () => {
  it('has the reviewer\'s initial, stars a screen reader can read, the date and the words', async () => {
    await renderReviews(page([review(1, {user_name: 'Rahim U.', rating: 4, comment: 'Boils fast'})]));
    expect(screen.getByText('RU')).toBeTruthy();
    expect(screen.getByRole('img', {name: '4 out of 5 stars'})).toBeTruthy();
    expect(screen.getByText('Boils fast')).toBeTruthy();
    expect(screen.getByText(/2026/)).toBeTruthy();
  });

  it('folds a long comment to four lines with Read more, and unfolds it', async () => {
    await renderReviews(page([review(1, {comment: 'word '.repeat(80)})]));
    const words = screen.getByText(/^word word/);
    expect(words.className).toContain('line-clamp-4');
    fireEvent.click(screen.getByRole('button', {name: 'Read more'}));
    expect(words.className).not.toContain('line-clamp-4');
    expect(screen.getByRole('button', {name: 'Show less'}).getAttribute('aria-expanded')).toBe('true');
  });

  it('opens its own pictures full screen from its thumbnails', async () => {
    await renderReviews(page([review(1, {media_urls: [photo(1), photo(2)]}), review(2)]));
    fireEvent.click(screen.getByRole('button', {name: /Open photo 2 of 2 in Reviewer 1's review/}));
    const viewer = await screen.findByRole('dialog', {name: 'Blue Kettle reviews: pictures'});
    expect(within(viewer).getByText('2 / 2')).toBeTruthy();
  });

  it('says it is the customer\'s own and has an Edit button, a real one', async () => {
    await renderReviews(page([review(1, {can_edited: true}), review(2)], {review_status: 'reviewed'}));
    expect(screen.getByText('Your review')).toBeTruthy();
    expect(screen.getAllByRole('button', {name: 'Edit your review'})).toHaveLength(1);
  });
});

describe('Writing and changing a review', () => {
  const canReview = {can_review: true, review_status: 'can_review'};

  it('opens in a sheet from the button, with Submit off until there is a rating and some words, and Esc closes it', async () => {
    await renderReviews(page([], canReview));
    fireEvent.click(screen.getByRole('button', {name: 'Write a review'}));

    const sheet = await screen.findByRole('dialog', {name: 'Write a review'});
    const submit = within(sheet).getByRole('button', {name: 'Submit review'});
    expect(submit.disabled).toBe(true);
    fireEvent.click(within(sheet).getByRole('radio', {name: '4 stars'}));
    expect(within(sheet).getByText('Very good')).toBeTruthy();
    expect(submit.disabled).toBe(true); // still no words
    fireEvent.change(within(sheet).getByLabelText('Your review'), {target: {value: '  Works well  '}});
    expect(submit.disabled).toBe(false);

    fireEvent.keyDown(document, {key: 'Escape'});
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('sends the product, the stars, the trimmed words and the files, then closes, thanks the customer and puts the review first', async () => {
    const store = await renderReviews(page([review(5)], canReview));
    api.post.mockResolvedValue({data: {data: review(9, {user_name: 'Me', rating: 4, comment: 'Works well', can_edited: true})}});
    fireEvent.click(screen.getByRole('button', {name: 'Write a review'}));
    const sheet = await screen.findByRole('dialog', {name: 'Write a review'});
    fireEvent.click(within(sheet).getByRole('radio', {name: '4 stars'}));
    fireEvent.change(within(sheet).getByLabelText('Your review'), {target: {value: '  Works well  '}});
    const file = new File(['x'], 'kettle.jpg', {type: 'image/jpeg'});
    URL.createObjectURL = vi.fn(() => 'blob:kettle');
    URL.revokeObjectURL = vi.fn();
    fireEvent.change(within(sheet).getByLabelText('Add photos or videos'), {target: {files: [file]}});
    expect(await within(sheet).findByAltText('Picture 1 of your review')).toBeTruthy();

    fireEvent.click(within(sheet).getByRole('button', {name: 'Submit review'}));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const body = api.post.mock.calls[0][1];
    expect(api.post.mock.calls[0][0]).toBe('/products/reviews/');
    expect(body.get('product_id')).toBe('23');
    expect(body.get('rating')).toBe('4');
    expect(body.get('comment')).toBe('Works well');
    expect(body.getAll('media')).toHaveLength(1);
    expect(store.getState().review.reviews.map((r) => r.id)).toEqual([9, 5]); // newest first
    expect(store.getState().review.reviewsCount).toBe(2);
    expect(store.getState().toast.items[0]).toMatchObject({message: 'Thank you! Your review is up.', type: 'success'});
    expect(screen.getByText(/You have already reviewed this product/)).toBeTruthy(); // one per product: the button is gone
    expect(screen.queryByRole('button', {name: 'Write a review'})).toBeNull();
  });

  it('says what the shop said when it refuses, and stays open', async () => {
    await renderReviews(page([], canReview));
    api.post.mockRejectedValue({response: {data: {success: false, errors: ['You have already reviewed this product. Edit your review instead.']}}});
    fireEvent.click(screen.getByRole('button', {name: 'Write a review'}));
    const sheet = await screen.findByRole('dialog', {name: 'Write a review'});
    fireEvent.click(within(sheet).getByRole('radio', {name: '5 stars'}));
    fireEvent.change(within(sheet).getByLabelText('Your review'), {target: {value: 'Great'}});

    fireEvent.click(within(sheet).getByRole('button', {name: 'Submit review'}));

    expect((await within(sheet).findByRole('alert')).textContent).toContain('You have already reviewed this product');
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('takes five files at most, says so, and lets a picked one be taken out again', async () => {
    await renderReviews(page([], canReview));
    URL.createObjectURL = vi.fn((file) => `blob:${file.name}`);
    URL.revokeObjectURL = vi.fn();
    fireEvent.click(screen.getByRole('button', {name: 'Write a review'}));
    const sheet = await screen.findByRole('dialog', {name: 'Write a review'});
    const files = Array.from({length: 7}, (_, index) => new File(['x'], `p${index}.jpg`, {type: 'image/jpeg'}));

    fireEvent.change(within(sheet).getByLabelText('Add photos or videos'), {target: {files}});

    expect(await within(sheet).findAllByAltText(/Picture \d of your review/)).toHaveLength(5);
    expect(within(sheet).getByText('Only 5 pictures or videos can go with a review.')).toBeTruthy();
    expect(within(sheet).queryByLabelText('Add photos or videos')).toBeNull(); // full: no more room

    fireEvent.click(within(sheet).getByRole('button', {name: 'Remove picture 2'}));
    expect(within(sheet).getAllByAltText(/Picture \d of your review/)).toHaveLength(4);
    expect(within(sheet).getByLabelText('Add photos or videos')).toBeTruthy();
  });

  it('opens a customer\'s own review with its stars and words in the form, and updates it', async () => {
    const mine = review(7, {can_edited: true, rating: 2, comment: 'Meh'});
    await renderReviews(page([mine], {review_status: 'reviewed'}));
    api.put.mockResolvedValue({data: {data: {...mine, rating: 4, comment: 'Better now'}}});

    fireEvent.click(screen.getByRole('button', {name: 'Edit your review'}));
    const sheet = await screen.findByRole('dialog', {name: 'Edit your review'});
    expect(within(sheet).getByLabelText('Your review').value).toBe('Meh');
    expect(within(sheet).getByRole('radio', {name: '2 stars'}).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(within(sheet).getByRole('radio', {name: '4 stars'}));
    fireEvent.change(within(sheet).getByLabelText('Your review'), {target: {value: 'Better now'}});
    fireEvent.click(within(sheet).getByRole('button', {name: 'Update review'}));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(api.put.mock.calls[0][0]).toBe('/products/reviews/7/');
    expect(await screen.findByText('Better now')).toBeTruthy();
  });

  it('asks a guest to sign in instead', async () => {
    await renderReviews(page([], {review_status: 'guest'}), {signedIn: false});
    expect(screen.getByRole('button', {name: 'Sign in to write a review'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Write a review'})).toBeNull();
  });
});

describe('Load more', () => {
  it('reads the next 30, adds them under the others (never twice) and goes when there are no more', async () => {
    const store = await renderReviews(page([review(1), review(2)], {count: 4, next: 'page-2'}));
    expect(screen.getByText('Showing 2 of 4 reviews')).toBeTruthy();
    api.get.mockResolvedValue(page([review(2), review(3), review(4)], {count: 4, next: null}));

    fireEvent.click(screen.getByRole('button', {name: 'Load more reviews'}));

    await waitFor(() => expect(screen.getAllByText(/^Reviewer \d$/)).toHaveLength(4));
    expect(api.get).toHaveBeenLastCalledWith('/products/reviews/?product_id=23&page=2', {section: 'more-reviews', optionalAuth: true});
    expect(store.getState().review.reviews.map((r) => r.id)).toEqual([1, 2, 3, 4]);
    expect(screen.queryByRole('button', {name: 'Load more reviews'})).toBeNull();
  });

  it('says when it could not, and can be tried again', async () => {
    await renderReviews(page([review(1)], {count: 2, next: 'page-2'}));
    api.get.mockRejectedValue({response: {data: {success: false}}});

    fireEvent.click(screen.getByRole('button', {name: 'Load more reviews'}));

    expect((await screen.findByRole('alert')).textContent).toContain('Could not load more reviews');
    expect(screen.getByRole('button', {name: 'Load more reviews'}).disabled).toBe(false);
  });
});

describe('The review state', () => {
  it('does not keep the previous product\'s reviews under the next while they arrive', async () => {
    api.get.mockResolvedValue(page([review(1), review(2)], {count: 2}));
    const store = makeStore();
    await store.dispatch(fetchReviews(23));
    expect(store.getState().review.reviews).toHaveLength(2);

    api.get.mockReturnValue(new Promise(() => {})); // the next product's answer is on its way
    store.dispatch(fetchReviews(24));

    expect(store.getState().review).toMatchObject({reviews: [], reviewsCount: 0, reviewsFor: 24});
  });
});
