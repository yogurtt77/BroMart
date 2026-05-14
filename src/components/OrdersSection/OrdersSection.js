import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Input, Row, Space, Spin, Tag, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import './OrdersSection.scss';

const { Title, Text } = Typography;
const unwrapResponseData = (payload) => payload?.data ?? payload;

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectCommentById, setRejectCommentById] = useState({});
  const [rejectModeById, setRejectModeById] = useState({});
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setFetching(true);
    try {
      const response = await apiClient.get('/api/v1/orders');
      const ordersList = unwrapResponseData(response.data);
      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки списка заказов');
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async (orderId) => {
    setBusyId(orderId);
    setError('');
    try {
      await apiClient.post(`/api/v1/orders/${orderId}/approve`);
      await loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка одобрения заказа');
    } finally {
      setBusyId(null);
    }
  };

  const handleStartReject = (orderId) => {
    setRejectModeById((prev) => ({ ...prev, [orderId]: true }));
  };

  const handleReject = async (orderId) => {
    const reason = rejectCommentById[orderId] || '';
    setBusyId(orderId);
    setError('');
    try {
      await apiClient.post(`/api/v1/orders/${orderId}/reject`, { reason });
      setRejectModeById((prev) => ({ ...prev, [orderId]: false }));
      setRejectCommentById((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      await loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка отклонения заказа');
    } finally {
      setBusyId(null);
    }
  };

  const renderItems = (items) => {
    const list = items || [];
    if (!list.length) {
      return <Text type="secondary">Нет позиций</Text>;
    }

    return list.map((item) => (
      <div key={item.id} className="order-item-row">
        <Text>
          {item.product_name} — {item.quantity} шт. × {Number(item.unit_price).toLocaleString('ru-RU')} ₸ ={' '}
          {Number(item.subtotal).toLocaleString('ru-RU')} ₸
        </Text>
      </div>
    ));
  };

  return (
    <section className="orders-section">
      <Title level={3} className="orders-title">Список заказов</Title>

      {error && <Alert type="error" message={error} showIcon className="orders-alert" />}

      <Spin spinning={fetching}>
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col key={order.id} xs={24} lg={12}>
            <Card className="order-card" bordered={false}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong>{order.user_full_name}</Text>
                <Text type="secondary">Учреждение: {order.facility_name}</Text>
                <Text>Сумма заказа: {Number(order.total_amount).toLocaleString('ru-RU')} ₸</Text>
                <Text type="secondary">{new Date(order.created_at).toLocaleString('ru-RU')}</Text>
                <div>
                  <Tag color={order.status === 'PENDING' ? 'gold' : order.status === 'APPROVED' ? 'green' : 'red'}>
                    {order.status}
                  </Tag>
                </div>

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
                      onChange={(event) => {
                        const value = event.target.value;
                        setRejectCommentById((prev) => ({ ...prev, [order.id]: value }));
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
      </Spin>
    </section>
  );
};

export default OrdersSection;
