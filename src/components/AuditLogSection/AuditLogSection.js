import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Typography
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatDateTime, formatRole, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';

const { Title, Text } = Typography;

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Супер-администратор' },
  { value: 'PRISON_ADMIN', label: 'Начальник учреждения' },
  { value: 'INMATE', label: 'Заключённый' }
];

const AuditLogSection = () => {
  const [form] = Form.useForm();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    actor_user_id: '',
    actor_role: undefined,
    action: '',
    entity_type: '',
    page: 1,
    pageSize: 10
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const didLoadRef = useRef(false);
  const didSyncFiltersRef = useRef(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      skip: (filters.page - 1) * filters.pageSize,
      limit: filters.pageSize
    };

    if (filters.actor_user_id) {
      params.actor_user_id = filters.actor_user_id;
    }

    if (filters.actor_role) {
      params.actor_role = filters.actor_role;
    }

    if (filters.action) {
      params.action = filters.action;
    }

    if (filters.entity_type) {
      params.entity_type = filters.entity_type;
    }

    try {
      const response = await apiClient.get('/api/v1/admin/audit-log', { params });
      const list = unwrapResponseData(response.data);
      setEvents(list);
      setPagination((prev) => ({
        ...prev,
        current: filters.page,
        pageSize: filters.pageSize,
        total: list.length < filters.pageSize ? (filters.page - 1) * filters.pageSize + list.length : filters.page * filters.pageSize + 1
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить журнал аудита'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!didLoadRef.current) {
      return;
    }

    if (!didSyncFiltersRef.current) {
      didSyncFiltersRef.current = true;
      return;
    }

    loadEvents();
  }, [filters, loadEvents]);

  const handleFilterFinish = (values) => {
    setFilters((prev) => ({
      ...prev,
      actor_user_id: values.actor_user_id || '',
      actor_role: values.actor_role,
      action: values.action || '',
      entity_type: values.entity_type || '',
      page: 1
    }));
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({
      actor_user_id: '',
      actor_role: undefined,
      action: '',
      entity_type: '',
      page: 1,
      pageSize: 10
    });
  };

  const openDetails = async (eventId) => {
    setDetailsLoading(true);
    setDrawerOpen(true);

    try {
      const response = await apiClient.get(`/api/v1/admin/audit-log/${eventId}`);
      setSelectedEvent(unwrapResponseData(response.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить запись аудита'));
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Журнал аудита</Title>
          <Text className="admin-section-note">Фильтры, список событий и полная детализация записей.</Text>
        </div>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Card className="admin-table-card">
        <Form form={form} layout="vertical" onFinish={handleFilterFinish}>
          <div className="admin-filter-grid">
            <Form.Item label="ID пользователя" name="actor_user_id">
              <Input placeholder="Введите ID пользователя" />
            </Form.Item>
            <Form.Item label="Роль" name="actor_role">
              <Select allowClear options={ROLE_OPTIONS} placeholder="Выберите роль" />
            </Form.Item>
            <Form.Item label="Действие" name="action">
              <Input placeholder="Например CREATE_PRODUCT" />
            </Form.Item>
            <Form.Item label="Тип сущности" name="entity_type">
              <Input placeholder="Например product" />
            </Form.Item>
          </div>
          <Space>
            <Button type="primary" htmlType="submit">Применить</Button>
            <Button onClick={handleReset}>Сбросить</Button>
          </Space>
        </Form>
      </Card>

      <Spin spinning={loading}>
        <Card className="admin-table-card">
          <Table
            rowKey="id"
            dataSource={events}
            locale={{ emptyText: 'Нет событий' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => setFilters((prev) => ({ ...prev, page, pageSize }))
            }}
            columns={[
              { title: 'Дата', dataIndex: 'created_at', key: 'created_at', render: (value) => formatDateTime(value) },
              { title: 'Роль', dataIndex: 'actor_role', key: 'actor_role', render: (value) => formatRole(value) },
              { title: 'Действие', dataIndex: 'action', key: 'action' },
              { title: 'Тип сущности', dataIndex: 'entity_type', key: 'entity_type' },
              { title: 'Описание', dataIndex: 'summary', key: 'summary' },
              {
                title: 'Детали',
                key: 'actions',
                render: (_, record) => <Button type="link" onClick={() => openDetails(record.id)}>Открыть</Button>
              }
            ]}
          />
        </Card>
      </Spin>

      <Drawer
        title="Детали записи аудита"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={920}
      >
        <Spin spinning={detailsLoading}>
          <Descriptions bordered column={2} size="small" className="admin-descriptions">
            <Descriptions.Item label="ID">{selectedEvent?.id || '—'}</Descriptions.Item>
            <Descriptions.Item label="Дата">{formatDateTime(selectedEvent?.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Пользователь">{selectedEvent?.actor_user_id || '—'}</Descriptions.Item>
            <Descriptions.Item label="Роль">{formatRole(selectedEvent?.actor_role)}</Descriptions.Item>
            <Descriptions.Item label="Действие">{selectedEvent?.action || '—'}</Descriptions.Item>
            <Descriptions.Item label="Сущность">{selectedEvent?.entity_type || '—'}</Descriptions.Item>
            <Descriptions.Item label="ID сущности" span={2}>{selectedEvent?.entity_id || '—'}</Descriptions.Item>
            <Descriptions.Item label="Описание" span={2}>{selectedEvent?.summary || '—'}</Descriptions.Item>
          </Descriptions>

          <Card className="admin-table-card" title="payload_before" style={{ marginTop: 16 }}>
            <pre className="admin-json-block">{JSON.stringify(selectedEvent?.payload_before, null, 2)}</pre>
          </Card>

          <Card className="admin-table-card" title="payload_after" style={{ marginTop: 16 }}>
            <pre className="admin-json-block">{JSON.stringify(selectedEvent?.payload_after, null, 2)}</pre>
          </Card>
        </Spin>
      </Drawer>
    </section>
  );
};

export default AuditLogSection;
