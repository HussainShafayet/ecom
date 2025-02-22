import React, { useEffect, useState } from "react";
import { FaEdit, FaStar, FaUserCircle } from "react-icons/fa";
import {useDispatch, useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import {createReview, fetchReviews, resetReviewFormData, setMediaFiles, updateReview, updateReviewFormData} from "../../../redux/slice/reviewSlice";
import Loader from "../Loader";

const RatingAndReview = ({ product }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [can_edited, setCanEdited] = useState(null);
  const {isAuthenticated, user} = useSelector((state)=>state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const {reviewLoading, reviews, reviewError, can_review, reviewFormData, addReviewCompleted, updateReviewCompleted} = useSelector((state)=> state.review);
  const dispatch = useDispatch();

  useEffect(() => {
    product.id && dispatch(fetchReviews(product.id));
    product && dispatch(updateReviewFormData({ ['product_id']: product.id }))
  }, [product]);

  useEffect(() => {
    addReviewCompleted && dispatch(resetReviewFormData());
  }, [addReviewCompleted]);

  useEffect(() => {
    updateReviewCompleted && setCanEdited(null);
  }, [updateReviewCompleted])

  const getFileType = (url) => {
    if (!url) return "unknown";
  
    const extension = url.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  
    if (imageExtensions.includes(extension)) return "image";
    if (videoExtensions.includes(extension)) return "video";
    
    return "unknown";
  };

  const handleRedirectSignIn = () => {
    navigate('/signin', { state: { from: location } });
  }

   // Handle File Upload
   const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.length > 0 && dispatch(setMediaFiles(files));
    
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
     handleRedirectSignIn(); // Redirect to login if not authenticated
      return;
    }

    //console.log(reviewFormData);
    // Initialize FormData
    const formData = new FormData();
    formData.append("product_id", reviewFormData.product_id);
    formData.append("rating", reviewFormData.rating);
    formData.append("comment", reviewFormData.comment);

    // Append media files
    reviewFormData.media.forEach((file) => formData.append("media", file));

    if (can_edited) {
      dispatch(updateReview({formData, review_id:can_edited}));
    } else {
      dispatch(createReview(formData));
    }
  };

  const handleCanEdited = (review) => {
    setCanEdited(review.id);
    
    dispatch(dispatch(updateReviewFormData({ ['product_id']: review.product_id})));
    dispatch(dispatch(updateReviewFormData({ ['rating']: review.rating})));
    dispatch(dispatch(updateReviewFormData({ ['comment']: review.comment})));
    dispatch(dispatch(updateReviewFormData({ ['media']: review.media_urls})));
    
  }
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
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                    {review.user_name}
                    </span>
                    {/* Review Date */}
                    <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  
                </div>
                {/* edit */}
                {review.can_edited &&
                  <FaEdit className="text-gray-500 hover:text-blue-500 w-6 h-6 cursor-pointer"
                  onClick={() => handleCanEdited(review)}
                   />
                }
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
              <div className="flex overflow-x-auto space-x-4 p-2">
                {review.media_urls.map((file, index) => (
                  <div key={index} className="flex-none w-36 sm:w-44 md:w-52 h-36 sm:h-44 md:h-52">
                    {getFileType(file.file) === 'image' ? (
                      <img
                        src={file.file}
                        className="w-full h-full rounded-lg shadow-md object-cover"
                        alt={`Review media ${index}`}
                      />
                    ) : getFileType(file.file) === 'video' ? (
                      <video controls className="w-full h-full rounded-lg shadow-md">
                        <source src={file.file} type={file.type} />
                        Your browser does not support the video tag.
                      </video>
                    ) : null}
                  </div>
                ))}
              </div>


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
          {can_review || can_edited ? 
          <form onSubmit={handleSubmitReview} className="space-y-4 p-4 border rounded-md shadow-md">
            {/* Rating Selector */}
            <div className="flex items-center">
              <span className="text-gray-600 font-medium mr-4">Your Rating:</span>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-8 w-8 cursor-pointer ${
                      i < (hoverRating || reviewFormData.rating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    onClick={() => dispatch(updateReviewFormData({ ['rating']: i+1}))}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
            </div>

            {/* Review Textarea */}
            <textarea
              placeholder="Share your experience..."
              value={reviewFormData.comment}
              onChange={(e) => dispatch(updateReviewFormData({ ['comment']: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              rows="4"
            ></textarea>

            {/* File Input Field */}
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 p-2 rounded-md cursor-pointer"
            />

            {/* Preview Selected Files */}
            {reviewFormData.media.length > 0 && (
              
                <div className="flex overflow-x-auto space-x-4 mt-2 p-2">
                  {reviewFormData.media.map((file, index) => (
                    <div key={index} className="flex-none w-24 h-24">
                      {file instanceof Blob  ? (
                        file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file) || file.file}
                            className="w-full h-full rounded-lg shadow-md object-cover"
                            alt={`Upload ${index}`}
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Cleanup URL
                          />
                        ) : file.type.startsWith("video/") ? (
                          <video
                            controls
                            className="w-full h-full rounded-lg shadow-md"
                            onLoadedData={(e) => URL.revokeObjectURL(e.target.currentSrc)} // Cleanup URL
                          >
                            <source src={URL.createObjectURL(file)} type={file.type} />
                            Your browser does not support the video tag.
                          </video>
                        ) : null
                      ) : file.file ? 
                      (
                        getFileType(file.file) === 'image' ? (
                          <img
                            src={file.file}
                            className="w-full h-full rounded-lg shadow-md object-cover"
                            alt={`Upload ${index}`}
                            //onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Cleanup URL
                          />
                          ) : getFileType(file.file) === 'video' ? (
                            <video
                              controls
                              className="w-full h-full rounded-lg shadow-md"
                              //onLoadedData={(e) => URL.revokeObjectURL(e.target.currentSrc)} // Cleanup URL
                            >
                              <source src={file.file} />
                              Your browser does not support the video tag.
                            </video>
                        ): null
                      
                      )
                       : null}
                    </div>
                  ))}
                </div>
              )}


            {/* Submit Button */}
            <div className="flex justify-center items-center space-x-2">
            {can_edited && 
            <button
              type="button"
              onClick={() => setCanEdited(false)}
              className="px-4 py-2 w-full bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            }
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50${reviewLoading ? 'cursor-wait' : 'hover:scale-105'
              }`}
              disabled={!reviewFormData.rating || !reviewFormData.comment.trim() || reviewLoading}
              
            >
            {reviewLoading ? (
              <Loader message="Progreccing" />
            ) : (
              <>
                {can_edited? 'Update Review' : 'Submit Review' }
              </>
            )}
            
              
            </button>
            
            </div>
          </form>
        : 
        <p className="text-gray-600">
          You have to buy this product for eligable to add a review.
        </p>
        }

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


