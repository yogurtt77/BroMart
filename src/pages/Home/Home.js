import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Image, Row, Spin, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import './Home.scss';

const unwrapResponseData = (payload) => payload?.data ?? payload;

const { Title } = Typography;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }
    didLoadRef.current = true;

    const load = async () => {
      setError('');
      try {
        const response = await apiClient.get('/api/v1/catalog/categories');
        const list = unwrapResponseData(response.data);
        setCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        setError('Не удалось загрузить каталог');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          <Button type="default" size="large" href="#catalog" className="hero-cta">
            Ознакомиться с каталогом
          </Button>
        </div>
      </section>

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
    </div>
  );
};

export default Home;
