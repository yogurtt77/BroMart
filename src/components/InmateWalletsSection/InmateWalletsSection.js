import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency } from '../../utils/admin';
import './InmateWalletsSection.scss';

const { Title } = Typography;
const unwrapResponseData = payload => payload?.data ?? payload;
const formatAmountInput = value => String(value || '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const parseAmountInput = value => Number(String(value || '').replace(/\s/g, '')) || undefined;

const InmateWalletsSection = () => {
  const [form] = Form.useForm();
  const [wallets, setWallets] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const didLoadRef = useRef(false);

  const loadWallets = async () => {
    setFetching(true);

    try {
      const response = await apiClient.get('/api/v1/wallet/inmates');
      const walletsList = unwrapResponseData(response.data);
      setWallets(Array.isArray(walletsList) ? walletsList : []);
      setError('');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Ошибка загрузки счетов заключённых');
      setWallets([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadWallets();
  }, []);

  const handleSubmit = async values => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/wallet/top-up', {
        user_id: values.user_id,
        amount: values.amount
      });
      message.success(response.data.message);
      form.resetFields();
      setModalOpen(false);
      await loadWallets();
    } catch (requestError) {
      const nextError = requestError?.response?.data?.message || 'Ошибка пополнения счёта';
      message.error(nextError);
      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

  const inmateOptions = wallets.map(wallet => ({
    value: wallet.user_id,
    label: wallet.full_name
  }));

  return (
    <section className="inmate-wallets-section">
      <div className="wallets-header">
        <Title level={3} className="wallets-title">Счета заключённых</Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Пополнить счёт
        </Button>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="wallets-alert" /> : null}

      <Spin spinning={fetching}>
        <div className="wallets-table-card">
          <Table
            rowKey="user_id"
            dataSource={wallets}
            pagination={false}
            scroll={{ x: 1100 }}
            columns={[
              {
                title: 'ID',
                dataIndex: 'user_id',
                key: 'user_id',
                width: 140,
                render: value => `#${String(value).slice(0, 8)}`
              },
              {
                title: 'Заключённый',
                dataIndex: 'full_name',
                key: 'full_name'
              },
              {
                title: 'Учреждение',
                dataIndex: 'facility_name',
                key: 'facility_name',
                render: value => value || '—'
              },
              {
                title: 'Баланс',
                dataIndex: 'balance',
                key: 'balance',
                width: 160,
                render: value => formatCurrency(value)
              },
              {
                title: 'Потрачено за месяц',
                dataIndex: 'monthly_spent',
                key: 'monthly_spent',
                width: 190,
                render: value => formatCurrency(value)
              },
              {
                title: 'Лимит в месяц',
                dataIndex: 'monthly_limit',
                key: 'monthly_limit',
                width: 180,
                render: value => formatCurrency(value)
              }
            ]}
          />
        </div>
      </Spin>

      <Modal
        title="Пополнить счёт"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Пополнить счёт"
        cancelText="Отмена"
        confirmLoading={loading}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="admin-filter-grid">
            <Form.Item
              label="Заключённый"
              name="user_id"
              rules={[{ required: true, message: 'Выберите заключённого' }]}
            >
              <Select options={inmateOptions} placeholder="Выберите заключённого" />
            </Form.Item>

            <Form.Item
              label="Сумма пополнения"
              name="amount"
              rules={[{ required: true, message: 'Введите сумму пополнения' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="Введите сумму"
                formatter={formatAmountInput}
                parser={parseAmountInput}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </section>
  );
};

export default InmateWalletsSection;
