import React, { useEffect, useState } from 'react';
import './Cart.scss';
import { getCartItems } from '../../utils/cart';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = () => {
      setCartItems(getCartItems());
    };

    loadCart();

    const handleUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const hasItems = cartItems.length > 0;

  const total = cartItems.reduce((sum, item) => {
    const qty = item.quantity || 0;

    return sum + item.price * qty;
  }, 0);

  return (
    <div className="cart-page">
      <div className="page-header">
        <div className="container">
          <div className="cart-header-left">
            <h1 className="page-title">Корзина</h1>
            <div className="breadcrumb">
              <span>Корзина</span>
            </div>
          </div>

          {hasItems && (
            <div className="cart-header-summary">
              <span className="cart-header-summary-label">Сумма заказа:</span>
              <span className="cart-header-summary-value">{total.toFixed(2)} ₸</span>
            </div>
          )}
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          {!hasItems && (
            <div className="empty-cart">
              <div className="empty-icon">
                <img src="/sad_cry_exact.svg" alt="Пустая корзина" />
              </div>
              <p className="empty-text">Сейчас ваша корзина пуста!</p>
            </div>
          )}

          {hasItems && (
            <div className="cart-content">
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <div className="cart-item-meta">
                        <span className="cart-item-price">Цена: {item.price.toFixed(2)} ₸</span><br/>
                        <span className="cart-item-qty">Количество: {item.quantity || 0}</span><br/>
                        <span className="cart-item-total">Сумма: {(item.price * (item.quantity || 0)).toFixed(2)} ₸</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
