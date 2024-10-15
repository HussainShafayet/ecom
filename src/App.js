import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import {Layout} from './components/layout';
import { Login, Register } from './pages/user';
import {Home, Products, ProductDetails, Cart} from './pages';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Pages with Layout */}
          <Route path="/" element={<LayoutWrapper><Home /></LayoutWrapper>} />
          <Route path="/products" element={<LayoutWrapper><Products /></LayoutWrapper>} />
          <Route path="/product/:id" element={<LayoutWrapper><ProductDetails /></LayoutWrapper>} />
          <Route path="/cart" element={<LayoutWrapper><Cart /></LayoutWrapper>} />
          {/*<Route path="/checkout" element={<LayoutWrapper><Checkout /></LayoutWrapper>} />*/}

           {/* Pages without Layout (e.g., Login page) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
}

function LayoutWrapper({children}) {
  return(
    <Layout>
      {children}
    </Layout>
  )
}

export default App;
