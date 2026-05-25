import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckOutlined,
  EditOutlined,
  StopOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { getApiErrorMessage, unwrapResponseData } from '../../utils/admin';

const { Title, Text } = Typography;

const normalizeUploadValue = event => {
  if (Array.isArray(event)) {
    return event;
  }

  return event?.fileList || [];
};

const VendorsSection = () => {
  const [vendorForm] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState('');
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const didLoadRef = useRef(false);
  const watchedFileList = Form.useWatch('file', vendorForm);
  const fileList = useMemo(() => watchedFileList || [], [watchedFileList]);

  useEffect(() => {
    const file = fileList[0]?.originFileObj;

    if (!file) {
      setUploadPreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [fileList]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [vendorsResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/api/v1/catalog/vendors', {
          params: { is_active: showActive }
        }),
        apiClient.get('/api/v1/catalog/categories')
      ]);

      setVendors(unwrapResponseData(vendorsResponse.data));
      setCategories(unwrapResponseData(categoriesResponse.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить поставщиков'));
    } finally {
      setLoading(false);
    }
  }, [showActive]);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!didLoadRef.current) {
      return;
    }

    loadData();
  }, [loadData]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingVendor(null);
    setUploadPreviewUrl('');
    setCurrentLogoUrl('');
    vendorForm.resetFields();
  };

  const openCreateModal = () => {
    setEditingVendor(null);
    setUploadPreviewUrl('');
    setCurrentLogoUrl('');
    vendorForm.resetFields();
    setModalOpen(true);
  };

  const openEditModal = record => {
    setEditingVendor(record);
    setUploadPreviewUrl('');
    setCurrentLogoUrl(record.logo_url || '');
    vendorForm.setFieldsValue({
      code: record.code,
      name: record.name,
      category_id: record.category_id,
      sort_order: record.sort_order,
      file: []
    });
    setModalOpen(true);
  };

  const handleSave = async values => {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('code', values.code);
      formData.append('name', values.name);

      if (values.category_id) {
        formData.append('category_id', values.category_id);
      }

      if (values.sort_order !== undefined && values.sort_order !== null) {
        formData.append('sort_order', String(values.sort_order));
      }

      const file = values.file?.[0]?.originFileObj;

      if (file) {
        formData.append('file', file);
      }

      let response;

      if (editingVendor) {
        response = await apiClient.patch(`/api/v1/catalog/vendors/${editingVendor.id}`, formData);
      } else {
        response = await apiClient.post('/api/v1/catalog/vendors', formData);
      }

      message.success(response.data.message);
      closeModal();
      await loadData();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось сохранить поставщика'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async record => {
    try {
      const formData = new FormData();
      formData.append('code', record.code);
      formData.append('name', record.name);

      if (record.category_id) {
        formData.append('category_id', record.category_id);
      }

      if (record.sort_order !== undefined && record.sort_order !== null) {
        formData.append('sort_order', String(record.sort_order));
      }

      formData.append('is_active', String(!record.is_active));

      const response = await apiClient.patch(`/api/v1/catalog/vendors/${record.id}`, formData);
      message.success(response.data.message);
      await loadData();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось обновить статус поставщика'));
    }
  };

  const categoryOptions = categories.map(item => ({
    value: item.id,
    label: item.name
  }));

  const modalTitle = editingVendor ? 'Редактировать поставщика' : 'Новый поставщик';

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Поставщики</Title>
          <Text className="admin-section-note">
            Список поставщиков, управление статусом и загрузка логотипа.
          </Text>
        </div>
        <Space wrap>
          <Space>
            <Text>{showActive ? 'Активные' : 'Неактивные'}</Text>
            <Switch checked={showActive} onChange={setShowActive} />
          </Space>
          <Button type="primary" onClick={openCreateModal}>
            Добавить поставщика
          </Button>
        </Space>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Spin spinning={loading}>
        <div className="admin-table-card ant-card ant-card-bordered">
          <div className="ant-card-body">
            <Table
              rowKey="id"
              dataSource={vendors}
              locale={{ emptyText: 'Нет поставщиков' }}
              pagination={false}
              columns={[
                {
                  title: 'Логотип',
                  dataIndex: 'logo_url',
                  key: 'logo_url',
                  width: 96,
                  render: value => (
                    value ? (
                      <Image
                        src={value}
                        alt="logo"
                        width={56}
                        height={56}
                        className="vendor-logo-image"
                        preview={false}
                      />
                    ) : (
                      <div className="vendor-logo-placeholder">Нет</div>
                    )
                  )
                },
                {
                  title: 'Название',
                  dataIndex: 'name',
                  key: 'name'
                },
                {
                  title: 'Код',
                  dataIndex: 'code',
                  key: 'code'
                },
                {
                  title: 'Категория',
                  dataIndex: 'category_name',
                  key: 'category_name',
                  render: value => value || '—'
                },
                {
                  title: 'Порядок сортировки',
                  dataIndex: 'sort_order',
                  key: 'sort_order',
                  render: value => value ?? '—'
                },
                {
                  title: 'Статус',
                  dataIndex: 'is_active',
                  key: 'is_active',
                  render: value => (
                    <Tag color={value ? 'green' : 'default'}>
                      {value ? 'Активен' : 'Неактивен'}
                    </Tag>
                  )
                },
                {
                  title: 'Действия',
                  key: 'actions',
                  width: 140,
                  render: (_, record) => (
                    <Space direction="vertical" size={8}>
                      <Button
                        className="admin-action-button admin-action-button--neutral"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => openEditModal(record)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        className={`admin-action-button ${
                          record.is_active
                            ? 'admin-action-button--danger'
                            : 'admin-action-button--success'
                        }`}
                        icon={record.is_active ? <StopOutlined /> : <CheckOutlined />}
                        size="small"
                        onClick={() => handleToggleActive(record)}
                      >
                        {record.is_active ? 'Деактивировать' : 'Активировать'}
                      </Button>
                    </Space>
                  )
                }
              ]}
            />
          </div>
        </div>
      </Spin>

      <Modal
        title={modalTitle}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => vendorForm.submit()}
        confirmLoading={saving}
        width={920}
        className="vendor-modal"
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
      >
        <Form form={vendorForm} layout="vertical" onFinish={handleSave}>
          <div className="vendor-form">
            <div className="vendor-form__fields">
              <div className="admin-filter-grid">
                <Form.Item
                  label="Код"
                  name="code"
                  rules={[{ required: true, message: 'Введите код поставщика' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Название"
                  name="name"
                  rules={[{ required: true, message: 'Введите название поставщика' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Категория" name="category_id">
                  <Select
                    allowClear
                    options={categoryOptions}
                    placeholder="Выберите категорию"
                  />
                </Form.Item>
                <Form.Item label="Порядок сортировки" name="sort_order">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </div>

            <div className="vendor-form__upload">
              <Form.Item
                label="Логотип"
                name="file"
                valuePropName="fileList"
                getValueFromEvent={normalizeUploadValue}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={false}
                  className="vendor-form__uploader"
                >
                  <div className="vendor-form__upload-box">
                    {uploadPreviewUrl ? (
                      <img src={uploadPreviewUrl} alt="preview" />
                    ) : currentLogoUrl ? (
                      <img src={currentLogoUrl} alt="preview" />
                    ) : (
                      <div className="vendor-form__upload-placeholder">
                        <UploadOutlined />
                        <span>Перетащите логотип сюда</span>
                        <small>или нажмите кнопку ниже</small>
                      </div>
                    )}
                  </div>
                  <Button
                    type="primary"
                    className="vendor-form__upload-button"
                    icon={<UploadOutlined />}
                  >
                    Выбрать файл
                  </Button>
                  <div className="vendor-form__upload-hint">
                    jpg, png, webp
                  </div>
                </Upload>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </section>
  );
};

export default VendorsSection;
