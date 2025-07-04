import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Layout } from './components/layout';
import { Profile, SignIn, SignUp, VerifyOtp, WishList } from './pages/user';
import { Home, Products, ProductDetails, Cart, NotFound, Checkout, Categories, OrderConfirmation } from './pages';
import {useDispatch} from 'react-redux';
import {loadUserFromStorage} from './redux/slice/authSlice';
import {useEffect, useRef} from 'react';
import {GlobalErrorHandler, ProtectedRoute, ScrollToTop} from './components/common';
import {AboutUs, Contact, FAQPage, OrderTracking, PrivacyPolicy} from './pages/others';
import {BestSelling, FeaturedProducts, FlashSale, NewArrival} from './components/sections';

function App() {
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  
  return (
      <Router>
        <GlobalErrorHandler>
          <ScrollToTop scrollContainerRef={scrollContainerRef} />{/* Add ScrollToTop here */}
          <Layout scrollContainerRef={scrollContainerRef}> {/* Directly wrap Layout around Routes */}
            <Routes>
              {/* Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products scrollContainerRef={scrollContainerRef} />} />
              <Route path='/products/category/:category' element={<Products scrollContainerRef={scrollContainerRef} />} />
              <Route path="/products/detail/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<WishList />} />

              {/*home page section*/}
              <Route path='/products/flash-sale' element={<FlashSale forRoute={true} />} />
              <Route path='/products/new-arrival' element={<NewArrival forRoute={true} />} />
              <Route path='/products/best-selling' element={<BestSelling forRoute={true} />} />
              <Route path='/products/featured' element={<FeaturedProducts forRoute={true} />} />
              <Route path='/categories' element={<Categories forRoute={true} />} />

              {/*order */}
              <Route path='/order-confirmation/:orderId' element={<OrderConfirmation />} />

              {/* User Pages */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protect Route */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/verify-otp/:token" element={<VerifyOtp />} />


              {/* Others Pages */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path='privacy-policy' element={<PrivacyPolicy />} />


              {/* Catch-all Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </GlobalErrorHandler>
      </Router>
  );
}

export default App;
