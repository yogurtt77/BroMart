import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  ToolOutlined
} from '@ant-design/icons';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';
import { formatOrderStatus, getOrderStatusColor } from '../../utils/orderStatus';
import './WarehouseOrdersSection.scss';

const { Title, Text } = Typography;

const FILTER_OPTIONS = [
  { value: 'PENDING', label: 'Ожидает одобрения' },
  { value: 'APPROVED', label: 'Одобрен' },
  { value: 'PACKING', label: 'В сборке' },
  { value: 'READY_FOR_SHIPMENT', label: 'Готов к отправке' },
  { value: 'OUT_FOR_DELIVERY', label: 'В пути' },
  { value: 'ARRIVED_AT_FACILITY', label: 'Прибыл в учреждение' },
  { value: 'DELIVERED', label: 'Доставлен' },
  { value: 'FAILED_DELIVERY', label: 'Проблема с доставкой' },
  { value: 'REJECTED', label: 'Отклонён' },
  { value: 'CANCELLED', label: 'Отменён' }
];

const STATUS_CARDS = [
  { key: 'PENDING', title: 'Ожидают', icon: <ClockCircleOutlined />, tone: 'orange' },
  { key: 'APPROVED', title: 'Одобрены', icon: <InboxOutlined />, tone: 'green' },
  { key: 'PACKING', title: 'Собираются', icon: <ToolOutlined />, tone: 'gold' },
  { key: 'READY_FOR_SHIPMENT', title: 'Готовы к отправке', icon: <CarOutlined />, tone: 'cyan' },
  { key: 'FAILED_DELIVERY', title: 'Проблемные', icon: <CloseCircleOutlined />, tone: 'red' },
  { key: 'DELIVERED', title: 'Доставлены', icon: <CheckCircleOutlined />, tone: 'blue' }
];

const INITIAL_FILTERS = {
  full_name: '',
  status: undefined,
  facility_id: undefined
};

