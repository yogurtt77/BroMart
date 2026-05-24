import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Spin, Tag, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { formatRole, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';
import './RoleUsersSection.scss';

const { Title, Text } = Typography;

const ROLE_OPTIONS = [
  { value: 'WAREHOUSE_MANAGER', label: 'Менеджер склада' },
  { value: 'COURIER', label: 'Курьер' }
];

const ROLE_FILTERS = ROLE_OPTIONS.map(item => item.value);

const RoleUsersSection = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didLoadRef = useRef(false);

  const loadData = async () => {
    setFetching(true);
    setError('');

    try {
      const [facilitiesResponse, ...usersResponses] = await Promise.all([
        apiClient.get('/api/v1/facilities'),
        ...ROLE_FILTERS.map(role => apiClient.get('/api/v1/users', { params: { role } }))
      ]);

      const nextFacilities = unwrapResponseData(facilitiesResponse.data);
      const nextUsers = usersResponses.flatMap(response => {
        const list = unwrapResponseData(response.data);
        return Array.isArray(list) ? list : [];
      });

      setFacilities(Array.isArray(nextFacilities) ? nextFacilities : []);
      setUsers(nextUsers);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить сотрудников'));
      setFacilities([]);
      setUsers([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadData();
  }, []);

  const handleSubmit = async values => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/users', {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        role: values.role,
        facility_id: values.facility_id
      });
      message.success(response.data.message);
      form.resetFields();
      await loadData();
    } catch (requestError) {
      const nextError = getApiErrorMessage(requestError, 'Не удалось создать сотрудника');
      message.error(nextError);
      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

  const facilityOptions = facilities.map(facility => ({
    value: facility.id,
    label: facility.name
  }));

  return (
    <section className="role-users-section">
      <Title level={3} className="role-users-title">Создание ролей сотрудников</Title>

      {error ? <Alert type="error" message={error} showIcon className="role-users-alert" /> : null}

      <Spin spinning={fetching}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Роль"
                name="role"
                rules={[{ required: true, message: 'Выберите роль' }]}
              >
                <Select options={ROLE_OPTIONS} placeholder="Выберите роль" />
              </Form.Item>
            </Col>

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
                rules={[
                  { required: true, message: 'Введите email' },
                  { type: 'email', message: 'Некорректный email' }
                ]}
              >
                <Input placeholder="user@example.com" />
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
                rules={[
                  { required: true, message: 'Введите пароль' },
                  { min: 8, message: 'Минимум 8 символов' }
                ]}
              >
                <Input.Password placeholder="Введите пароль" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="role-users-submit-wrap">
            <Button type="primary" htmlType="submit" loading={loading}>
              Создать сотрудника
            </Button>
          </Form.Item>
        </Form>

        <div className="role-users-list">
          <Title level={4}>Список сотрудников</Title>
          <Row gutter={[16, 16]}>
            {users.map(user => (
              <Col key={user.id} xs={24} sm={12} lg={8}>
                <Card size="small" hoverable>
                  <Space direction="vertical" size={4}>
                    <Space wrap>
                      <Text strong>{user.full_name}</Text>
                      <Tag color="blue">{formatRole(user.role)}</Tag>
                    </Space>
                    <Text type="secondary">Учреждение: {user.facility_name}</Text>
                    <Text type="secondary">Email: {user.email}</Text>
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

export default RoleUsersSection;
