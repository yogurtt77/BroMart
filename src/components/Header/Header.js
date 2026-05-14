import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Flex, Layout, Menu } from 'antd';
import './Header.scss';
import { getCartCount } from '../../utils/cart';
import {
  clearAuthSession,
  getUserRole,
  isAuthenticated,
  stopAuthRefreshScheduler
} from '../../utils/auth';

const { Header: AntHeader } = Layout;

const selectedMenuKey = (pathname) => {
  if (pathname === '/' || pathname.startsWith('/category')) {
    return '/';
  }
  const prefixes = ['/admin', '/login', '/faq', '/complaints', '/contacts', '/my-orders'];
  return prefixes.find((p) => pathname === p || pathname.startsWith(`${p}/`)) || '';
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [location.pathname]);

  useEffect(() => {
    const updateCount = () => setCount(getCartCount());
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    stopAuthRefreshScheduler();
    setLoggedIn(false);
    navigate('/');
  }, [navigate]);

  const showAdmin = loggedIn && getUserRole() !== 'INMATE';
  const showMyOrders = loggedIn && getUserRole() === 'INMATE';

  const menuItems = useMemo(() => {
    const items = [
      { key: '/', label: <Link to="/">Категории</Link> },
      { key: '/faq', label: <Link to="/faq">Вопрос-ответ</Link> },
      { key: '/complaints', label: <Link to="/complaints">Предложения и жалобы</Link> },
      { key: '/contacts', label: <Link to="/contacts">Контакты</Link> },
    ];
    if (showMyOrders) {
      items.push({ key: '/my-orders', label: <Link to="/my-orders">Мои заказы</Link> });
    }
    if (showAdmin) {
      items.push({ key: '/admin', label: <Link to="/admin">Админка</Link> });
    }
    items.push(
      loggedIn
        ? { key: 'logout', label: 'Выйти', onClick: handleLogout }
        : { key: '/login', label: <Link to="/login">Вход</Link> },
    );
    return items;
  }, [loggedIn, showAdmin, showMyOrders, handleLogout]);

  const selectedKeys = selectedMenuKey(location.pathname);
  const menuSelectedKeys = selectedKeys ? [selectedKeys] : [];

  return (
    <AntHeader className="site-header">
      <Flex className="site-header__inner" align="center" justify="space-between" gap={40}>
        <Link to="/" className="site-header__logo">
          <img
            src="https://bromart-57.kz/wp-content/uploads/2024/05/cropped-cropped-fulllogo.png"
            alt="BROMART"
          />
        </Link>

        <Flex className="site-header__actions" align="center" gap="middle" flex={1} justify="flex-end">
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={menuSelectedKeys}
            className="site-header__menu"
          />
          <Badge count={count} showZero size="small" color="#3d6d4f">
            <Link to="/cart" className="site-header__cart">
              <ShoppingCartOutlined />
            </Link>
          </Badge>
        </Flex>
      </Flex>
    </AntHeader>
  );
};

export default Header;
