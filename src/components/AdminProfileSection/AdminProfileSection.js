import React from 'react';
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatDateTime, formatSecurityRegime, getSecurityRegimeColor } from '../../utils/admin';
import './AdminProfileSection.scss';

const { Title } = Typography;
const unwrapResponseData = payload => payload?.data ?? payload;
const getTodayDate = () => new Date().toISOString().split('T')[0];

const SECURITY_MODE_OPTIONS = [
  { value: 'GENERAL', label: 'Общий режим' },
  { value: 'STRICT', label: 'Строгий режим' },
  { value: 'MAXIMUM', label: 'Максимальный режим' }
];

const AdminProfileSection = () => {
  const [form] = Form.useForm();
  const [inmates, setInmates] = React.useState([]);
  const [facilities, setFacilities] = React.useState([]);
  const [fetching, setFetching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
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
    setFetching(true);
    setError('');

    try {
      const [usersResponse, facilitiesResponse] = await Promise.all([
        apiClient.get('/api/v1/users', { params: { role: 'INMATE' } }),
        apiClient.get('/api/v1/facilities')
      ]);

      const usersList = unwrapResponseData(usersResponse.data);
      const facilitiesList = unwrapResponseData(facilitiesResponse.data);

      setInmates(Array.isArray(usersList) ? usersList : []);
      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Ошибка загрузки заключённых или учреждений'
      );
      setInmates([]);
      setFacilities([]);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async values => {
    setLoading(true);
    setError('');

    const currentDate = getTodayDate();
    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('full_name', values.full_name);
    formData.append('facility_id', values.facility_id);
    formData.append('iin', values.iin);
    formData.append('transfer_date', currentDate);
    formData.append('release_date', currentDate);
    formData.append('security_regime', values.security_regime);
    formData.append('monthly_limit', values.monthly_limit);

    const file = values.file?.[0]?.originFileObj;
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await apiClient.post('/api/v1/users/inmates/with-photo', formData);
      message.success(response.data.message);
      const newInmate = unwrapResponseData(response.data);
      setInmates(prev => [...prev, newInmate]);
      form.resetFields();
      setModalOpen(false);
    } catch (requestError) {
      const nextError =
        requestError?.response?.data?.message || 'Ошибка создания заключённого';
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
    <section className="admin-profile-section">
      <div className="admin-profile-header">
        <Title level={3} className="admin-profile-title">
          Заключённые
        </Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Создать
        </Button>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-profile-alert" />}

      <Spin spinning={fetching}>
        <div className="admin-profile-table-card">
          <Table
            rowKey="id"
            dataSource={inmates}
            pagination={false}
            scroll={{ x: 1200 }}
            columns={[
              {
                title: 'ФИО',
                dataIndex: 'full_name',
                key: 'full_name'
              },
              {
                title: 'ИИН',
                dataIndex: 'iin',
                key: 'iin',
                width: 160
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
                title: 'Режим',
                dataIndex: 'security_regime',
                key: 'security_regime',
                width: 170,
                render: value => (
                  <Tag color={getSecurityRegimeColor(value)}>{formatSecurityRegime(value)}</Tag>
                )
              },
              {
                title: 'Лимит в месяц',
                dataIndex: 'monthly_limit',
                key: 'monthly_limit',
                width: 150
              },
              {
                title: 'Дата создания',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 180,
                render: value => formatDateTime(value)
              }
            ]}
          />
        </div>
      </Spin>

      <Modal
        title="Создать заключённого"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Создать заключённого"
        cancelText="Отмена"
        confirmLoading={loading}
        destroyOnClose
        width={860}
      >
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

            <Col xs={24} md={12}>
              <Form.Item
                label="Режим безопасности"
                name="security_regime"
                rules={[{ required: true, message: 'Выберите режим безопасности' }]}
              >
                <Select
                  options={SECURITY_MODE_OPTIONS}
                  placeholder="Выберите режим безопасности"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Месячный лимит"
                name="monthly_limit"
                rules={[{ required: true, message: 'Введите месячный лимит' }]}
              >
                <Input placeholder="Введите месячный лимит" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Фото заключённого"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={event => (Array.isArray(event) ? event : event?.fileList)}
            rules={[{ required: true, message: 'Загрузите фото заключённого' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
              <Button>Загрузить фото заключённого</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default AdminProfileSection;
