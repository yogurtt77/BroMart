import React, { useEffect, useState, useRef } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, message } from 'antd';
import './Cart.scss';
import apiClient from '../../utils/apiClient';
import { changeCartQuantity, clearCart, getCartItems } from '../../utils/cart';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [ordering, setOrdering] = useState(false);
  const [wallet, setWallet] = useState({
    balance: 0,
    monthly_spent: 0,
    monthly_limit: 0
  });

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

  const didLoadWalletRef = useRef(false);

  useEffect(() => {
    if (didLoadWalletRef.current) {
      return;
    }

    didLoadWalletRef.current = true;

    const loadWallet = async () => {
      try {
        const response = await apiClient.get('/api/v1/wallet');
        setWallet(response.data.data);
      } catch (err) {
        message.error(err?.response?.data?.message || 'Не удалось загрузить баланс');
      }
    };

    loadWallet();
  }, []);

  const hasItems = cartItems.length > 0;

  const total = cartItems.reduce((sum, item) => {
    const qty = item.quantity || 0;

    return sum + item.price * qty;
  }, 0);

  const handleOrder = async () => {
    setOrdering(true);
    try {
      await apiClient.post('/api/v1/orders', {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      });
      clearCart();
      setCartItems([]);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Не удалось оформить заказ');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="page-header">
        <div className="container">
          <div className="cart-header-left">
            <h1 className="page-title">Корзина</h1>
            <div className="cart-wallet">
              <div className="cart-wallet-title">Остаток на балансе</div>
              <div className="cart-wallet-stats">
                <div className="cart-wallet-stat">
                  <span className="cart-wallet-stat-label">Баланс</span>
                  <span className="cart-wallet-stat-value">{wallet.balance}</span>
                </div>
                <div className="cart-wallet-stat">
                  <span className="cart-wallet-stat-label">Потрачено за месяц</span>
                  <span className="cart-wallet-stat-value">{wallet.monthly_spent}</span>
                </div>
                <div className="cart-wallet-stat">
                  <span className="cart-wallet-stat-label">Лимит на месяц</span>
                  <span className="cart-wallet-stat-value">{wallet.monthly_limit}</span>
                </div>
              </div>
            </div>
          </div>

          {hasItems && (
            <div className="cart-header-summary">
              <span className="cart-header-summary-label">Сумма заказа:</span>
              <span className="cart-header-summary-value">{total.toFixed(2)} ₸</span>
              <Button type="primary" loading={ordering} onClick={handleOrder}>
                Заказать
              </Button>
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
                        <span className="cart-item-price">Цена: {item.price.toFixed(2)} ₸</span>
                        <div className="cart-item-total">
                          Сумма: {(item.price * (item.quantity || 0)).toFixed(2)} ₸
                        </div>
                        <Space className="cart-item-actions" size="small">
                          <Button
                            type="default"
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => changeCartQuantity(item.id, -1)}
                          />
                          <span className="cart-item-qty-value">{item.quantity || 0}</span>
                          <Button
                            type="default"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => changeCartQuantity(item.id, 1)}
                          />
                        </Space>
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
