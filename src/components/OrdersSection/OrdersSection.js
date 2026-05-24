import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Empty, Input, Row, Select, Space, Spin, Tag, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime } from '../../utils/admin';
import { formatOrderStatus, getOrderStatusColor, ORDER_STATUS_OPTIONS } from '../../utils/orderStatus';
import './OrdersSection.scss';

const { Title, Text } = Typography;
const unwrapResponseData = payload => payload?.data ?? payload;

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectCommentById, setRejectCommentById] = useState({});
  const [rejectModeById, setRejectModeById] = useState({});
  const [statusFilter, setStatusFilter] = useState(undefined);
  const didLoadRef = useRef(false);

  const loadOrders = async () => {
    setFetching(true);

    try {
      const response = await apiClient.get('/api/v1/orders');
      const ordersList = unwrapResponseData(response.data);
      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить список заказов');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadOrders();
  }, []);

  const handleApprove = async orderId => {
    setBusyId(orderId);
    setError('');

    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/approve`);
      message.success(response.data.message);
      await loadOrders();
    } catch (err) {
      const nextError = err?.response?.data?.message || 'Ошибка одобрения заказа';
      message.error(nextError);
      setError(nextError);
    } finally {
      setBusyId(null);
    }
  };

  const handleStartReject = orderId => {
    setRejectModeById(prev => ({ ...prev, [orderId]: true }));
  };

  const handleReject = async orderId => {
    const reason = rejectCommentById[orderId] || '';
    setBusyId(orderId);
    setError('');

    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/reject`, { reason });
      message.success(response.data.message);
      setRejectModeById(prev => ({ ...prev, [orderId]: false }));
      setRejectCommentById(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      await loadOrders();
    } catch (err) {
      const nextError = err?.response?.data?.message || 'Ошибка отклонения заказа';
      message.error(nextError);
      setError(nextError);
    } finally {
      setBusyId(null);
    }
  };

  const renderItems = items => {
    const list = items || [];

    if (!list.length) {
      return <Text type="secondary">Нет позиций</Text>;
    }

    return list.map(item => (
      <div key={item.id} className="order-item-row">
        <Text>
          {item.product_name} — {item.quantity} шт. × {formatCurrency(item.unit_price)} = {formatCurrency(item.subtotal)}
        </Text>
      </div>
    ));
  };

  const filteredOrders = orders.filter(order => (statusFilter ? order.status === statusFilter : true));

  return (
    <section className="orders-section">
      <Title level={3} className="orders-title">Заказы учреждения</Title>

      {error ? <Alert type="error" message={error} showIcon className="orders-alert" /> : null}

      <div className="orders-toolbar">
        <Select
          allowClear
          value={statusFilter}
          options={ORDER_STATUS_OPTIONS}
          placeholder="Фильтр по статусу"
          style={{ minWidth: 260 }}
          onChange={setStatusFilter}
        />
        <Button onClick={() => setStatusFilter(undefined)}>Сбросить</Button>
      </div>

      <Spin spinning={fetching}>
        {!filteredOrders.length ? (
          <Card className="order-card" bordered={false}>
            <Empty description="Заказов нет" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredOrders.map(order => (
              <Col key={order.id} xs={24} lg={12}>
                <Card className="order-card" bordered={false}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Text strong>{order.user_full_name}</Text>
                    <Text type="secondary">Учреждение: {order.facility_name || '—'}</Text>
                    <Text>Сумма заказа: {formatCurrency(order.total_amount)}</Text>
                    <Text type="secondary">{formatDateTime(order.created_at)}</Text>
                    <Space wrap>
                      <Tag color={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Tag>
                      {order.courier_name ? <Tag color="blue">Курьер: {order.courier_name}</Tag> : null}
                    </Space>
                    {order.recipient_employee_name ? (
                      <Text type="secondary">Принял сотрудник: {order.recipient_employee_name}</Text>
                    ) : null}
                    {order.rejection_reason ? (
                      <Text type="danger">Причина отклонения: {order.rejection_reason}</Text>
                    ) : null}

                    <div className="order-items-block">
                      <Text strong>Состав заказа:</Text>
                      {renderItems(order.items)}
                    </div>

                    {order.status === 'PENDING' ? (
                      <div className="order-actions">
                        <Button
                          type="primary"
                          loading={busyId === order.id}
                          onClick={() => handleApprove(order.id)}
                        >
                          Одобрить
                        </Button>
                        <Button danger onClick={() => handleStartReject(order.id)}>
                          Отклонить
                        </Button>
                      </div>
                    ) : null}

                    {order.status === 'PENDING' && rejectModeById[order.id] ? (
                      <div className="reject-comment-block">
                        <Input.TextArea
                          placeholder="Комментарий к отклонению"
                          rows={3}
                          value={rejectCommentById[order.id] || ''}
                          onChange={event => {
                            const value = event.target.value;
                            setRejectCommentById(prev => ({ ...prev, [order.id]: value }));
                          }}
                        />
                        <Button
                          danger
                          loading={busyId === order.id}
                          onClick={() => handleReject(order.id)}
                        >
                          Подтвердить отклонение
                        </Button>
                      </div>
                    ) : null}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </section>
  );
};

export default OrdersSection;
