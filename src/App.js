import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Layout } from './components/layout';
import { Profile, SignIn, SignUp, WishList } from './pages/user';
import { Home, Products, ProductDetails, Cart, NotFound, Checkout } from './pages';
import { CartProvider } from './context/CartContext'; // Import CartProvider
import {useDispatch} from 'react-redux';
import {loadUserFromStorage} from './redux/slice/authSlice';
import {useEffect} from 'react';
import {ProtectedRoute} from './components/common';
import {AboutUs, Contact, OrderTracking} from './pages/others';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  
  return (
    <CartProvider> {/* Wrap the Router with CartProvider for global access */}
      <Router>
        <Layout> {/* Directly wrap Layout around Routes */}
          <Routes>
            {/* Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path='/products/category/:category' element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute />}>
              <Route path="" element={<Checkout />} />
            </Route>

            {/* User Pages */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<WishList />} />


            {/* Others Pages */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            {/* <Route path="/wishlist" element={<WishList />} />*/}


            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
