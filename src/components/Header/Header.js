import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.scss';
import { getCartCount } from '../../utils/cart';
import { clearAuthSession, getUserRole, isAuthenticated, stopAuthRefreshScheduler } from '../../utils/auth';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [location.pathname]);

  useEffect(() => {
    const updateCount = () => {
      setCount(getCartCount());
    };

    updateCount();

    window.addEventListener('cartUpdated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    stopAuthRefreshScheduler();
    setLoggedIn(false);
    navigate('/');
  };

  const showAdmin = loggedIn && getUserRole() !== 'INMATE';

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img
            src="https://bromart-57.kz/wp-content/uploads/2024/05/cropped-cropped-fulllogo.png"
            alt="BROMART"
          />
        </Link>

        <div className="header-actions">
          <Link to="/" className="nav-link">
            Категории
          </Link>
          <Link to="/faq" className="nav-link">
            Вопрос-ответ
          </Link>
          <Link to="/order" className="nav-link">
            Заказ по запросу
          </Link>
          <Link to="/complaints" className="nav-link">
            Предложения и жалобы
          </Link>
          <Link to="/contacts" className="nav-link">
            Контакты
          </Link>
          {showAdmin ? (
            <Link to="/admin" className="nav-link">
              Админка
            </Link>
          ) : null}
          {loggedIn ? (
            <button type="button" className="nav-link nav-link--button" onClick={handleLogout}>
              Выйти
            </button>
          ) : (
            <Link to="/login" className="nav-link">
              Вход
            </Link>
          )}
          <Link to="/cart" className="cart-link">
            <img src="/icon_exact.svg" alt="Корзина" />
            <span className="cart-count">{count}</span>
          </Link>
          <button className="search-btn">
            <img src="/search.svg" alt="Поиск" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
