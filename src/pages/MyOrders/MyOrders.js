import React, { useEffect, useRef, useState } from 'react';
import { Alert, Card, Col, Empty, Row, Space, Spin, Steps, Table, Tag, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime } from '../../utils/admin';
import { formatOrderStatus, getOrderStatusColor, getOrderTimelineStep } from '../../utils/orderStatus';
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
    width: 120,
    render: value => formatCurrency(value)
  },
  {
    title: 'Сумма',
    dataIndex: 'subtotal',
    key: 'subtotal',
    width: 120,
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const didLoadRef = useRef(false);

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
      } catch (err) {
        message.error(err?.response?.data?.message || 'Ошибка загрузки заказов');
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
              <Row gutter={[16, 16]}>
                {orders.map(order => {
                  const statusAlert = getStatusAlert(order.status);

                  return (
                    <Col key={order.id} xs={24} lg={12}>
                      <Card bordered={false} className="my-order-card">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text type="secondary">{order.facility_name || '—'}</Text>
                          <Text>Сумма: {formatCurrency(order.total_amount)}</Text>
                          <Text type="secondary">{formatDateTime(order.created_at)}</Text>
                          <Space wrap>
                            <Tag color={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Tag>
                            {order.courier_name ? <Tag color="blue">Курьер: {order.courier_name}</Tag> : null}
                          </Space>
                          {order.recipient_employee_name ? (
                            <Text type="secondary">Принял сотрудник: {order.recipient_employee_name}</Text>
                          ) : null}
                          <Steps
                            size="small"
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
                            <Text type="danger">{order.rejection_reason}</Text>
                          ) : null}
                        </Space>
                        <Table
                          className="my-order-items-table"
                          size="small"
                          pagination={false}
                          columns={itemColumns}
                          dataSource={order.items || []}
                          rowKey="id"
                        />
                      </Card>
                    </Col>
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
