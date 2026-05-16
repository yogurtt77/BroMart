import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatOrderStatus,
  formatSecurityRegime,
  getApiErrorMessage,
  securityRegimeOptions,
  unwrapResponseData
} from '../../utils/admin';

const { Title, Text } = Typography;

const ACTIVE_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'true', label: 'Активные' },
  { value: 'false', label: 'Неактивные' }
];

const InmatesManagementSection = () => {
  const [filterForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [facilities, setFacilities] = useState([]);
  const [inmates, setInmates] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    facility_id: undefined,
    security_regime: undefined,
    is_active: 'all',
    search: '',
    page: 1,
    pageSize: 10
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedInmate, setSelectedInmate] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const didLoadFacilitiesRef = useRef(false);
  const didLoadInmatesRef = useRef(false);
  const didSyncFiltersRef = useRef(false);

  const loadFacilities = async () => {
    const response = await apiClient.get('/api/v1/facilities');
    setFacilities(unwrapResponseData(response.data));
  };

  const loadInmates = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      role: 'INMATE',
      skip: (filters.page - 1) * filters.pageSize,
      limit: filters.pageSize
    };

    if (filters.facility_id) {
      params.facility_id = filters.facility_id;
    }

    if (filters.security_regime) {
      params.security_regime = filters.security_regime;
    }

    if (filters.is_active !== 'all') {
      params.is_active = filters.is_active === 'true';
    }

    if (filters.search) {
      params.search = filters.search;
    }

    try {
      const response = await apiClient.get('/api/v1/users', { params });
      const list = unwrapResponseData(response.data);
      setInmates(list);
      setPagination((prev) => ({
        ...prev,
        current: filters.page,
        pageSize: filters.pageSize,
        total: list.length < filters.pageSize ? (filters.page - 1) * filters.pageSize + list.length : filters.page * filters.pageSize + 1
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить список заключённых'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (didLoadFacilitiesRef.current) {
      return;
    }

    didLoadFacilitiesRef.current = true;

    const initialize = async () => {
      try {
        await loadFacilities();
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Не удалось загрузить учреждения'));
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (didLoadInmatesRef.current) {
      return;
    }

    didLoadInmatesRef.current = true;
    loadInmates();
  }, [loadInmates]);

  useEffect(() => {
    if (!didLoadInmatesRef.current) {
      return;
    }

    if (!didSyncFiltersRef.current) {
      didSyncFiltersRef.current = true;
      return;
    }

    loadInmates();
  }, [filters, loadInmates]);

  const handleFilterFinish = (values) => {
    setFilters((prev) => ({
      ...prev,
      facility_id: values.facility_id,
      security_regime: values.security_regime,
      is_active: values.is_active || 'all',
      search: values.search || '',
      page: 1
    }));
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setFilters({
      facility_id: undefined,
      security_regime: undefined,
      is_active: 'all',
      search: '',
      page: 1,
      pageSize: 10
    });
  };

  const handleCreate = async (values) => {
    setSaving(true);

    const formData = new FormData();
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('full_name', values.full_name);
    formData.append('facility_id', values.facility_id);
    formData.append('security_regime', values.security_regime);
    formData.append('iin', values.iin);
    formData.append('transfer_date', values.transfer_date);
    formData.append('release_date', values.release_date);
    formData.append('monthly_limit', values.monthly_limit);
    formData.append('file', values.file[0].originFileObj);

    try {
      const response = await apiClient.post('/api/v1/users/inmates/with-photo', formData);
      message.success(response.data.message);
      setCreateModalOpen(false);
      createForm.resetFields();
      await loadInmates();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось создать заключённого'));
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = async (userId) => {
    setSaving(true);
    try {
      const response = await apiClient.get(`/api/v1/users/${userId}`);
      const inmate = unwrapResponseData(response.data);
      setSelectedInmate(inmate);
      editForm.setFieldsValue({
        full_name: inmate.full_name,
        facility_id: inmate.facility_id,
        is_active: inmate.is_active
      });
      setEditModalOpen(true);
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось загрузить данные заключённого'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInmate = async (values) => {
    setSaving(true);

    try {
      const response = await apiClient.patch(`/api/v1/users/${selectedInmate.id}`, values);
      message.success(response.data.message);
      setEditModalOpen(false);
      editForm.resetFields();
      await loadInmates();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось обновить заключённого'));
    } finally {
      setSaving(false);
    }
  };

  const openSettingsModal = async (userId) => {
    setSaving(true);
    try {
      const response = await apiClient.get(`/api/v1/users/${userId}`);
      const inmate = unwrapResponseData(response.data);
      setSelectedInmate(inmate);
      settingsForm.setFieldsValue({
        security_regime: inmate.security_regime,
        monthly_limit: inmate.monthly_limit
      });
      setSettingsModalOpen(true);
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось загрузить настройки заключённого'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSettings = async (values) => {
    setSaving(true);

    try {
      const response = await apiClient.patch(`/api/v1/users/${selectedInmate.id}/inmate-settings`, values);
      message.success(response.data.message);
      setSettingsModalOpen(false);
      settingsForm.resetFields();
      await loadInmates();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось обновить настройки'));
    } finally {
      setSaving(false);
    }
  };

  const openDetailsDrawer = async (record) => {
    setSelectedInmate(record);
    setDetailsDrawerOpen(true);
    setDetailsLoading(true);

    try {
      const [walletResponse, ordersResponse] = await Promise.all([
        apiClient.get(`/api/v1/admin/inmates/${record.id}/wallet`),
        apiClient.get(`/api/v1/admin/inmates/${record.id}/orders`)
      ]);

      setWallet(unwrapResponseData(walletResponse.data));
      setOrders(unwrapResponseData(ordersResponse.data));
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось загрузить детали заключённого'));
    } finally {
      setDetailsLoading(false);
    }
  };

  const facilityOptions = facilities.map((item) => ({
    value: item.id,
    label: item.name
  }));

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Управление заключёнными</Title>
          <Text className="admin-section-note">Список, поиск, фильтры, создание, редактирование, заказы и кошелёк.</Text>
        </div>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>Создать заключённого</Button>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Card className="admin-table-card">
        <Form form={filterForm} layout="vertical" onFinish={handleFilterFinish}>
          <div className="admin-filter-grid">
            <Form.Item label="Учреждение" name="facility_id">
              <Select allowClear options={facilityOptions} placeholder="Выберите учреждение" />
            </Form.Item>
            <Form.Item label="Режим" name="security_regime">
              <Select allowClear options={securityRegimeOptions} placeholder="Выберите режим" />
            </Form.Item>
            <Form.Item label="Статус" name="is_active" initialValue="all">
              <Select options={ACTIVE_OPTIONS} placeholder="Выберите статус" />
            </Form.Item>
            <Form.Item label="Поиск" name="search">
              <Input placeholder="ФИО, ИИН, email" />
            </Form.Item>
          </div>
          <Space>
            <Button type="primary" htmlType="submit">Применить</Button>
            <Button onClick={handleResetFilters}>Сбросить</Button>
          </Space>
        </Form>
      </Card>

      <Spin spinning={loading}>
        <Card className="admin-table-card">
          <Table
            rowKey="id"
            dataSource={inmates}
            locale={{ emptyText: 'Нет заключённых' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setFilters((prev) => ({ ...prev, page, pageSize }));
              }
            }}
            columns={[
              {
                title: 'Фото',
                dataIndex: 'photo_url',
                key: 'photo_url',
                render: (value, record) => <Avatar src={value} size={44}>{record.full_name?.[0]}</Avatar>
              },
              { title: 'ФИО', dataIndex: 'full_name', key: 'full_name' },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'ИИН', dataIndex: 'iin', key: 'iin' },
              { title: 'Учреждение', dataIndex: 'facility_name', key: 'facility_name' },
              {
                title: 'Режим',
                dataIndex: 'security_regime',
                key: 'security_regime',
                render: (value) => formatSecurityRegime(value)
              },
              {
                title: 'Месячный лимит',
                dataIndex: 'monthly_limit',
                key: 'monthly_limit',
                render: (value) => formatCurrency(value)
              },
              {
                title: 'Статус',
                dataIndex: 'is_active',
                key: 'is_active',
                render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Активен' : 'Неактивен'}</Tag>
              },
              {
                title: 'Действия',
                key: 'actions',
                render: (_, record) => (
                  <Space wrap>
                    <Button type="link" onClick={() => openEditModal(record.id)}>Редактировать</Button>
                    <Button type="link" onClick={() => openSettingsModal(record.id)}>Настройки</Button>
                    <Button type="link" onClick={() => openDetailsDrawer(record)}>Детали</Button>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      </Spin>

      <Modal
        title="Создание заключённого"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={saving}
        width={780}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <div className="admin-filter-grid">
            <Form.Item label="ФИО" name="full_name" rules={[{ required: true, message: 'Введите ФИО' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }, { type: 'email', message: 'Некорректный email' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }, { min: 8, message: 'Минимум 8 символов' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item label="ИИН" name="iin" rules={[{ required: true, message: 'Введите ИИН' }]}>
              <Input maxLength={12} />
            </Form.Item>
            <Form.Item label="Учреждение" name="facility_id" rules={[{ required: true, message: 'Выберите учреждение' }]}>
              <Select options={facilityOptions} placeholder="Выберите учреждение" />
            </Form.Item>
            <Form.Item label="Режим" name="security_regime" rules={[{ required: true, message: 'Выберите режим' }]}>
              <Select options={securityRegimeOptions} placeholder="Выберите режим" />
            </Form.Item>
            <Form.Item label="Дата перевода" name="transfer_date" rules={[{ required: true, message: 'Выберите дату перевода' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Дата освобождения" name="release_date" rules={[{ required: true, message: 'Выберите дату освобождения' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Месячный лимит" name="monthly_limit" rules={[{ required: true, message: 'Введите лимит' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item
            label="Фото"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(event) => (Array.isArray(event) ? event : event?.fileList)}
            rules={[{ required: true, message: 'Загрузите фото' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
              <Button>Загрузить фото</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Редактирование заключённого"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateInmate}>
          <Form.Item label="ФИО" name="full_name" rules={[{ required: true, message: 'Введите ФИО' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Учреждение" name="facility_id" rules={[{ required: true, message: 'Выберите учреждение' }]}>
            <Select options={facilityOptions} placeholder="Выберите учреждение" />
          </Form.Item>
          <Form.Item label="Активен" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Настройки заключённого"
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        onOk={() => settingsForm.submit()}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={settingsForm} layout="vertical" onFinish={handleUpdateSettings}>
          <Form.Item label="Режим" name="security_regime" rules={[{ required: true, message: 'Выберите режим' }]}>
            <Select options={securityRegimeOptions} placeholder="Выберите режим" />
          </Form.Item>
          <Form.Item label="Месячный лимит" name="monthly_limit" rules={[{ required: true, message: 'Введите лимит' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={selectedInmate ? `Детали: ${selectedInmate.full_name}` : 'Детали заключённого'}
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        width={920}
      >
        <Spin spinning={detailsLoading}>
          <Descriptions bordered column={2} size="small" className="admin-descriptions">
            <Descriptions.Item label="ФИО">{selectedInmate?.full_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Учреждение">{selectedInmate?.facility_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Режим">{formatSecurityRegime(selectedInmate?.security_regime)}</Descriptions.Item>
            <Descriptions.Item label="Дата перевода">{formatDate(selectedInmate?.transfer_date)}</Descriptions.Item>
            <Descriptions.Item label="Дата освобождения">{formatDate(selectedInmate?.release_date)}</Descriptions.Item>
            <Descriptions.Item label="Месячный лимит">{formatCurrency(selectedInmate?.monthly_limit)}</Descriptions.Item>
          </Descriptions>

          <Card className="admin-table-card" title="Кошелёк" style={{ marginTop: 16 }}>
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="Баланс">{formatCurrency(wallet?.balance)}</Descriptions.Item>
              <Descriptions.Item label="Потрачено за месяц">{formatCurrency(wallet?.monthly_spent)}</Descriptions.Item>
              <Descriptions.Item label="Месячный лимит">{formatCurrency(wallet?.monthly_limit)}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="admin-table-card" title="Заказы" style={{ marginTop: 16 }}>
            <Table
              rowKey="id"
              dataSource={orders}
              pagination={false}
              locale={{ emptyText: 'Нет заказов' }}
              columns={[
                {
                  title: 'Статус',
                  dataIndex: 'status',
                  key: 'status',
                  render: (value) => <Tag>{formatOrderStatus(value)}</Tag>
                },
                {
                  title: 'Сумма',
                  dataIndex: 'total_amount',
                  key: 'total_amount',
                  render: (value) => formatCurrency(value)
                },
                {
                  title: 'Дата',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (value) => formatDateTime(value)
                }
              ]}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="admin-order-items">
                    {(record.items || []).map((item) => (
                      <div key={item.id} className="admin-order-item-row">
                        <span>{item.product_name}</span>
                        <span>{item.quantity} шт.</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          </Card>
        </Spin>
      </Drawer>
    </section>
  );
};

export default InmatesManagementSection;
