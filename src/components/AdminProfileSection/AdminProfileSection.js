import React from 'react';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Spin, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import './AdminProfileSection.scss';

const { Title, Text } = Typography;
const unwrapResponseData = (payload) => payload?.data ?? payload;
const getTodayDate = () => new Date().toISOString().split('T')[0];

const AdminProfileSection = () => {
  const [form] = Form.useForm();
  const [inmates, setInmates] = React.useState([]);
  const [facilities, setFacilities] = React.useState([]);
  const [fetching, setFetching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const didLoadRef = React.useRef(false);

  React.useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [usersResponse, facilitiesResponse] = await Promise.all([
        apiClient.get('/api/v1/users', { params: { role: 'INMATE' } }),
        apiClient.get('/api/v1/facilities')
      ]);

      const usersList = unwrapResponseData(usersResponse.data);
      const facilitiesList = unwrapResponseData(facilitiesResponse.data);

      setInmates(Array.isArray(usersList) ? usersList : []);
      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
    } catch (err) {
      setError('Ошибка загрузки заключённых или учреждений');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    const currentDate = getTodayDate();
    const payload = {
      email: values.email,
      full_name: values.full_name,
      role: 'INMATE',
      facility_id: values.facility_id,
      iin: values.iin,
      photo_url: '',
      transfer_date: currentDate,
      release_date: currentDate,
      password: values.password
    };

    try {
      const response = await apiClient.post('/api/v1/users', payload);
      const newInmate = unwrapResponseData(response.data);
      setInmates((prev) => [...prev, newInmate]);
      form.resetFields();
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка создания заключённого');
    } finally {
      setLoading(false);
    }
  };

  const facilityOptions = facilities.map((facility) => ({
    value: facility.id,
    label: facility.name
  }));

  return (
    <section className="admin-profile-section">
      <Title level={3} className="section-title">Заключённые</Title>

      {error && <Alert type="error" message={error} showIcon className="section-alert" />}

      <Spin spinning={fetching}>
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

        <Form.Item className="section-submit-wrap">
          <Button type="primary" htmlType="submit" loading={loading}>
            СОЗДАТЬ ЗАКЛЮЧЁННОГО
          </Button>
        </Form.Item>
      </Form>

      <div className="section-list">
        <Title level={4}>Список заключённых</Title>
        <Row gutter={[16, 16]}>
          {inmates.map((inmate) => (
            <Col key={inmate.id} xs={24} sm={12} lg={8}>
              <Card size="small" hoverable>
                <Space direction="vertical" size={4}>
                  <Text strong>{inmate.full_name}</Text>
                  <Text type="secondary">ИИН: {inmate.iin}</Text>
                  <Text type="secondary">Учреждение: {inmate.facility_name}</Text>
                  <Text type="secondary">Email: {inmate.email}</Text>
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

export default AdminProfileSection;
