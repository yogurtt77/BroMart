import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';
import { formatOrderStatus, getOrderStatusColor } from '../../utils/orderStatus';

const { Title, Text } = Typography;

const FILTER_OPTIONS = [
  { value: 'APPROVED', label: 'Одобрен' },
  { value: 'PACKING', label: 'В сборке' },
  { value: 'READY_FOR_SHIPMENT', label: 'Готов к отправке' },
  { value: 'FAILED_DELIVERY', label: 'Проблема с доставкой' }
];

const WarehouseOrdersSection = () => {
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [assignOrder, setAssignOrder] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const didLoadRef = useRef(false);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersResponse, couriersResponse] = await Promise.all([
        apiClient.get('/api/v1/orders'),
        apiClient.get('/api/v1/users', { params: { role: 'COURIER' } })
      ]);

      const ordersList = unwrapResponseData(ordersResponse.data);
      const couriersList = unwrapResponseData(couriersResponse.data);

      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setCouriers(Array.isArray(couriersList) ? couriersList : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить складские заказы'));
      setOrders([]);
      setCouriers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadData();
  }, []);

  const filteredOrders = useMemo(() => (
    orders
      .filter(order => (statusFilter ? order.status === statusFilter : true))
  ), [orders, statusFilter]);

  const courierOptions = couriers.map(courier => ({
    value: courier.id,
    label: courier.full_name
  }));

  const handleStartPacking = async orderId => {
    setBusyId(orderId);
    setError('');

    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/start-packing`);
      message.success(response.data.message);
      await loadData();
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
      await loadData();
    } catch (requestError) {
      const nextError = getApiErrorMessage(requestError, 'Не удалось назначить курьера');
      message.error(nextError);
      setError(nextError);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Заказы склада</Title>
          <Text className="admin-section-note">Заказы для сборки, назначения курьера и контроля проблемных доставок.</Text>
        </div>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="admin-alert" /> : null}

      <Card className="admin-table-card">
        <Space wrap className="admin-toolbar">
          <Select
            allowClear
            value={statusFilter}
            options={FILTER_OPTIONS}
            placeholder="Фильтр по статусу"
            style={{ minWidth: 260 }}
            onChange={setStatusFilter}
          />
          <Button onClick={() => setStatusFilter(undefined)}>Сбросить</Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {!filteredOrders.length ? (
          <Card className="admin-table-card">
            <Empty description="Заказов нет" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredOrders.map(order => (
              <Col key={order.id} xs={24} xl={12}>
                <Card className="admin-card">
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Space wrap>
                      <Tag color={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Tag>
                      {order.courier_name ? <Tag color="blue">Курьер: {order.courier_name}</Tag> : null}
                    </Space>
                    <Text strong>{order.user_full_name}</Text>
                    <Text type="secondary">Учреждение: {order.facility_name || '—'}</Text>
                    <Text>Сумма: {formatCurrency(order.total_amount)}</Text>
                    <Text type="secondary">Дата: {formatDateTime(order.created_at)}</Text>
                    {order.recipient_employee_name ? (
                      <Text type="secondary">Принял: {order.recipient_employee_name}</Text>
                    ) : null}
                    {order.rejection_reason ? (
                      <Text type="danger">Причина: {order.rejection_reason}</Text>
                    ) : null}

                    <div className="admin-order-items">
                      {(order.items || []).map(item => (
                        <div key={item.id} className="admin-order-item-row">
                          <span>{item.product_name}</span>
                          <span>{item.quantity} шт.</span>
                          <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <Space wrap>
                      {order.status === 'APPROVED' ? (
                        <Button
                          type="primary"
                          loading={busyId === order.id}
                          onClick={() => handleStartPacking(order.id)}
                        >
                          Взять в сборку
                        </Button>
                      ) : null}
                      {order.status === 'PACKING' ? (
                        <Button onClick={() => openAssignModal(order)}>Назначить курьера</Button>
                      ) : null}
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

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
