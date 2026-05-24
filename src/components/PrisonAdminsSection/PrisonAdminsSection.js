import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Input, Modal, Row, Select, Spin, Table, Tag, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { formatDateTime, formatRole, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';
import './PrisonAdminsSection.scss';

const { Title } = Typography;

const ROLE_OPTIONS = [
  { value: 'PRISON_ADMIN', label: 'Начальник учреждения' },
  { value: 'WAREHOUSE_MANAGER', label: 'Менеджер склада' },
  { value: 'COURIER', label: 'Курьер' }
];

const EMPLOYEE_ROLES = ROLE_OPTIONS.map(item => item.value);
const ROLE_COLORS = {
  PRISON_ADMIN: 'green',
  WAREHOUSE_MANAGER: 'gold',
  COURIER: 'blue'
};

const PrisonAdminsSection = () => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const didLoadRef = useRef(false);

  const loadInitialData = async () => {
    setFetching(true);
    setError('');

    try {
      const [facilitiesResponse, ...usersResponses] = await Promise.all([
        apiClient.get('/api/v1/facilities'),
        ...EMPLOYEE_ROLES.map(role => apiClient.get('/api/v1/users', { params: { role } }))
      ]);

      const facilitiesList = unwrapResponseData(facilitiesResponse.data);
      const usersList = usersResponses.flatMap(response => {
        const list = unwrapResponseData(response.data);
        return Array.isArray(list) ? list : [];
      });

      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
      setEmployees(usersList);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить сотрудников или учреждения'));
      setFacilities([]);
      setEmployees([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadInitialData();
  }, []);

  const handleSubmit = async values => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/users', {
        email: values.email,
        full_name: values.full_name,
        role: values.role,
        facility_id: values.facility_id,
        iin: values.iin,
        password: values.password
      });
      message.success(response.data.message);
      form.resetFields();
      setModalOpen(false);
      await loadInitialData();
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
    <section className="prison-admins-section">
      <div className="prison-admins-header">
        <Title level={3} className="prison-admins-title">Сотрудники</Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Создать
        </Button>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="prison-admins-alert" /> : null}

      <Spin spinning={fetching}>
        <div className="prison-admins-table-card">
          <Table
            rowKey="id"
            dataSource={employees}
            pagination={false}
            scroll={{ x: 900 }}
            columns={[
              {
                title: 'ФИО',
                dataIndex: 'full_name',
                key: 'full_name'
              },
              {
                title: 'Роль',
                dataIndex: 'role',
                key: 'role',
                render: value => <Tag color={ROLE_COLORS[value] || 'default'}>{formatRole(value)}</Tag>
              },
              {
                title: 'Учреждение',
                dataIndex: 'facility_name',
                key: 'facility_name'
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email'
              },
              {
                title: 'Дата создания',
                dataIndex: 'created_at',
                key: 'created_at',
                render: value => formatDateTime(value)
              }
            ]}
          />
        </div>
      </Spin>

      <Modal
        title="Создать сотрудника"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Создать сотрудника"
        cancelText="Отмена"
        confirmLoading={loading}
        destroyOnClose
        width={760}
      >
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
                label="ИИН"
                name="iin"
                rules={[
                  { required: true, message: 'Введите ИИН' },
                  { pattern: /^\d{1,12}$/, message: 'Только цифры, не более 12' }
                ]}
              >
                <Input placeholder="Введите ИИН" maxLength={12} />
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
        </Form>
      </Modal>
    </section>
  );
};

export default PrisonAdminsSection;
