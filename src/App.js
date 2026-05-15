import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import FAQ from './pages/FAQ/FAQ';
import Complaints from './pages/Complaints/Complaints';
import Contacts from './pages/Contacts/Contacts';
import Login from './pages/Login/Login';
import Cart from './pages/Cart/Cart';
import Category from './pages/Category/Category';
import Subcategory from './pages/Subcategory/Subcategory';
import Admin from './pages/Admin/Admin';
import MyOrders from './pages/MyOrders/MyOrders';
import { AdminRoute, InmateRoute } from './components/Routes';
import { isAuthenticated, startAuthRefreshScheduler, stopAuthRefreshScheduler } from './utils/auth';

function App() {
  useEffect(() => {
    if (isAuthenticated()) {
      startAuthRefreshScheduler();
    }

    return () => {
      stopAuthRefreshScheduler();
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/my-orders"
              element={(
                <InmateRoute>
                  <MyOrders />
                </InmateRoute>
              )}
            />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/category/:categoryId/:subcategoryId" element={<Subcategory />} />
            <Route path="/admin/sign" element={<Navigate to="/login" replace />} />
            <Route
              path="/admin"
              element={(
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              )}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

