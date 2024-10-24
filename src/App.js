import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Layout } from './components/layout';
import { Login, Register } from './pages/user';
import { Home, Products, ProductDetails, Cart, NotFound, Checkout } from './pages';
import { CartProvider } from './context/CartContext'; // Import CartProvider

function App() {
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
            <Route path="/checkout" element={<Checkout />} />

            {/* User Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
