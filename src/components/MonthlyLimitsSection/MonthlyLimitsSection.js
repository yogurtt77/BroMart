import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, InputNumber, Modal, Space, Spin, Table, Tag, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import {
  formatCurrency,
  formatSecurityRegime,
  getApiErrorMessage,
  unwrapResponseData
} from '../../utils/admin';

const { Title, Text } = Typography;

const MonthlyLimitsSection = () => {
  const [form] = Form.useForm();
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingLimit, setEditingLimit] = useState(null);
  const didLoadRef = useRef(false);

  const loadLimits = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/api/v1/wallet/monthly-limits/by-security-regime');
      setLimits(unwrapResponseData(response.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить месячные лимиты'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadLimits();
  }, []);

  const openEditModal = (record) => {
    setEditingLimit(record);
    form.setFieldsValue({
      security_regime: record.security_regime,
      monthly_limit: record.monthly_limit
    });
  };

  const handleSubmit = async (values) => {
    setSaving(true);

    try {
      const response = await apiClient.patch('/api/v1/wallet/monthly-limits/by-security-regime', {
        security_regime: editingLimit.security_regime,
        monthly_limit: values.monthly_limit
      });
      message.success(response.data.message);
      setEditingLimit(null);
      form.resetFields();
      await loadLimits();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось обновить лимит'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Месячные лимиты по режимам</Title>
          <Text className="admin-section-note">Управление лимитами для всех заключённых по типу режима.</Text>
        </div>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Spin spinning={loading}>
        <Card className="admin-table-card">
          <Table
            rowKey="security_regime"
            dataSource={limits}
            pagination={false}
            locale={{ emptyText: 'Нет данных' }}
            columns={[
              {
                title: 'Режим',
                dataIndex: 'security_regime',
                key: 'security_regime',
                render: (value) => <Tag color="blue">{formatSecurityRegime(value)}</Tag>
              },
              {
                title: 'Лимит',
                dataIndex: 'monthly_limit',
                key: 'monthly_limit',
                render: (value) => formatCurrency(value)
              },
              {
                title: 'Действие',
                key: 'actions',
                render: (_, record) => (
                  <Button type="link" onClick={() => openEditModal(record)}>
                    Изменить
                  </Button>
                )
              }
            ]}
          />
        </Card>
      </Spin>

      <Modal
        title="Редактирование лимита"
        open={Boolean(editingLimit)}
        onCancel={() => setEditingLimit(null)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Режим">
            <Space>
              <Tag color="blue">{formatSecurityRegime(editingLimit?.security_regime)}</Tag>
            </Space>
          </Form.Item>
          <Form.Item
            label="Месячный лимит"
            name="monthly_limit"
            rules={[{ required: true, message: 'Введите месячный лимит' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default MonthlyLimitsSection;
