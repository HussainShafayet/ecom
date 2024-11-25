import React, { useState } from "react";
import { FaStar, FaUserCircle } from "react-icons/fa";
import {useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";

const RatingAndReview = ({ reviews = [], product }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const {isAuthenticated, user} = useSelector((state)=>state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRedirectSignIn = () => {
    navigate('/signin', { state: { from: location } });
  }

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
     handleRedirectSignIn(); // Redirect to login if not authenticated
      return;
    }
    
    if (rating && reviewText.trim() && user.trim()) {
      const newReview = {
        reviewerName: user,
        comment: reviewText,
        rating,
        date: new Date().toLocaleDateString(), // Add current date
      };
    //  onAddReview(newReview);
      setRating(0); // Reset rating
      setReviewText(""); // Reset review text
      setReviewerName(""); // Reset reviewer name
    }
  };
  return (
    <div className="shadow-md rounded-lg p-4">
      {/* Header */}
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        Customer Reviews
      </h3>

      {/* Existing Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-6 mb-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-white transition-transform"
            >
              <div className="flex justify-between items-center mb-3">
                {/* Reviewer Name */}
                <div className="flex items-center space-x-2">
                  <FaUserCircle className="text-gray-400 w-6 h-6" />
                  <span className="text-sm font-medium text-gray-800">
                    {review.reviewerName}
                  </span>
                </div>
                {/* Review Date */}
                <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              {/* Review Rating */}
              <div className="flex items-center mb-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
              </div>
              {/* Review Text */}
              <p className="text-gray-700 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 mb-8">
          No reviews yet. Be the first to share your experience!
        </p>
      )}

      {/* Add Review Section */}
      <div className="border-t border-gray-300 pt-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">
          Write a Review
        </h4>

        {isAuthenticated ?
        <div className="space-y-4">

          {/* Rating Selector */}
          <div className="flex items-center">
            <span className="text-gray-600 font-medium mr-4">Your Rating:</span>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <FaStar
                  key={i}
                  className={`h-8 w-8 cursor-pointer ${
                    i < (hoverRating || rating)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
          </div>

          {/* Review Textarea */}
          <textarea
            placeholder="Share your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows="4"
          ></textarea>

          {/* Submit Button */}
          <button
            onClick={handleSubmitReview}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
            disabled={!rating || !reviewText.trim()}
          >
            Submit Review
          </button>
        </div>
        : (
        <p className="text-gray-600">
          <button
            className="text-blue-500 underline"
            onClick={handleRedirectSignIn}
          >
            Sign in
          </button>{' '}
          to add a review.
        </p>
      )}

      </div>
    </div>
  );
};

export default RatingAndReview;


