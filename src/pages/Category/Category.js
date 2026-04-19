import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Image, Row, Spin, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import './Category.scss';

const unwrapResponseData = (payload) => payload?.data ?? payload;

const { Title } = Typography;

const Category = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryName = location.state?.categoryName ?? 'Категория';

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/api/v1/catalog/vendors', {
          params: { category_id: categoryId },
          signal
        });
        const list = unwrapResponseData(response.data);
        setVendors(Array.isArray(list) ? list : []);
      } catch {
        if (signal.aborted) return;
        setError('Не удалось загрузить поставщиков');
        setVendors([]);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [categoryId]);

  return (
    <div className="category-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            {categoryName}
          </Title>
          <div className="breadcrumb">
            <Link to="/">⌂</Link>
            <span className="separator">›</span>
            <span className="breadcrumb-current">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          {error && <Alert type="error" message={error} showIcon className="category-alert" />}

          <Spin spinning={loading}>
            <Row gutter={[30, 30]} className="vendors-row">
              {vendors.map((vendor) => (
                <Col xs={24} sm={12} lg={6} key={vendor.id}>
                  <Link
                    to={`/category/${categoryId}/${vendor.id}`}
                    state={{ vendorName: vendor.name, categoryName }}
                    className="vendor-link"
                  >
                    <Card
                      hoverable
                      bordered
                      className="vendor-card"
                      cover={
                        <div className="vendor-cover">
                          <Image src={vendor.logo_url} alt={vendor.name} preview={false} />
                        </div>
                      }
                    >
                      <div className="vendor-card-footer">
                        <span className="vendor-arrow">
                          <RightOutlined />
                        </span>
                        <Title level={5} className="vendor-name">
                          {vendor.name}
                        </Title>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Category;
