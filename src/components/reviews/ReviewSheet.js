import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaImage, FaPlay, FaStar, FaTimes } from 'react-icons/fa';
import { createReview, removeMediaAt, resetReviewFormData, setMediaFiles, updateReview, updateReviewFormData } from '../../redux/slice/reviewSlice';
import { pushToast } from '../../redux/slice/toastSlice';
import useDialog from '../../hooks/useDialog';
import { isVideo } from '../../utils/reviews';

const MAX_FILES = 5; // the backend's limit per review (existing files count)
const MAX_COMMENT = 2000;
const WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

// Writing (or changing) a review, in a sheet that comes up from the bottom on a phone and is a dialog from `md` (`useDialog`: focus in and back,
// Tab kept inside, Esc closes). It used to sit open in the middle of the page. The form's values live in the review slice (`reviewFormData`).
// The shop's refusal ("You have already reviewed this product", a file too big) is said under the form: it used to be kept in the slice and
// shown nowhere.
//   editing   the id of the review being changed, or null for a new one
//   onClose   called when the sheet should go (Esc, Cancel, the X, or after the shop took the review)
const ReviewSheet = ({ editing = null, onClose }) => {
  const dispatch = useDispatch();
  const { reviewFormData: form, addReviewLoading } = useSelector((state) => state.review);
  const [hoverRating, setHoverRating] = useState(0);
  const [problem, setProblem] = useState('');
  const [note, setNote] = useState('');
  const dialog = useRef(null);
  useDialog(dialog, onClose);

  // What the customer picked, as pictures to look at (a browser-made URL for a new file, the shop's for one already saved); the URLs are given back when they change
  const previews = useMemo(() => form.media.map((file) => (file instanceof Blob
    ? { url: URL.createObjectURL(file), video: file.type.startsWith('video/'), mine: true }
    : { url: file.file, video: isVideo(file), mine: false })), [form.media]);
  useEffect(() => () => previews.forEach((item) => item.mine && URL.revokeObjectURL(item.url)), [previews]);

  const pick = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = ''; // the same file may be picked again after it was removed
    const room = MAX_FILES - form.media.length;
    setNote(files.length > room ? `Only ${MAX_FILES} pictures or videos can go with a review.` : '');
    if (files.length > 0 && room > 0) dispatch(setMediaFiles(files.slice(0, room)));
  };

  const submit = async (event) => {
    event.preventDefault();
    setProblem('');
    const body = new FormData();
    body.append('product_id', form.product_id);
    body.append('rating', form.rating);
    body.append('comment', form.comment.trim());
    form.media.forEach((file) => file instanceof Blob && body.append('media', file));

    const result = editing
      ? await dispatch(updateReview({ formData: body, review_id: editing }))
      : await dispatch(createReview(body));
    const done = editing ? updateReview.fulfilled.match(result) : createReview.fulfilled.match(result);
    if (done) {
      dispatch(resetReviewFormData());
      dispatch(updateReviewFormData({ product_id: form.product_id }));
      dispatch(pushToast(editing ? 'Your review is updated.' : 'Thank you! Your review is up.', 'success'));
      onClose();
    } else {
      setProblem(result.payload?.errors?.[0] || result.payload?.message || result.payload?.error || 'Your review could not be saved. Please try again.');
    }
  };

  const ready = form.rating > 0 && form.comment.trim().length > 0 && !addReviewLoading;
  const shownRating = hoverRating || form.rating;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center md:p-4">
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="review-sheet-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl outline-none motion-safe:animate-slide-up md:animate-none md:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 id="review-sheet-title" className="text-lg font-bold text-gray-900">{editing ? 'Edit your review' : 'Write a review'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
            <div>
              <span id="review-rating-label" className="mb-1 block text-sm font-medium text-gray-700">Your rating</span>
              <div className="flex items-center gap-3">
                <div role="radiogroup" aria-labelledby="review-rating-label" className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={form.rating === value}
                      aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                      onClick={() => dispatch(updateReviewFormData({ rating: value }))}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <FaStar aria-hidden="true" className={`h-8 w-8 transition-colors ${value <= shownRating ? 'text-yellow-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <span aria-live="polite" className="text-sm font-medium text-gray-600">{WORDS[shownRating]}</span>
              </div>
            </div>

            <div>
              <label htmlFor="review-comment" className="mb-1 block text-sm font-medium text-gray-700">Your review</label>
              <textarea
                id="review-comment"
                placeholder="What did you like or dislike? How did you use it?"
                value={form.comment}
                maxLength={MAX_COMMENT}
                rows={5}
                onChange={(event) => dispatch(updateReviewFormData({ comment: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{form.comment.length}/{MAX_COMMENT}</p>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Photos or videos <span className="font-normal text-gray-400">(optional, up to {MAX_FILES})</span></span>
              <ul className="flex flex-wrap gap-2">
                {previews.map((item, index) => (
                  <li key={item.url} className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                    {item.video ? (
                      <span className="flex h-full w-full items-center justify-center bg-gray-900 text-white"><FaPlay aria-hidden="true" /></span>
                    ) : (
                      <img src={item.url} alt={`Picture ${index + 1} of your review`} className="h-full w-full object-cover" />
                    )}
                    {item.mine && (
                      <button
                        type="button"
                        onClick={() => dispatch(removeMediaAt(index))}
                        aria-label={`Remove ${item.video ? 'video' : 'picture'} ${index + 1}`}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-xs text-white hover:bg-black"
                      >
                        <FaTimes aria-hidden="true" />
                      </button>
                    )}
                  </li>
                ))}
                {form.media.length < MAX_FILES && (
                  <li>
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 transition-colors hover:border-indigo-400 focus-within:ring-2 focus-within:ring-blue-400">
                      <FaImage aria-hidden="true" className="text-lg" />
                      Add
                      <input type="file" multiple accept="image/*,video/*" onChange={pick} aria-label="Add photos or videos" className="sr-only" />
                    </label>
                  </li>
                )}
              </ul>
              {note && <p className="mt-2 text-xs text-amber-700">{note}</p>}
            </div>

            {problem && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{problem}</p>}
          </div>

          <div className="flex gap-3 border-t border-gray-100 px-5 py-3">
            <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={!ready}
              className="h-11 flex-1 rounded-lg bg-blue-600 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addReviewLoading ? 'Saving...' : editing ? 'Update review' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReviewSheet;
