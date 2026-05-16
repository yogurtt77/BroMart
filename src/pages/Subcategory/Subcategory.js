import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { AppstoreOutlined, BarsOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Image,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Typography
} from 'antd';
import apiClient from '../../utils/apiClient';
import { addToCart, changeCartQuantity, getCartItems } from '../../utils/cart';
import './Subcategory.scss';

const unwrapResponseData = (payload) => payload?.data ?? payload;

const { Title, Text } = Typography;

const SORT_OPTIONS = [
  { value: 'default', label: 'Исходная сортировка' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'name', label: 'По названию' }
];

const itemPhoto = (product) => product.image_url;

const sortParams = (sortBy) => {
  if (sortBy === 'price-asc') {
    return { sort_by: 'price', sort: 'asc' };
  }

  if (sortBy === 'price-desc') {
    return { sort_by: 'price', sort: 'desc' };
  }

  if (sortBy === 'name') {
    return { sort_by: 'name', sort: 'asc' };
  }

  return {};
};

const Subcategory = () => {
  const { subcategoryId } = useParams();
  const location = useLocation();
  const vendorName = location.state?.vendorName ?? 'Поставщик';

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCart = () => {
      setCartItems(getCartItems());
    };

    loadCart();

    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('storage', loadCart);

    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadProducts = async () => {
      setLoading(true);
      setError('');

      const params = {
        vendor_id: subcategoryId,
        ...sortParams(sortBy)
      };

      const trimmedSearchQuery = searchQuery.trim();

      if (sortBy === 'name' && trimmedSearchQuery) {
        params.search = trimmedSearchQuery;
      }

      try {
        const response = await apiClient.get('/api/v1/catalog/products', {
          params,
          signal
        });
        const list = unwrapResponseData(response.data);
        setProducts(Array.isArray(list) ? list : []);
      } catch {
        if (signal.aborted) {
          return;
        }

        setError('Не удалось загрузить товары');
        setProducts([]);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => controller.abort();
  }, [subcategoryId, sortBy, searchQuery]);

  const handleSortChange = (value) => {
    setSortBy(value);

    if (value !== 'name') {
      setSearchQuery('');
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      image: itemPhoto(product)
    });
  };

  const getProductQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.id === productId);

    return cartItem?.quantity || 0;
  };

  return (
    <div className="subcategory-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            {vendorName}
          </Title>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          {error && <Alert type="error" message={error} showIcon className="subcategory-alert" />}

          <div className="products-toolbar">
            <Space wrap size="middle" className="products-toolbar-inner">
              <Space.Compact>
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                  aria-label="Сетка"
                />
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  icon={<BarsOutlined />}
                  onClick={() => setViewMode('list')}
                  aria-label="Список"
                />
              </Space.Compact>

              <Select
                className="sort-select"
                value={sortBy}
                onChange={handleSortChange}
                options={SORT_OPTIONS}
              />

              {sortBy === 'name' ? (
                <Input.Search
                  allowClear
                  placeholder="Поиск по названию"
                  onSearch={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  style={{ width: 280 }}
                />
              ) : null}

              <Text type="secondary" className="products-count">
                Товаров: {products.length}
              </Text>
            </Space>
          </div>

          <Spin spinning={loading}>
            <Row gutter={[30, 30]} className={`products-row products-row--${viewMode}`}>
              {products.map((product) => {
                const quantity = getProductQuantity(product.id);

                return (
                  <Col xs={24} md={viewMode === 'grid' ? 8 : 24} key={product.id}>
                    <Card
                      hoverable
                      className={`product-card ${viewMode === 'list' ? 'product-card--list' : ''}`}
                      cover={(
                        <div className="product-cover">
                          <Image src={itemPhoto(product)} alt={product.name} preview={false} />
                        </div>
                      )}
                    >
                      <Title level={5} className="product-name">
                        {product.name}
                      </Title>

                      <div className="product-actions">
                        <Text className="product-price">
                          {Number(product.price ?? 0).toFixed(2)} ₸
                        </Text>

                        {quantity > 0 ? (
                          <Space.Compact block className="product-quantity-control">
                            <Button
                              icon={<MinusOutlined />}
                              onClick={() => changeCartQuantity(product.id, -1)}
                            />
                            <Button className="product-quantity-value">
                              {quantity}
                            </Button>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => changeCartQuantity(product.id, 1)}
                            />
                          </Space.Compact>
                        ) : (
                          <Button type="primary" block onClick={() => handleAddToCart(product)}>
                            В корзину
                          </Button>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Subcategory;
