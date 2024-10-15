import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import {Home} from './pages/Home';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/product/:id" element={''} />
          <Route path="/cart" element={''} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
