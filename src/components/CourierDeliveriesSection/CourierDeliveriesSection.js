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
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';
import { formatOrderStatus, getOrderStatusColor } from '../../utils/orderStatus';

const { Title, Text } = Typography;

const TAB_STATUS_MAP = {
  ready: ['READY_FOR_SHIPMENT'],
  transit: ['OUT_FOR_DELIVERY', 'ARRIVED_AT_FACILITY'],
  completed: ['DELIVERED', 'FAILED_DELIVERY']
};

const CourierDeliveriesSection = () => {
  const [deliverForm] = Form.useForm();
  const [failForm] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ready');
  const [deliverOrder, setDeliverOrder] = useState(null);
  const [failOrder, setFailOrder] = useState(null);
  const didLoadRef = useRef(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/api/v1/orders');
      const list = unwrapResponseData(response.data);
      setOrders(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить доставки'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadOrders();
  }, [loadOrders]);

  const deliveries = useMemo(() => {
    const allowedStatuses = new Set(TAB_STATUS_MAP[activeTab] || []);
    return orders.filter(order => allowedStatuses.has(order.status));
  }, [activeTab, orders]);

  const updateDeliveryStatus = async (orderId, action, payload) => {
    setBusyId(orderId);
    setError('');

    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/${action}`, payload);
      message.success(response.data.message);
      await loadOrders();
    } catch (requestError) {
      const nextError = getApiErrorMessage(requestError, 'Не удалось обновить статус доставки');
      message.error(nextError);
      setError(nextError);
    } finally {
      setBusyId(null);
    }
  };

  const handleDepart = async orderId => {
    await updateDeliveryStatus(orderId, 'depart');
  };

  const handleArrive = async orderId => {
    await updateDeliveryStatus(orderId, 'arrive-at-facility');
  };

  const openDeliverModal = order => {
    setDeliverOrder(order);
    deliverForm.setFieldsValue({ recipient_employee_name: '' });
  };

  const handleDeliver = async values => {
    if (!deliverOrder) {
      return;
    }

    await updateDeliveryStatus(deliverOrder.id, 'deliver', {
      recipient_employee_name: values.recipient_employee_name
    });
    setDeliverOrder(null);
    deliverForm.resetFields();
  };

  const openFailModal = order => {
    setFailOrder(order);
    failForm.setFieldsValue({ reason: '' });
  };

  const handleFailDelivery = async values => {
    if (!failOrder) {
      return;
    }

    await updateDeliveryStatus(failOrder.id, 'fail-delivery', {
      reason: values.reason
    });
    setFailOrder(null);
    failForm.resetFields();
  };

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Мои доставки</Title>
          <Text className="admin-section-note">Заказы курьера по этапам доставки.</Text>
        </div>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="admin-alert" /> : null}

      <Card className="admin-table-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'ready', label: 'Готов к отправке' },
            { key: 'transit', label: 'В пути' },
            { key: 'completed', label: 'Завершенные' }
          ]}
        />
      </Card>

      <Spin spinning={loading}>
        {!deliveries.length ? (
          <Card className="admin-table-card">
            <Empty description="Доставок нет" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {deliveries.map(order => (
              <Col key={order.id} xs={24} xl={12}>
                <Card className="admin-card">
                  <Space direction="vertical" size={10} style={{ width: '100%' }}>
                    <Space wrap>
                      <Tag color={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Tag>
                      {order.courier_name ? <Tag color="blue">Курьер: {order.courier_name}</Tag> : null}
                    </Space>
                    <Text strong>{order.user_full_name || '—'}</Text>
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
                      {order.status === 'READY_FOR_SHIPMENT' ? (
                        <Button
                          type="primary"
                          loading={busyId === order.id}
                          onClick={() => handleDepart(order.id)}
                        >
                          Выехал
                        </Button>
                      ) : null}
                      {order.status === 'OUT_FOR_DELIVERY' ? (
                        <Button
                          type="primary"
                          loading={busyId === order.id}
                          onClick={() => handleArrive(order.id)}
                        >
                          Прибыл в учреждение
                        </Button>
                      ) : null}
                      {order.status === 'ARRIVED_AT_FACILITY' ? (
                        <Button
                          type="primary"
                          loading={busyId === order.id}
                          onClick={() => openDeliverModal(order)}
                        >
                          Передать
                        </Button>
                      ) : null}
                      {['READY_FOR_SHIPMENT', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_FACILITY'].includes(order.status) ? (
                        <Button danger loading={busyId === order.id} onClick={() => openFailModal(order)}>
                          Проблема с доставкой
                        </Button>
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
        title="Передать заказ"
        open={Boolean(deliverOrder)}
        onCancel={() => setDeliverOrder(null)}
        onOk={() => deliverForm.submit()}
        confirmLoading={busyId === deliverOrder?.id}
        destroyOnClose
      >
        <Form form={deliverForm} layout="vertical" onFinish={handleDeliver}>
          <Form.Item
            label="ФИО принимающего сотрудника"
            name="recipient_employee_name"
            rules={[{ required: true, message: 'Введите ФИО принимающего сотрудника' }]}
          >
            <Input placeholder="Введите ФИО" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Проблема с доставкой"
        open={Boolean(failOrder)}
        onCancel={() => setFailOrder(null)}
        onOk={() => failForm.submit()}
        confirmLoading={busyId === failOrder?.id}
        destroyOnClose
      >
        <Form form={failForm} layout="vertical" onFinish={handleFailDelivery}>
          <Form.Item
            label="Причина"
            name="reason"
            rules={[{ required: true, message: 'Введите причину' }]}
          >
            <Input.TextArea rows={4} placeholder="Введите причину" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default CourierDeliveriesSection;
