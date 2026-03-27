import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import './PrisonAdminsSection.scss';

const { Title, Text } = Typography;
const unwrapResponseData = (payload) => payload?.data ?? payload;

const getTodayDate = () => new Date().toISOString().split('T')[0];

const PrisonAdminsSection = () => {
  const [form] = Form.useForm();
  const [admins, setAdmins] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [usersResponse, facilitiesResponse] = await Promise.all([
        apiClient.get('/api/v1/users', { params: { role: 'PRISON_ADMIN' } }),
        apiClient.get('/api/v1/facilities')
      ]);

      const usersList = unwrapResponseData(usersResponse.data);
      const facilitiesList = unwrapResponseData(facilitiesResponse.data);

      setAdmins(Array.isArray(usersList) ? usersList : []);
      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
    } catch (err) {
      setError('Ошибка загрузки начальников или учреждений');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    const currentDate = getTodayDate();
    const payload = {
      email: values.email,
      full_name: values.full_name,
      role: 'PRISON_ADMIN',
      facility_id: values.facility_id,
      iin: values.iin,
      photo_url: '',
      transfer_date: currentDate,
      release_date: currentDate,
      password: values.password
    };

    try {
      const response = await apiClient.post('/api/v1/users', payload);
      const newAdmin = unwrapResponseData(response.data);
      setAdmins((prev) => [...prev, newAdmin]);
      form.resetFields();
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка создания начальника');
    } finally {
      setLoading(false);
    }
  };

  const facilityOptions = facilities.map((facility) => ({
    value: facility.id,
    label: facility.name
  }));

  return (
    <section className="prison-admins-section">
      <Title level={3} className="prison-admins-title">Начальники учреждений</Title>

      {error && <Alert type="error" message={error} showIcon className="prison-admins-alert" />}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="ФИО"
              name="full_name"
              rules={[{ required: true, message: 'Введите ФИО' }]}
            >
              <Input placeholder="Введите ФИО" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Введите email' }]}
            >
              <Input placeholder="user@example.com" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="ИИН"
              name="iin"
              rules={[{ required: true, message: 'Введите ИИН' }]}
            >
              <Input placeholder="Введите ИИН" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Учреждение"
              name="facility_id"
              rules={[{ required: true, message: 'Выберите учреждение' }]}
            >
              <Select options={facilityOptions} placeholder="Выберите учреждение" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input.Password placeholder="Введите пароль" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="prison-admins-submit-wrap">
          <Button type="primary" htmlType="submit" loading={loading}>
            СОЗДАТЬ НАЧАЛЬНИКА
          </Button>
        </Form.Item>
      </Form>

      <div className="prison-admins-list">
        <Title level={4}>Список начальников</Title>
        <Row gutter={[16, 16]}>
          {admins.map((admin) => (
            <Col key={admin.id} xs={24} sm={12} lg={8}>
              <Card size="small" hoverable>
                <Space direction="vertical" size={4}>
                  <Text strong>{admin.full_name}</Text>
                  <Text type="secondary">ИИН: {admin.iin}</Text>
                  <Text type="secondary">Учреждение: {admin.facility_name}</Text>
                  <Text type="secondary">Email: {admin.email}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default PrisonAdminsSection;
