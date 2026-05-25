import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import {
  formatCurrency,
  formatDateTime,
  getApiErrorMessage,
  unwrapResponseData
} from '../../utils/admin';
import { formatOrderStatus, getOrderStatusColor } from '../../utils/orderStatus';
import './CourierDeliveriesSection.scss';

const { Title, Text } = Typography;

const TAB_STATUS_MAP = {
  ready: ['READY_FOR_SHIPMENT'],
  transit: ['OUT_FOR_DELIVERY', 'ARRIVED_AT_FACILITY'],
  completed: ['DELIVERED', 'FAILED_DELIVERY']
};

const TAB_TITLES = {
  ready: 'Готов к отправке',
  transit: 'В пути',
  completed: 'Завершенные'
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

  const tabItems = useMemo(
    () =>
      Object.keys(TAB_STATUS_MAP).map(key => ({
        key,
        label: (
          <span className="courier-deliveries-section__tab-label">
            <span>{TAB_TITLES[key]}</span>
            <span className="courier-deliveries-section__tab-count">
              {orders.filter(order => TAB_STATUS_MAP[key].includes(order.status)).length}
            </span>
          </span>
        )
      })),
    [orders]
  );

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
    <section className="admin-section courier-deliveries-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Мои доставки</Title>
          <Text className="admin-section-note">Заказы курьера по этапам доставки.</Text>
        </div>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="admin-alert" /> : null}

      <Card className="admin-table-card courier-deliveries-section__tabs-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="courier-deliveries-section__tabs"
        />
      </Card>

      <Spin spinning={loading}>
        <Card className="admin-table-card">
          {!deliveries.length ? (
            <Empty description="Доставок нет" />
          ) : (
            <Table
              rowKey="id"
              dataSource={deliveries}
              pagination={false}
              scroll={{ x: 1120 }}
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
                  width: 210
                },
                {
                  title: 'Учреждение',
                  dataIndex: 'facility_name',
                  key: 'facility_name',
                  width: 220
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
                  title: 'Принял',
                  dataIndex: 'recipient_employee_name',
                  key: 'recipient_employee_name',
                  width: 190,
                  render: value => value || '—'
                },
                {
                  title: 'Действия',
                  key: 'actions',
                  width: 260,
                  render: (_, record) => (
                    <Space wrap>
                      {record.status === 'READY_FOR_SHIPMENT' ? (
                        <Button
                          type="primary"
                          loading={busyId === record.id}
                          onClick={() => handleDepart(record.id)}
                        >
                          Выехал
                        </Button>
                      ) : null}
                      {record.status === 'OUT_FOR_DELIVERY' ? (
                        <Button
                          type="primary"
                          loading={busyId === record.id}
                          onClick={() => handleArrive(record.id)}
                        >
                          Прибыл
                        </Button>
                      ) : null}
                      {record.status === 'ARRIVED_AT_FACILITY' ? (
                        <Button
                          type="primary"
                          loading={busyId === record.id}
                          onClick={() => openDeliverModal(record)}
                        >
                          Передать
                        </Button>
                      ) : null}
                      {['READY_FOR_SHIPMENT', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_FACILITY'].includes(
                        record.status
                      ) ? (
                        <Button
                          danger
                          loading={busyId === record.id}
                          onClick={() => openFailModal(record)}
                        >
                          Проблема
                        </Button>
                      ) : null}
                    </Space>
                  )
                }
              ]}
              expandable={{
                expandedRowRender: record => (
                  <div className="courier-deliveries-section__expanded">
                    <div className="courier-deliveries-section__expanded-meta">
                      {record.courier_name ? <Text>Курьер: {record.courier_name}</Text> : null}
                      {record.recipient_employee_name ? (
                        <Text>Принял: {record.recipient_employee_name}</Text>
                      ) : null}
                      {record.rejection_reason ? (
                        <Text type="danger">Причина: {record.rejection_reason}</Text>
                      ) : null}
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
            />
          )}
        </Card>
      </Spin>

      <Modal
        title="Передать заказ"
        open={Boolean(deliverOrder)}
        onCancel={() => setDeliverOrder(null)}
        onOk={() => deliverForm.submit()}
        confirmLoading={busyId === deliverOrder?.id}
        destroyOnClose
        okText="Сохранить"
        cancelText="Отмена"
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
        okText="Сохранить"
        cancelText="Отмена"
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
