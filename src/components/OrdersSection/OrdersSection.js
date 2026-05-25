import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CarOutlined,
  ToolOutlined
} from '@ant-design/icons';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime } from '../../utils/admin';
import {
  formatOrderStatus,
  getOrderStatusColor
} from '../../utils/orderStatus';
import './OrdersSection.scss';

const { Title, Text } = Typography;
const unwrapResponseData = payload => payload?.data ?? payload;

const STATUS_CARDS = [
  { key: 'PENDING', title: 'Ожидают', icon: <ClockCircleOutlined />, tone: 'orange' },
  { key: 'APPROVED', title: 'Одобрены', icon: <InboxOutlined />, tone: 'green' },
  { key: 'PACKING', title: 'Собираются', icon: <ToolOutlined />, tone: 'gold' },
  { key: 'READY_FOR_SHIPMENT', title: 'Готовы к отправке', icon: <CarOutlined />, tone: 'cyan' },
  { key: 'FAILED_DELIVERY', title: 'Проблемные', icon: <CloseCircleOutlined />, tone: 'red' },
  { key: 'DELIVERED', title: 'Доставлены', icon: <CheckCircleOutlined />, tone: 'blue' }
];

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
    } catch {
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

  const statusCounters = useMemo(
    () =>
      STATUS_CARDS.map(card => ({
        ...card,
        count: orders.filter(order => order.status === card.key).length
      })),
    [orders]
  );

  const filteredOrders = useMemo(
    () => orders.filter(order => (statusFilter ? order.status === statusFilter : true)),
    [orders, statusFilter]
  );

  const handleStatusCardClick = status => {
    setStatusFilter(prev => (prev === status ? undefined : status));
  };

  return (
    <section className="orders-section admin-section">
      <Title level={3} className="orders-title">
        Заказы учреждения
      </Title>

      {error ? <Alert type="error" message={error} showIcon className="orders-alert" /> : null}

      <Row gutter={[16, 16]} className="admin-stats-grid orders-section__stats">
        {statusCounters.map(card => (
          <Col key={card.key} xs={24} sm={12} xl={8}>
            <Card
              className={`admin-overview-card admin-overview-card--clickable admin-overview-card--${card.tone} ${
                statusFilter === card.key ? 'admin-overview-card--active' : ''
              }`}
              onClick={() => handleStatusCardClick(card.key)}
            >
              <span className="admin-overview-card__icon">{card.icon}</span>
              <div className="admin-overview-card__label">{card.title}</div>
              <div className="admin-overview-card__value">{card.count}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Spin spinning={fetching}>
        <Card className="admin-table-card">
          {!filteredOrders.length ? (
            <Empty description="Заказов нет" />
          ) : (
            <Table
              rowKey="id"
              dataSource={filteredOrders}
              pagination={false}
              scroll={{ x: 1180 }}
              columns={[
                {
                  title: 'Заказ',
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
                  title: 'Учреждение',
                  dataIndex: 'facility_name',
                  key: 'facility_name',
                  width: 210,
                  render: value => value || '—'
                },
                {
                  title: 'Статус',
                  dataIndex: 'status',
                  key: 'status',
                  width: 180,
                  render: value => (
                    <Tag color={getOrderStatusColor(value)}>{formatOrderStatus(value)}</Tag>
                  )
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
                  title: 'Курьер',
                  dataIndex: 'courier_name',
                  key: 'courier_name',
                  width: 190,
                  render: value => value || '—'
                },
                {
                  title: 'Действия',
                  key: 'actions',
                  width: 250,
                  render: (_, order) => (
                    <div className="orders-table-actions">
                      {order.status === 'PENDING' ? (
                        <>
                          <Space wrap>
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
                          </Space>
                          {rejectModeById[order.id] ? (
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
                        </>
                      ) : (
                        <Text type="secondary">Нет действий</Text>
                      )}
                    </div>
                  )
                }
              ]}
              expandable={{
                expandedRowRender: order => (
                  <div className="orders-expanded">
                    <div className="orders-expanded__meta">
                      {order.recipient_employee_name ? (
                        <Text>Принял сотрудник: {order.recipient_employee_name}</Text>
                      ) : null}
                      {order.rejection_reason ? (
                        <Text type="danger">Причина отклонения: {order.rejection_reason}</Text>
                      ) : null}
                    </div>
                    <div className="order-items-block">
                      <Text strong>Состав заказа:</Text>
                      <div className="admin-order-items">
                        {(order.items || []).length ? (
                          (order.items || []).map(item => (
                            <div key={item.id} className="admin-order-item-row">
                              <span>{item.product_name}</span>
                              <span>{item.quantity} шт.</span>
                              <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">Нет позиций</Text>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          )}
        </Card>
      </Spin>
    </section>
  );
};

export default OrdersSection;
