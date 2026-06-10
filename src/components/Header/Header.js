import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoreOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Flex, Grid, Layout, Menu } from 'antd';
import './Header.scss';
import { getCartCount } from '../../utils/cart';
import {
  clearAuthSession,
  getUserRole,
  isAuthenticated,
  stopAuthRefreshScheduler
} from '../../utils/auth';

const { Header: AntHeader } = Layout;

const ADMIN_LABELS = {
  SUPER_ADMIN: 'Кабинет супер-админа',
  PRISON_ADMIN: 'Кабинет начальника учреждения',
  WAREHOUSE_MANAGER: 'Кабинет начальника склада',
  COURIER: 'Кабинет курьера'
};

const MORE_MENU_LABEL = 'Еще';

const selectedMenuKey = pathname => {
  if (pathname === '/' || pathname.startsWith('/category')) {
    return '/';
  }

  const prefixes = ['/admin', '/login', '/faq', '/complaints', '/contacts', '/my-orders', '/profile'];

  return prefixes.find(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)) || '';
};

const Header = () => {
  const location = useLocation();
  const screens = Grid.useBreakpoint();
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
    window.location.replace('/');
  }, []);

  const handleLogoClick = useCallback(event => {
    event.preventDefault();
    window.location.reload();
  }, []);

  const role = getUserRole();
  const isCompactHeader = !screens.xl;
  const showAdmin = loggedIn && ['SUPER_ADMIN', 'PRISON_ADMIN', 'WAREHOUSE_MANAGER', 'COURIER'].includes(role);
  const showInmateLinks = loggedIn && role === 'INMATE';
  const showComplaints = loggedIn && !['WAREHOUSE_MANAGER', 'COURIER'].includes(role);
  const adminLabel = ADMIN_LABELS[role] || 'Админка';

  const desktopMenuItems = useMemo(() => {
    const items = [{ key: '/', label: <Link to="/">Категории</Link> }];

    if (showInmateLinks) {
      items.push({ key: '/my-orders', label: <Link to="/my-orders">Мои заказы</Link> });
      items.push({ key: '/profile', label: <Link to="/profile">Профиль</Link> });
    }

    items.push({ key: '/faq', label: <Link to="/faq">Вопрос-ответ</Link> });

    if (showComplaints) {
      items.push({ key: '/complaints', label: <Link to="/complaints">Предложения и жалобы</Link> });
    }

    items.push({ key: '/contacts', label: <Link to="/contacts">Контакты</Link> });

    if (showAdmin) {
      items.push({ key: '/admin', label: <Link to="/admin">{adminLabel}</Link> });
    }

    if (!loggedIn) {
      items.push({ key: '/login', label: <Link to="/login">Вход</Link> });
    }

    return items;
  }, [loggedIn, showAdmin, showComplaints, showInmateLinks, adminLabel]);

  const compactMenuItems = useMemo(() => {
    const items = [{ key: '/', label: <Link to="/">Категории</Link> }];

    if (showInmateLinks) {
      items.push({ key: '/my-orders', label: <Link to="/my-orders">Мои заказы</Link> });
      items.push({ key: '/profile', label: <Link to="/profile">Профиль</Link> });
    }

    if (showAdmin) {
      items.push({ key: '/admin', label: <Link to="/admin">{adminLabel}</Link> });
    }

    return items;
  }, [showInmateLinks, showAdmin, adminLabel]);

  const moreMenuItems = useMemo(() => {
    const items = [];

    if (showComplaints) {
      items.push({ key: '/complaints', label: <Link to="/complaints">Предложения и жалобы</Link> });
    }

    items.push({ key: '/faq', label: <Link to="/faq">Вопрос-ответ</Link> });
    items.push({ key: '/contacts', label: <Link to="/contacts">Контакты</Link> });

    if (!loggedIn) {
      items.push({ key: '/login', label: <Link to="/login">Вход</Link> });
    }

    if (loggedIn && !showInmateLinks) {
      items.push({ key: 'logout', label: 'Выйти', danger: true });
    }

    return items;
  }, [loggedIn, showComplaints, showInmateLinks]);

  const handleMoreMenuClick = useCallback(
    ({ key }) => {
      if (key === 'logout') {
        handleLogout();
      }
    },
    [handleLogout]
  );

  const selectedKeys = selectedMenuKey(location.pathname);
  const menuSelectedKeys = selectedKeys ? [selectedKeys] : [];

  return (
    <AntHeader className="site-header">
      <Flex className="site-header__inner" align="center" justify="space-between" gap={40}>
        <Link to="/" className="site-header__logo" onClick={handleLogoClick}>
          <img
            src="https://bromart-57.kz/wp-content/uploads/2024/05/cropped-cropped-fulllogo.png"
            alt="BROMART"
          />
        </Link>

        <Flex
          className="site-header__actions"
          align="center"
          gap="middle"
          flex={1}
          justify="flex-end"
        >
          <Menu
            mode="horizontal"
            items={isCompactHeader ? compactMenuItems : desktopMenuItems}
            selectedKeys={menuSelectedKeys}
            className="site-header__menu"
          />
          {showInmateLinks ? (
            <Badge count={count} showZero size="small" color="#3d6d4f">
              <Link to="/cart" className="site-header__cart">
                <ShoppingCartOutlined />
              </Link>
            </Badge>
          ) : null}
          {isCompactHeader ? (
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{ items: moreMenuItems, onClick: handleMoreMenuClick }}
            >
              <Button
                type="text"
                aria-label={MORE_MENU_LABEL}
                className="site-header__more-button"
                icon={<MoreOutlined />}
              />
            </Dropdown>
          ) : null}
        </Flex>
      </Flex>
    </AntHeader>
  );
};

export default Header;
