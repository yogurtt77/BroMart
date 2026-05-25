import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { getUserRole } from '../../utils/auth';
import {
  formatDateTime,
  getApiErrorMessage,
  unwrapResponseData
} from '../../utils/admin';
import './Complaints.scss';

const { Title, Text } = Typography;

const FEEDBACK_TYPE_OPTIONS = [
  { value: 'COMPLAINT', label: 'Жалоба' },
  { value: 'SUGGESTION', label: 'Предложение' }
];

const DELIVERY_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'В очереди' },
  { value: 'SENT', label: 'Отправлено' },
  { value: 'FAILED', label: 'Ошибка отправки' }
];

const DELIVERY_STATUS_COLORS = {
  PENDING: 'gold',
  SENT: 'green',
  FAILED: 'red'
};

const TYPE_LABELS = {
  COMPLAINT: 'Жалоба',
  SUGGESTION: 'Предложение'
};

const INITIAL_FILTERS = {
  type: undefined,
  delivery_status: undefined,
  facility_id: undefined,
  page: 1,
  pageSize: 10
};

const formatFeedbackType = value => TYPE_LABELS[value] || value || '—';

const formatDeliveryStatus = value => (
  DELIVERY_STATUS_OPTIONS.find(item => item.value === value)?.label || value || '—'
);

