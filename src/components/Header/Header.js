import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';
import { getCartCount } from '../../utils/cart';

const Header = () => {

  const [count, setCount] = useState(0);

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
          <Link to="/login" className="nav-link">
            Вход
          </Link>
          <Link to="/register" className="nav-link">
            Регистрация
          </Link>
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
