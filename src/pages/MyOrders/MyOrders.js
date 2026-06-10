import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Card,
  Divider,
  Empty,
  Grid,
  Row,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime } from '../../utils/admin';
import {
  formatOrderStatus,
  getOrderStatusColor,
  getOrderTimelineStep
} from '../../utils/orderStatus';
import './MyOrders.scss';

const { Title, Text } = Typography;

const unwrapData = payload => payload?.data ?? payload;

const itemColumns = [
  { title: 'Товар', dataIndex: 'product_name', key: 'product_name' },
  { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity', width: 90 },
  {
    title: 'Цена',
    dataIndex: 'unit_price',
    key: 'unit_price',
    width: 140,
    render: value => formatCurrency(value)
  },
  {
    title: 'Сумма',
    dataIndex: 'subtotal',
    key: 'subtotal',
    width: 140,
    render: value => formatCurrency(value)
  }
];

const timelineItems = [
  { title: 'Создан' },
  { title: 'Одобрен' },
  { title: 'В сборке' },
  { title: 'Готов' },
  { title: 'В пути' },
  { title: 'Прибыл' },
  { title: 'Доставлен' }
];

const getStatusAlert = status => {
  if (status === 'PENDING') {
    return {
      type: 'info',
      message: 'Заказ ожидает одобрения',
      description: 'Средства будут списаны после подтверждения заказа.'
    };
  }

  if (status === 'REJECTED') {
    return {
      type: 'warning',
      message: 'Заказ отклонён',
      description: 'Средства по заказу не были списаны.'
    };
  }

  if (status === 'FAILED_DELIVERY') {
    return {
      type: 'warning',
      message: 'Возникла проблема с доставкой',
      description: 'Заказ не был завершён. Средства должны быть возвращены.'
    };
  }

  if (status === 'CANCELLED') {
    return {
      type: 'warning',
      message: 'Заказ отменён',
      description: 'Заказ не будет завершён.'
    };
  }

  return null;
};

const MyOrders = () => {
  const screens = Grid.useBreakpoint();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const didLoadRef = useRef(false);
  const timelineDirection = screens.lg ? 'horizontal' : 'vertical';

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;

    const load = async () => {
      setLoading(true);

      try {
        const response = await apiClient.get('/api/v1/orders');
        const list = unwrapData(response.data);
        setOrders(Array.isArray(list) ? list : []);
      } catch (error) {
        message.error(error?.response?.data?.message || 'Ошибка загрузки заказов');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">Мои заказы</Title>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Spin spinning={loading}>
            {!loading && orders.length === 0 ? (
              <Empty description="Заказов пока нет" />
            ) : (
              <Row gutter={[20, 20]}>
                {orders.map(order => {
                  const statusAlert = getStatusAlert(order.status);

                  return (
                    <div key={order.id} className="my-order-card-wrap">
                      <Card bordered={false} className="my-order-card">
                        <div className="my-order-card__header">
                          <div className="my-order-card__title-block">
                            <Title level={4} className="my-order-card__title">
                              Заказ #{String(order.id).slice(0, 8)}
                            </Title>
                            <Text type="secondary">{order.facility_name || '—'}</Text>
                          </div>
                          <div className="my-order-card__summary">
                            <div className="my-order-card__summary-label">Сумма заказа</div>
                            <div className="my-order-card__summary-value">
                              {formatCurrency(order.total_amount)}
                            </div>
                          </div>
                        </div>

                        <div className="my-order-card__meta">
                          <div className="my-order-card__meta-item">
                            <span className="my-order-card__meta-label">Создан</span>
                            <span className="my-order-card__meta-value">
                              {formatDateTime(order.created_at)}
                            </span>
                          </div>
                          {order.courier_name ? (
                            <div className="my-order-card__meta-item">
                              <span className="my-order-card__meta-label">Курьер</span>
                              <span className="my-order-card__meta-value">{order.courier_name}</span>
                            </div>
                          ) : null}
                          {order.recipient_employee_name ? (
                            <div className="my-order-card__meta-item">
                              <span className="my-order-card__meta-label">Принял сотрудник</span>
                              <span className="my-order-card__meta-value">
                                {order.recipient_employee_name}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <Space wrap className="my-order-card__tags">
                          <Tag color={getOrderStatusColor(order.status)}>
                            {formatOrderStatus(order.status)}
                          </Tag>
                          {order.courier_name ? <Tag color="blue">Курьер назначен</Tag> : null}
                        </Space>

                        <Steps
                          size="small"
                          direction={timelineDirection}
                          current={getOrderTimelineStep(order.status)}
                          items={timelineItems}
                          className="my-order-steps"
                        />

                        {statusAlert ? (
                          <Alert
                            type={statusAlert.type}
                            message={statusAlert.message}
                            description={statusAlert.description}
                            showIcon
                            className="my-order-alert"
                          />
                        ) : null}

                        {order.rejection_reason ? (
                          <Text type="danger" className="my-order-card__reason">
                            {order.rejection_reason}
                          </Text>
                        ) : null}

                        <Divider className="my-order-card__divider" />

                        <div className="my-order-items-block">
                          <Title level={5} className="my-order-items-block__title">
                            Состав заказа
                          </Title>
                          <Table
                            className="my-order-items-table"
                            size="small"
                            pagination={false}
                            columns={itemColumns}
                            dataSource={order.items || []}
                            rowKey="id"
                          />
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </Row>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
