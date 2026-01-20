import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import FAQ from './pages/FAQ/FAQ';
import Complaints from './pages/Complaints/Complaints';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Cart from './pages/Cart/Cart';
import Category from './pages/Category/Category';
import Subcategory from './pages/Subcategory/Subcategory';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/category/:categoryId/:subcategoryId" element={<Subcategory />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

