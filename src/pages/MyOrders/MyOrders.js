import React, { useEffect, useRef, useState } from 'react';
import { Card, Col, Empty, Row, Space, Spin, Table, Tag, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import './MyOrders.scss';

const { Title, Text } = Typography;

const unwrapData = payload => payload?.data ?? payload;

const statusColor = status => {
  if (status === 'PENDING') return 'gold';
  if (status === 'APPROVED') return 'green';
  return 'red';
};

const itemColumns = [
  { title: 'Товар', dataIndex: 'product_name', key: 'product_name' },
  { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity', width: 90 },
  {
    title: 'Цена',
    dataIndex: 'unit_price',
    key: 'unit_price',
    width: 120,
    render: v => `${Number(v).toLocaleString('ru-RU')} ₸`
  },
  {
    title: 'Сумма',
    dataIndex: 'subtotal',
    key: 'subtotal',
    width: 120,
    render: v => `${Number(v).toLocaleString('ru-RU')} ₸`
  }
];

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
        const res = await apiClient.get('/api/v1/orders');
        const list = unwrapData(res.data);
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
          <Title level={1} className="page-title">
            Мои заказы
          </Title>
          <Text type="secondary" className="my-orders-breadcrumb">
            Мои заказы
          </Text>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Spin spinning={loading}>
            {!loading && orders.length === 0 ? (
              <Empty description="Заказов пока нет" />
            ) : (
              <Row gutter={[16, 16]}>
                {orders.map(order => (
                  <Col key={order.id} xs={24} lg={12}>
                    <Card bordered={false} className="my-order-card">
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text type="secondary">{order.facility_name}</Text>
                        <Text>Сумма: {Number(order.total_amount).toLocaleString('ru-RU')} ₸</Text>
                        <Text type="secondary">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString('ru-RU')
                            : ''}
                        </Text>
                        <Tag color={statusColor(order.status)}>{order.status}</Tag>
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
                ))}
              </Row>
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