const WarehouseOrdersSection = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [assignOrder, setAssignOrder] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const didLoadRef = useRef(false);

  const loadData = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError('');

    const params = {};

    if (nextFilters.status) {
      params.status = nextFilters.status;
    }

    if (nextFilters.full_name) {
      params.full_name = nextFilters.full_name;
    }

    if (nextFilters.facility_id) {
      params.facility_id = nextFilters.facility_id;
    }

    try {
      const [ordersResponse, couriersResponse, facilitiesResponse] = await Promise.all([
        apiClient.get('/api/v1/orders', { params }),
        apiClient.get('/api/v1/users', { params: { role: 'COURIER' } }),
        apiClient.get('/api/v1/facilities')
      ]);

      const ordersList = unwrapResponseData(ordersResponse.data);
      const couriersList = unwrapResponseData(couriersResponse.data);
      const facilitiesList = unwrapResponseData(facilitiesResponse.data);

      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setCouriers(Array.isArray(couriersList) ? couriersList : []);
      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить складские заказы'));
      setOrders([]);
      setCouriers([]);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadData(INITIAL_FILTERS);
  }, [loadData]);

  const statusCounters = useMemo(() => (
    STATUS_CARDS.map(card => ({
      ...card,
      count: orders.filter(order => order.status === card.key).length
    }))
  ), [orders]);

  const courierOptions = couriers.map(courier => ({
    value: courier.id,
    label: courier.full_name
  }));

  const facilityOptions = facilities.map(facility => ({
    value: facility.id,
    label: facility.name
  }));

  const handleStartPacking = async orderId => {
    setBusyId(orderId);
    setError('');

    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/start-packing`);
      message.success(response.data.message);
      await loadData(filters);
    } catch (requestError) {
      const nextError = getApiErrorMessage(requestError, 'Не удалось взять заказ в сборку');
      message.error(nextError);
      setError(nextError);
    } finally {
      setBusyId(null);
    }
  };

  const openAssignModal = order => {
    setAssignOrder(order);
    form.setFieldsValue({ courier_id: undefined });
  };

  const handleAssignCourier = async values => {
    if (!assignOrder) {
      return;
    }

    setAssigning(true);
    setError('');

    try {
      const response = await apiClient.post(`/api/v1/orders/${assignOrder.id}/assign-courier`, {
        courier_id: values.courier_id
      });
      message.success(response.data.message);
      setAssignOrder(null);
      form.resetFields();
      await loadData(filters);
    } catch (requestError) {
      const nextError = getApiErrorMessage(requestError, 'Не удалось назначить курьера');
      message.error(nextError);
      setError(nextError);
    } finally {
      setAssigning(false);
    }
  };

  const handleFilterFinish = values => {
    const nextFilters = {
      full_name: values.full_name || '',
      status: values.status,
      facility_id: values.facility_id
    };

    setFilters(nextFilters);
    loadData(nextFilters);
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setFilters(INITIAL_FILTERS);
    loadData(INITIAL_FILTERS);
  };

  const handleStatusCardClick = status => {
    const nextFilters = {
      ...filters,
      status
    };

    filterForm.setFieldsValue({ status });
    setFilters(nextFilters);
    loadData(nextFilters);
  };

  return (
    <section className="admin-section warehouse-orders-section">
      <div className="admin-section-header warehouse-orders-section__header">
        <div>
          <Title level={3} className="admin-section-title">Заказы склада</Title>
          <Text className="admin-section-note">
            Сводка по статусам, быстрые фильтры и список заказов для работы склада.
          </Text>
        </div>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="admin-alert" /> : null}

      <Row gutter={[16, 16]} className="warehouse-orders-section__stats">
        {statusCounters.map(card => (
          <Col key={card.key} xs={24} sm={12} xl={8}>
            <Card
              className={`admin-overview-card admin-overview-card--clickable admin-overview-card--${card.tone} ${filters.status === card.key ? 'admin-overview-card--active' : ''}`}
              onClick={() => handleStatusCardClick(card.key)}
            >
              <div className="admin-overview-card__icon">{card.icon}</div>
              <div className="admin-overview-card__label">{card.title}</div>
              <div className="admin-overview-card__value">{card.count}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="admin-table-card warehouse-orders-section__filters">
        <Form form={filterForm} layout="vertical" onFinish={handleFilterFinish}>
          <div className="warehouse-orders-filters-grid warehouse-orders-filters-grid--compact">
            <Form.Item label="ФИО" name="full_name">
              <Input placeholder="Введите ФИО" />
            </Form.Item>
            <Form.Item label="Статус" name="status">
              <Select allowClear options={FILTER_OPTIONS} placeholder="Выберите статус" />
            </Form.Item>
            <Form.Item label="Учреждение" name="facility_id">
              <Select allowClear options={facilityOptions} placeholder="Выберите учреждение" />
            </Form.Item>
          </div>
          <Space wrap className="warehouse-orders-section__filter-actions">
            <Button type="primary" htmlType="submit">Применить</Button>
            <Button onClick={handleResetFilters}>Сбросить</Button>
          </Space>
        </Form>
      </Card>

      <Card className="admin-table-card warehouse-orders-section__table-card">
        {loading ? null : !orders.length ? (
          <Empty description="Заказов нет" />
        ) : (
          <Table
            rowKey="id"
            dataSource={orders}
            pagination={false}
            scroll={{ x: 1100 }}
            expandable={{
              expandedRowRender: record => (
                <div className="warehouse-orders-expanded">
                  <div className="warehouse-orders-expanded__meta">
                    {record.courier_name ? <Text>Курьер: {record.courier_name}</Text> : null}
                    {record.recipient_employee_name ? <Text>Принял: {record.recipient_employee_name}</Text> : null}
                    {record.rejection_reason ? <Text type="danger">Причина: {record.rejection_reason}</Text> : null}
                  </div>
                  <div className="admin-order-items">
                    {(record.items || []).map(item => (
                      <div key={item.id} className="admin-order-item-row">
                        <span>{item.product_name}</span>
                        <span>{item.quantity} шт.</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 120,
                render: value => `#${String(value).slice(0, 8)}`
              },
              {
                title: 'Заключённый',
                dataIndex: 'user_full_name',
                key: 'user_full_name',
                width: 220
              },
              {
                title: 'Статус',
                dataIndex: 'status',
                key: 'status',
                width: 190,
                render: value => <Tag color={getOrderStatusColor(value)}>{formatOrderStatus(value)}</Tag>
              },
              {
                title: 'Учреждение',
                dataIndex: 'facility_name',
                key: 'facility_name',
                width: 220
              },
              {
                title: 'Сумма',
                dataIndex: 'total_amount',
                key: 'total_amount',
                width: 150,
                render: value => formatCurrency(value)
              },
              {
                title: 'Создан',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 180,
                render: value => formatDateTime(value)
              },
              {
                title: 'Действия',
                key: 'actions',
                width: 260,
                render: (_, record) => (
                  <Space wrap>
                    {record.status === 'APPROVED' ? (
                      <Button
                        type="primary"
                        size="small"
                        loading={busyId === record.id}
                        onClick={() => handleStartPacking(record.id)}
                      >
                        Взять в сборку
                      </Button>
                    ) : null}
                    {record.status === 'PACKING' ? (
                      <Button size="small" onClick={() => openAssignModal(record)}>
                        Назначить курьера
                      </Button>
                    ) : null}
                  </Space>
                )
              }
            ]}
          />
        )}
      </Card>

      <Modal
        title="Назначить курьера"
        open={Boolean(assignOrder)}
        onCancel={() => setAssignOrder(null)}
        onOk={() => form.submit()}
        confirmLoading={assigning}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAssignCourier}>
          <Form.Item
            label="Курьер"
            name="courier_id"
            rules={[{ required: true, message: 'Выберите курьера' }]}
          >
            <Select options={courierOptions} placeholder="Выберите курьера" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default WarehouseOrdersSection;
