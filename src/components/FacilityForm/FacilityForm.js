import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Spin, Typography } from 'antd';
import './FacilityForm.scss';
import apiClient from '../../utils/apiClient';

const unwrapResponseData = (payload) => payload?.data ?? payload;
const { Title, Text } = Typography;
const SECURITY_REGIME_OPTIONS = [
  { value: 'GENERAL', label: 'GENERAL' },
  { value: 'STRICT', label: 'STRICT' },
  { value: 'MAXIMUM', label: 'MAXIMUM' }
];

const FacilityForm = () => {
  const [form] = Form.useForm();
  const [facilities, setFacilities] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didLoadFacilitiesRef = useRef(false);

  useEffect(() => {
    if (didLoadFacilitiesRef.current) {
      return;
    }

    didLoadFacilitiesRef.current = true;
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await apiClient.get('/api/v1/facilities');
      const facilitiesList = unwrapResponseData(response.data);
      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
    } catch (err) {
      setError('Ошибка загрузки учреждений');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/facilities', values);
      const newFacility = unwrapResponseData(response.data);
      setFacilities(prev => [...prev, newFacility]);
      form.resetFields();
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка создания учреждения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="facility-form">
      <Title level={3} className="facility-title">Создать учреждение</Title>

      {error && <Alert type="error" message={error} showIcon className="facility-alert" />}

      <Form
        form={form}
        layout="vertical"
        className="facility-form-grid"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Название"
              name="name"
              rules={[{ required: true, message: 'Введите название учреждения' }]}
            >
              <Input placeholder="Введите название учреждения" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Код"
              name="code"
              rules={[{ required: true, message: 'Введите код учреждения' }]}
            >
              <Input placeholder="Введите код учреждения" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Адрес"
              name="address"
              rules={[{ required: true, message: 'Введите адрес учреждения' }]}
            >
              <Input placeholder="Введите адрес учреждения" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Режим безопасности"
              name="security_regime"
              rules={[{ required: true, message: 'Выберите режим безопасности' }]}
            >
              <Select options={SECURITY_REGIME_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="facility-submit-wrap">
          <Button type="primary" htmlType="submit" loading={loading}>
            СОЗДАТЬ УЧРЕЖДЕНИЕ
          </Button>
        </Form.Item>
      </Form>

      <Spin spinning={fetching}>
        <div className="facilities-list">
          <Title level={4}>Существующие учреждения</Title>
          <Row gutter={[16, 16]}>
            {facilities.map((facility) => (
              <Col key={facility.id} xs={24} sm={12} lg={8}>
                <Card size="small" hoverable>
                  <Space direction="vertical" size={6}>
                    <Text strong>{facility.name}</Text>
                    <Text type="secondary">{facility.code}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Spin>
    </section>
  );
};

export default FacilityForm;