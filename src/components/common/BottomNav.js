import { FaHeart, FaHome, FaShoppingBag, FaShoppingCart, FaSignInAlt, FaUser, FaUserPlus } from "react-icons/fa";
import {useSelector} from "react-redux";
import { Link } from "react-router-dom";
import {selectCartCount} from "../../redux/slice/cartSlice";
import {useState} from "react";

const BottomNav = () => {
    const cartCount = useSelector(selectCartCount);
    const {isAuthenticated, accessToken, refreshToken} = useSelector((state)=>state.auth);
    const [authMenuOpen, setAuthMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);
    const toggleAuthMenu = () => setAuthMenuOpen(!authMenuOpen);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md md:hidden">
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
        <div className="relative">
            <Link to="#" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition">
            <FaUserPlus size={22} />
            <span className="text-xs">Account</span>
            </Link>
        </div>
        : 
        <div className="relative">
            <Link to="#" className="flex flex-col items-center text-gray-700 hover:text-blue-500 transition">
            <FaUser size={22} />
            <span className="text-xs">User</span>
            </Link>
        </div>
        }
      </div>
    </div>
  );
};

export default BottomNav;
