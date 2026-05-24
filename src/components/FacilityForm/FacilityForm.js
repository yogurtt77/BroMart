import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Input, Modal, Row, Select, Spin, Table, Tag, Typography, message } from 'antd';
import './FacilityForm.scss';
import apiClient from '../../utils/apiClient';
import { formatDateTime } from '../../utils/admin';

const unwrapResponseData = payload => payload?.data ?? payload;
const { Title } = Typography;

const FacilityForm = () => {
  const [form] = Form.useForm();
  const [facilities, setFacilities] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const didLoadFacilitiesRef = useRef(false);

  const fetchFacilities = async () => {
    setFetching(true);

    try {
      const response = await apiClient.get('/api/v1/facilities');
      const facilitiesList = unwrapResponseData(response.data);
      setFacilities(Array.isArray(facilitiesList) ? facilitiesList : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Не удалось загрузить учреждения');
      setFacilities([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (didLoadFacilitiesRef.current) {
      return;
    }

    didLoadFacilitiesRef.current = true;
    fetchFacilities();
  }, []);

  const handleSubmit = async values => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/facilities', values);
      message.success(response.data.message);
      const newFacility = unwrapResponseData(response.data);
      setFacilities(prev => [...prev, newFacility]);
      form.resetFields();
      setModalOpen(false);
    } catch (requestError) {
      const nextError = requestError?.response?.data?.message || 'Не удалось создать учреждение';
      message.error(nextError);
      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="facility-form">
      <div className="facility-header">
        <Title level={3} className="facility-title">Учреждения</Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Создать
        </Button>
      </div>

      {error ? <Alert type="error" message={error} showIcon className="facility-alert" /> : null}

      <Spin spinning={fetching}>
        <div className="facilities-table-card">
          <Table
            rowKey="id"
            dataSource={facilities}
            pagination={false}
            scroll={{ x: 1000 }}
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 150,
                render: value => `#${String(value).slice(0, 8)}`
              },
              {
                title: 'Название',
                dataIndex: 'name',
                key: 'name'
              },
              {
                title: 'Код',
                dataIndex: 'code',
                key: 'code',
                width: 140
              },
              {
                title: 'Адрес',
                dataIndex: 'address',
                key: 'address'
              },
              {
                title: 'Статус',
                dataIndex: 'is_active',
                key: 'is_active',
                width: 140,
                render: value => (
                  <Tag color={value ? 'green' : 'red'}>
                    {value ? 'Активно' : 'Неактивно'}
                  </Tag>
                )
              },
              {
                title: 'Дата создания',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 180,
                render: value => formatDateTime(value)
              }
            ]}
          />
        </div>
      </Spin>

      <Modal
        title="Создать учреждение"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Создать учреждение"
        cancelText="Отмена"
        confirmLoading={loading}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Название"
                name="name"
                rules={[{ required: true, message: 'Введите название учреждения' }]}
              >
                <Input placeholder="Введите название учреждения" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Код"
                name="code"
                rules={[{ required: true, message: 'Введите код учреждения' }]}
              >
                <Input placeholder="Введите код учреждения" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Адрес"
                name="address"
                rules={[{ required: true, message: 'Введите адрес учреждения' }]}
              >
                <Input placeholder="Введите адрес учреждения" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Режим безопасности"
                name="security_regime"
                rules={[{ required: true, message: 'Выберите режим безопасности' }]}
              >
                <Select placeholder="Выберите режим безопасности">
                  <Select.Option value="GENERAL">Обычный</Select.Option>
                  <Select.Option value="STRICT">Строгий</Select.Option>
                  <Select.Option value="MAXIMUM">Максимальный</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </section>
  );
};

export default FacilityForm;
