import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Alert, Button, Card, Col, Image, Row, Spin, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import { isAuthenticated } from '../../utils/auth';
import './Home.scss';

const unwrapResponseData = (payload) => payload?.data ?? payload;

const { Title } = Typography;

const Home = () => {
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [location.pathname]);

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      setCategories([]);
      setError('');
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/api/v1/catalog/categories', { signal });
        const list = unwrapResponseData(response.data);
        setCategories(Array.isArray(list) ? list : []);
      } catch {
        if (signal.aborted) return;
        setError('Не удалось загрузить каталог');
        setCategories([]);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [loggedIn]);

  return (
    <div className="home">
      <div className="page-title-section">
        <div className="container">
          <Title level={1} className="page-title">
            Главная страница
          </Title>
        </div>
      </div>

      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="hero-content">
          <Title level={2} className="hero-title">
            Магазин онлайн-покупок
            <br />
            учреждение №57
          </Title>
          {loggedIn ? (
            <Button type="default" size="large" href="#catalog" className="hero-cta">
              Ознакомиться с каталогом
            </Button>
          ) : (
            <Link to="/login">
              <Button type="default" size="large" className="hero-cta">
                Ознакомиться с каталогом
              </Button>
            </Link>
          )}
        </div>
      </section>

      {loggedIn ? (
        <section id="catalog" className="catalog-section">
          <div className="container">
            <Title level={2} className="section-title">
              Каталог продукции
            </Title>

            {error && <Alert type="error" message={error} showIcon className="catalog-alert" />}

            <Spin spinning={loading}>
              <Row gutter={[40, 40]} className="categories-row">
                {categories.map((category) => (
                  <Col xs={24} sm={12} lg={6} key={category.id}>
                    <Link
                      to={`/category/${category.id}`}
                      state={{ categoryName: category.name }}
                      className="category-link"
                    >
                      <Card
                        hoverable
                        bordered={false}
                        className="category-card"
                        cover={
                          <div className="category-cover">
                            <Image src={category.icon_url} alt={category.name} preview={false} />
                          </div>
                        }
                      >
                        <Card.Meta title={category.name} className="category-meta" />
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </Spin>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Home;
