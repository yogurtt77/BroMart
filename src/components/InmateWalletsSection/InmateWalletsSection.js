import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputNumber, Row, Select, Space, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import './InmateWalletsSection.scss';

const { Title, Text } = Typography;
const unwrapResponseData = (payload) => payload?.data ?? payload;

const InmateWalletsSection = () => {
  const [form] = Form.useForm();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await apiClient.get('/api/v1/wallet/inmates');
      const walletsList = unwrapResponseData(response.data);
      setWallets(Array.isArray(walletsList) ? walletsList : []);
    } catch (err) {
      setError('Ошибка загрузки счетов заключённых');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/api/v1/wallet/top-up', {
        user_id: values.user_id,
        amount: values.amount
      });
      form.resetFields();
      await loadWallets();
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка пополнения счёта');
    } finally {
      setLoading(false);
    }
  };

  const inmateOptions = wallets.map((wallet) => ({
    value: wallet.user_id,
    label: wallet.full_name
  }));

  return (
    <section className="inmate-wallets-section">
      <Title level={3} className="wallets-title">Счета заключённых</Title>

      {error && <Alert type="error" message={error} showIcon className="wallets-alert" />}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Заключённый"
              name="user_id"
              rules={[{ required: true, message: 'Выберите заключённого' }]}
            >
              <Select options={inmateOptions} placeholder="Выберите заключённого" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Сумма пополнения"
              name="amount"
              rules={[{ required: true, message: 'Введите сумму пополнения' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Введите сумму" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="wallets-submit-wrap">
          <Button type="primary" htmlType="submit" loading={loading}>
            ПОПОЛНИТЬ СЧЁТ
          </Button>
        </Form.Item>
      </Form>

      <div className="wallets-list">
        <Title level={4}>Список счетов</Title>
        <Row gutter={[16, 16]}>
          {wallets.map((wallet) => (
            <Col key={wallet.user_id} xs={24} sm={12} lg={8}>
              <Card size="small" hoverable>
                <Space direction="vertical" size={4}>
                  <Text strong>{wallet.full_name}</Text>
                  <Text type="secondary">Учреждение: {wallet.facility_name}</Text>
                  <Text>Баланс: {wallet.balance}</Text>
                  <Text type="secondary">Потрачено за месяц: {wallet.monthly_spent}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default InmateWalletsSection;