const Complaints = () => {
  const role = getUserRole();
  const isAdminView = role === 'SUPER_ADMIN' || role === 'PRISON_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const [createForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [myFeedback, setMyFeedback] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const didLoadRef = useRef(false);

  const loadMyFeedback = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/api/v1/feedback/my');
      const list = unwrapResponseData(response.data);
      setMyFeedback(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить обращения'));
      setMyFeedback([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdminFeedback = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        skip: (nextFilters.page - 1) * nextFilters.pageSize,
        limit: nextFilters.pageSize
      };

      if (nextFilters.type) {
        params.type = nextFilters.type;
      }

      if (nextFilters.delivery_status) {
        params.delivery_status = nextFilters.delivery_status;
      }

      if (nextFilters.facility_id) {
        params.facility_id = nextFilters.facility_id;
      }

      const requests = [apiClient.get('/api/v1/feedback', { params })];

      if (isSuperAdmin) {
        requests.push(apiClient.get('/api/v1/facilities'));
      }

      const responses = await Promise.all(requests);
      const list = unwrapResponseData(responses[0].data);
      const nextList = Array.isArray(list) ? list : [];

      setFeedbackList(nextList);
      setPagination({
        current: nextFilters.page,
        pageSize: nextFilters.pageSize,
        total:
          nextList.length < nextFilters.pageSize
            ? (nextFilters.page - 1) * nextFilters.pageSize + nextList.length
            : nextFilters.page * nextFilters.pageSize + 1
      });

      if (isSuperAdmin) {
        const facilitiesList = unwrapResponseData(responses[1].data);
        setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить обращения'));
      setFeedbackList([]);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, [filters, isSuperAdmin]);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;

    if (isAdminView) {
      loadAdminFeedback(INITIAL_FILTERS);
      return;
    }

    loadMyFeedback();
  }, [isAdminView, loadAdminFeedback, loadMyFeedback]);

  const handleCreateFeedback = async values => {
    setSaving(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/feedback', values);
      message.success(response.data.message);
      createForm.resetFields();
      await loadMyFeedback();
    } catch (requestError) {
      const nextError = getApiErrorMessage(requestError, 'Не удалось отправить обращение');
      message.error(nextError);
      setError(nextError);
    } finally {
      setSaving(false);
    }
  };

  const handleAdminFilterFinish = values => {
    const nextFilters = {
      type: values.type,
      delivery_status: values.delivery_status,
      facility_id: values.facility_id,
      page: 1,
      pageSize: pagination.pageSize
    };

    setFilters(nextFilters);
    loadAdminFeedback(nextFilters);
  };

  const handleAdminFilterReset = () => {
    filterForm.resetFields();
    setFilters(INITIAL_FILTERS);
    loadAdminFeedback(INITIAL_FILTERS);
  };

  const facilityOptions = useMemo(() => facilities.map(item => ({
    value: item.id,
    label: item.name
  })), [facilities]);

  const userColumns = [
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: value => <Tag color={value === 'COMPLAINT' ? 'red' : 'blue'}>{formatFeedbackType(value)}</Tag>
    },
    {
      title: 'Тема',
      dataIndex: 'subject',
      key: 'subject',
      width: 240
    },
    {
      title: 'Текст',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: 'Статус доставки',
      dataIndex: 'delivery_status',
      key: 'delivery_status',
      width: 180,
      render: value => <Tag color={DELIVERY_STATUS_COLORS[value] || 'default'}>{formatDeliveryStatus(value)}</Tag>
    },
    {
      title: 'Создано',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: value => formatDateTime(value)
    }
  ];

  const adminColumns = [
    {
      title: 'ФИО пользователя',
      dataIndex: 'user_full_name',
      key: 'user_full_name',
      width: 220
    },
    {
      title: 'Учреждение',
      dataIndex: 'facility_name',
      key: 'facility_name',
      width: 220,
      render: value => value || '—'
    },
    {
      title: 'Тип обращения',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: value => <Tag color={value === 'COMPLAINT' ? 'red' : 'blue'}>{formatFeedbackType(value)}</Tag>
    },
    {
      title: 'Тема',
      dataIndex: 'subject',
      key: 'subject',
      width: 220
    },
    {
      title: 'Текст',
      dataIndex: 'message',
      key: 'message',
      width: 320
    },
    {
      title: 'Статус доставки',
      dataIndex: 'delivery_status',
      key: 'delivery_status',
      width: 180,
      render: value => <Tag color={DELIVERY_STATUS_COLORS[value] || 'default'}>{formatDeliveryStatus(value)}</Tag>
    },
    {
      title: 'Email получателя',
      dataIndex: 'recipient_email',
      key: 'recipient_email',
      width: 220,
      render: value => value || '—'
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: value => formatDateTime(value)
    }
  ];

  if (isAdminView) {
    return (
      <div className="complaints-page complaints-page--admin">
        <div className="page-header">
          <div className="container">
            <Title level={1} className="page-title">
              Предложения и жалобы
            </Title>
          </div>
        </div>

        <div className="content-section">
          <div className="container">
            <div className="complaints-admin-section">
              <div className="complaints-admin-header">
                <div>
                  <Title level={3} className="complaints-admin-title">Список обращений</Title>
                  <Text className="complaints-admin-note">
                    Все обращения пользователей с фильтрацией по типу, статусу доставки и учреждению.
                  </Text>
                </div>
              </div>

              {error ? <Alert type="error" message={error} showIcon className="complaints-alert" /> : null}

              <Card className="complaints-table-card">
                <Form form={filterForm} layout="vertical" onFinish={handleAdminFilterFinish}>
                  <div className="complaints-filter-grid">
                    <Form.Item label="Тип обращения" name="type">
                      <Select allowClear options={FEEDBACK_TYPE_OPTIONS} placeholder="Выберите тип обращения" />
                    </Form.Item>
                    <Form.Item label="Статус доставки" name="delivery_status">
                      <Select allowClear options={DELIVERY_STATUS_OPTIONS} placeholder="Выберите статус доставки" />
                    </Form.Item>
                    {isSuperAdmin ? (
                      <Form.Item label="Учреждение" name="facility_id">
                        <Select allowClear options={facilityOptions} placeholder="Выберите учреждение" />
                      </Form.Item>
                    ) : null}
                  </div>
                  <Space>
                    <Button type="primary" htmlType="submit">Применить</Button>
                    <Button onClick={handleAdminFilterReset}>Сбросить</Button>
                  </Space>
                </Form>
              </Card>

              <Spin spinning={loading}>
                <Card className="complaints-table-card">
                  <Table
                    rowKey="id"
                    dataSource={feedbackList}
                    columns={adminColumns}
                    locale={{ emptyText: 'Обращений нет' }}
                    scroll={{ x: 1600 }}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      onChange: (page, pageSize) => {
                        const nextFilters = {
                          ...filters,
                          page,
                          pageSize
                        };

                        setFilters(nextFilters);
                        loadAdminFeedback(nextFilters);
                      }
                    }}
                  />
                </Card>
              </Spin>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="complaints-page">
      <div className="page-header">
        <div className="container">
          <div className="complaints-page-header">
            <Title level={1} className="page-title">
              Предложения и жалобы
            </Title>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Мои обращения
            </Button>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="complaints-user-layout">
            {error ? <Alert type="error" message={error} showIcon className="complaints-alert" /> : null}

            <Card className="form-wrapper" bordered={false}>
              <Title level={3} className="complaints-user-title">Отправить обращение</Title>
              <Form
                form={createForm}
                layout="vertical"
                onFinish={handleCreateFeedback}
                className="complaints-form"
              >
                <Form.Item
                  label="Тип обращения"
                  name="type"
                  rules={[{ required: true, message: 'Выберите тип обращения' }]}
                >
                  <Select options={FEEDBACK_TYPE_OPTIONS} placeholder="Выберите тип обращения" />
                </Form.Item>

                <Form.Item
                  label="Тема"
                  name="subject"
                  rules={[{ required: true, message: 'Введите тему обращения' }]}
                >
                  <Input placeholder="Введите тему обращения" />
                </Form.Item>

                <Form.Item
                  label="Текст"
                  name="message"
                  rules={[{ required: true, message: 'Введите текст обращения' }]}
                >
                  <Input.TextArea rows={6} placeholder="Опишите обращение" />
                </Form.Item>

                <Form.Item className="complaints-submit-wrap">
                  <Button type="primary" htmlType="submit" block loading={saving}>
                    Отправить
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Drawer
              title="Мои обращения"
              placement="right"
              width={760}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Spin spinning={loading}>
                <Table
                  rowKey="id"
                  dataSource={myFeedback}
                  columns={userColumns}
                  locale={{ emptyText: 'Обращений пока нет' }}
                  pagination={false}
                  scroll={{ x: 1100 }}
                />
              </Spin>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
