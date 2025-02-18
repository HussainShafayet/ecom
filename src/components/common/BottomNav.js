import { FaHeart, FaHome, FaShoppingBag, FaShoppingCart, FaSignInAlt, FaSignOutAlt, FaUser, FaUserCircle, FaUserPlus } from "react-icons/fa";
import {useDispatch, useSelector} from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {selectCartCount} from "../../redux/slice/cartSlice";
import {useEffect, useRef, useState} from "react";
import {Logout} from "../../redux/slice/authActions";

const BottomNav = () => {
    const cartCount = useSelector(selectCartCount);
    const {isAuthenticated, accessToken, refreshToken} = useSelector((state)=>state.auth);
    const [authMenuOpen, setAuthMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authRef = useRef(null);
    const profileRef = useRef(null);

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (authRef.current && !authRef.current.contains(event.target)) {
            setAuthMenuOpen(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setProfileMenuOpen(false);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);
    const toggleAuthMenu = () => setAuthMenuOpen(!authMenuOpen);

     const handleLogout = () => {
        dispatch(Logout({access: accessToken, refresh: refreshToken}));
        setProfileMenuOpen(false);
        navigate('/'); // Redirect to home page after logout, or choose another route
      };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md md:hidden z-50">
      <div className="flex justify-around items-center py-2">
        {/* Home */}
        <Link to="/" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition">
          <FaHome size={22} />
          <span className="text-xs">Home</span>
        </Link>

        {/* Shop */}
        <Link to="/products" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition">
          <FaShoppingBag size={22} />
          <span className="text-xs">Shop</span>
        </Link>

        
        {/* Always Displayed Cart Icon */}
        <div className="relative">
        
        <Link to="/cart" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition">
            <FaShoppingCart size={20} />
            <span className="text-xs">Cart</span>
        </Link>
        {cartCount > 0 && (
            <span className="absolute top-[-10px] right-[-18px] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {cartCount}
            </span>
        )}
        </div>

        {isAuthenticated && 
            <>
            {/* wishlist */}
            <Link to="/wishlist" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition">
            <FaHeart size={22} />
            <span className="text-xs">Wishlist</span>
            </Link>
            </>
        }
        
        {/* User */}
        {!isAuthenticated ?
        <div className="relative" ref={authRef}>
            <Link to="#" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition" onClick={toggleAuthMenu}>
            <FaUserPlus size={22} />
            <span className="text-xs">Account</span>
            </Link>

            {/* Dropdown for Sign In / Sign Up */}
          {authMenuOpen && (
            <div className="absolute bottom-12 right-0 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
              <Link
                to="/signin"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setAuthMenuOpen(false)}
              >
                <FaSignInAlt className="mr-2 text-blue-500" /> Sign In
              </Link>
              <div className="border-t border-gray-200"></div>
              <Link
                to="/signup"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                onClick={() => setAuthMenuOpen(false)}
              >
                <FaUserPlus className="mr-2 text-green-500" /> Sign Up
              </Link>
            </div>
          )}
        </div>
        : 
        <div className="relative" ref={profileRef}>
            <Link to="#" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition" onClick={toggleProfileMenu}>
            <FaUser size={22} />
            <span className="text-xs">User</span>
            </Link>


             {/* Dropdown for Profile, Wishlist, Logout */}
          {profileMenuOpen && (
            <div className="absolute bottom-12 right-0 w-52 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                onClick={() => setProfileMenuOpen(false)}
              >
                <FaUserCircle className="mr-2 text-blue-500" /> Profile
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                onClick={() => setProfileMenuOpen(false)}
              >
                <FaHeart className="mr-2 text-pink-500" /> Wishlist
              </Link>
              <div className="border-t border-gray-200"></div>
              <button
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition w-full text-left"
                onClick={() => {
                  setProfileMenuOpen(false);
                  handleLogout();
                }}
              >
                <FaSignOutAlt className="mr-2 text-red-500" /> Logout
              </button>
            </div>
          )}
        </div>
        }
      </div>
    </div>
  );
};

export default BottomNav;
