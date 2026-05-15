import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import apiClient from '../../utils/apiClient';
import { formatCurrency, formatDateTime, getApiErrorMessage, unwrapResponseData } from '../../utils/admin';

const { Title, Text } = Typography;

const ACTIVE_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'true', label: 'Активные' },
  { value: 'false', label: 'Неактивные' }
];

const SORT_OPTIONS = [
  { value: 'desc', label: 'Сначала новые' },
  { value: 'asc', label: 'Сначала старые' }
];

const InventorySection = () => {
  const [filterForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [modalVendors, setModalVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stockSaving, setStockSaving] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category_id: undefined,
    facility_id: undefined,
    vendor_id: undefined,
    name: '',
    is_active: 'all',
    sort: 'desc',
    page: 1,
    pageSize: 10,
    lowStockOnly: false,
    threshold: 10
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const didLoadReferencesRef = useRef(false);
  const didLoadProductsRef = useRef(false);
  const didSyncFiltersRef = useRef(false);

  const loadReferences = async () => {
    try {
      const [categoriesResponse, facilitiesResponse] = await Promise.all([
        apiClient.get('/api/v1/catalog/categories'),
        apiClient.get('/api/v1/facilities')
      ]);

      setCategories(unwrapResponseData(categoriesResponse.data));
      setFacilities(unwrapResponseData(facilitiesResponse.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить справочники склада'));
    }
  };

  const loadVendors = async (categoryId, target = 'filters') => {
    if (!categoryId) {
      if (target === 'filters') {
        setVendors([]);
      } else {
        setModalVendors([]);
      }
      return;
    }

    try {
      const response = await apiClient.get('/api/v1/catalog/vendors', {
        params: { category_id: categoryId }
      });
      const list = unwrapResponseData(response.data);
      if (target === 'filters') {
        setVendors(list);
      } else {
        setModalVendors(list);
      }
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось загрузить поставщиков'));
    }
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (filters.lowStockOnly) {
        const response = await apiClient.get('/api/v1/catalog/products/low-stock', {
          params: {
            threshold: filters.threshold,
            limit: 100
          }
        });
        const list = unwrapResponseData(response.data);
        setProducts(list);
        setPagination({
          current: 1,
          pageSize: 100,
          total: list.length
        });
      } else {
        const params = {
          sort: filters.sort,
          skip: (filters.page - 1) * filters.pageSize,
          limit: filters.pageSize
        };

        if (filters.category_id) {
          params.category_id = filters.category_id;
        }

        if (filters.facility_id) {
          params.facility_id = filters.facility_id;
        }

        if (filters.vendor_id) {
          params.vendor_id = filters.vendor_id;
        }

        if (filters.name) {
          params.name = filters.name;
        }

        if (filters.is_active !== 'all') {
          params.is_active = filters.is_active === 'true';
        }

        const response = await apiClient.get('/api/v1/catalog/products', { params });
        const list = unwrapResponseData(response.data);
        setProducts(list);
        setPagination((prev) => ({
          ...prev,
          current: filters.page,
          pageSize: filters.pageSize,
          total: list.length < filters.pageSize ? (filters.page - 1) * filters.pageSize + list.length : filters.page * filters.pageSize + 1
        }));
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить товары'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (didLoadReferencesRef.current) {
      return;
    }

    didLoadReferencesRef.current = true;
    loadReferences();
  }, []);

  useEffect(() => {
    if (didLoadProductsRef.current) {
      return;
    }

    didLoadProductsRef.current = true;
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!didLoadProductsRef.current) {
      return;
    }

    if (!didSyncFiltersRef.current) {
      didSyncFiltersRef.current = true;
      return;
    }

    loadProducts();
  }, [filters, loadProducts]);

  const handleFilterFinish = (values) => {
    setFilters((prev) => ({
      ...prev,
      category_id: values.category_id,
      facility_id: values.facility_id,
      vendor_id: values.vendor_id,
      name: values.name || '',
      is_active: values.is_active || 'all',
      sort: values.sort || 'desc',
      page: 1
    }));
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setVendors([]);
    setFilters({
      category_id: undefined,
      facility_id: undefined,
      vendor_id: undefined,
      name: '',
      is_active: 'all',
      sort: 'desc',
      page: 1,
      pageSize: 10,
      lowStockOnly: false,
      threshold: 10
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalVendors([]);
    productForm.resetFields();
    productForm.setFieldsValue({ is_active: true });
    setProductModalOpen(true);
  };

  const openEditModal = async (record) => {
    setEditingProduct(record);
    await loadVendors(record.category_id, 'modal');
    productForm.setFieldsValue({
      name: record.name,
      description: record.description,
      category_id: record.category_id,
      facility_id: record.facility_id,
      vendor_id: record.vendor_id,
      price: record.price,
      stock_quantity: record.stock_quantity,
      image_url: record.image_url,
      is_active: record.is_active
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (values) => {
    setSaving(true);

    try {
      const request = editingProduct
        ? apiClient.patch(`/api/v1/catalog/products/${editingProduct.id}`, values)
        : apiClient.post('/api/v1/catalog/products', values);

      const response = await request;
      message.success(response.data.message);
      setProductModalOpen(false);
      productForm.resetFields();
      await loadProducts();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось сохранить товар'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (productId) => {
    try {
      const response = await apiClient.delete(`/api/v1/catalog/products/${productId}`);
      message.success(response.data.message);
      await loadProducts();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось деактивировать товар'));
    }
  };

  const openStockModal = (record) => {
    setStockProduct(record);
    stockForm.setFieldsValue({
      stock_quantity: record.stock_quantity,
      reason: ''
    });
    setStockModalOpen(true);
  };

  const handleUpdateStock = async (values) => {
    setStockSaving(true);

    try {
      const response = await apiClient.patch(`/api/v1/catalog/products/${stockProduct.id}/stock`, values);
      message.success(response.data.message);
      setStockModalOpen(false);
      stockForm.resetFields();
      await loadProducts();
    } catch (requestError) {
      message.error(getApiErrorMessage(requestError, 'Не удалось обновить остаток'));
    } finally {
      setStockSaving(false);
    }
  };

  const categoryOptions = categories.map((item) => ({ value: item.id, label: item.name }));
  const facilityOptions = facilities.map((item) => ({ value: item.id, label: item.name }));
  const vendorOptions = vendors.map((item) => ({ value: item.id, label: item.name }));
  const modalVendorOptions = modalVendors.map((item) => ({ value: item.id, label: item.name }));

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">Управление складом</Title>
          <Text className="admin-section-note">Список товаров, фильтры, создание, редактирование и обновление остатков.</Text>
        </div>
        <Space wrap>
          <Space>
            <Text>Только низкий остаток</Text>
            <Switch
              checked={filters.lowStockOnly}
              onChange={(checked) => setFilters((prev) => ({ ...prev, lowStockOnly: checked, page: 1 }))}
            />
          </Space>
          <InputNumber
            min={1}
            value={filters.threshold}
            onChange={(value) => setFilters((prev) => ({ ...prev, threshold: value || 10 }))}
            addonBefore="Порог"
          />
          <Button type="primary" onClick={openCreateModal}>Создать товар</Button>
        </Space>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Card className="admin-table-card">
        <Form form={filterForm} layout="vertical" onFinish={handleFilterFinish}>
          <div className="admin-filter-grid">
            <Form.Item label="Категория" name="category_id">
              <Select
                allowClear
                options={categoryOptions}
                onChange={(value) => {
                  filterForm.setFieldValue('vendor_id', undefined);
                  loadVendors(value, 'filters');
                }}
              />
            </Form.Item>
            <Form.Item label="Учреждение" name="facility_id">
              <Select allowClear options={facilityOptions} />
            </Form.Item>
            <Form.Item label="Поставщик" name="vendor_id">
              <Select allowClear options={vendorOptions} />
            </Form.Item>
            <Form.Item label="Название" name="name">
              <Input placeholder="Поиск по названию" />
            </Form.Item>
            <Form.Item label="Статус" name="is_active" initialValue="all">
              <Select options={ACTIVE_OPTIONS} />
            </Form.Item>
            <Form.Item label="Сортировка" name="sort" initialValue="desc">
              <Select options={SORT_OPTIONS} />
            </Form.Item>
          </div>
          <Space>
            <Button type="primary" htmlType="submit">Применить</Button>
            <Button onClick={handleResetFilters}>Сбросить</Button>
          </Space>
        </Form>
      </Card>

      <Spin spinning={loading}>
        <Card className="admin-table-card">
          <Table
            rowKey="id"
            dataSource={products}
            locale={{ emptyText: 'Нет товаров' }}
            pagination={filters.lowStockOnly ? false : {
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setFilters((prev) => ({
                  ...prev,
                  page,
                  pageSize
                }));
              }
            }}
            columns={[
              { title: 'Название', dataIndex: 'name', key: 'name' },
              { title: 'Категория', dataIndex: 'category_name', key: 'category_name' },
              { title: 'Учреждение', dataIndex: 'facility_name', key: 'facility_name' },
              { title: 'Поставщик', dataIndex: 'vendor_name', key: 'vendor_name' },
              {
                title: 'Цена',
                dataIndex: 'price',
                key: 'price',
                render: (value) => formatCurrency(value)
              },
              {
                title: 'Остаток',
                dataIndex: 'stock_quantity',
                key: 'stock_quantity'
              },
              {
                title: 'Статус',
                dataIndex: 'is_active',
                key: 'is_active',
                render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Активен' : 'Неактивен'}</Tag>
              },
              {
                title: 'Обновлён',
                dataIndex: 'updated_at',
                key: 'updated_at',
                render: (value) => formatDateTime(value)
              },
              {
                title: 'Действия',
                key: 'actions',
                render: (_, record) => (
                  <Space wrap>
                    <Button type="link" onClick={() => openEditModal(record)}>Редактировать</Button>
                    <Button type="link" onClick={() => openStockModal(record)}>Остаток</Button>
                    <Popconfirm
                      title="Деактивировать товар?"
                      okText="Да"
                      cancelText="Нет"
                      onConfirm={() => handleDeactivate(record.id)}
                    >
                      <Button type="link" danger>Деактивировать</Button>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      </Spin>

      <Modal
        title={editingProduct ? 'Редактирование товара' : 'Создание товара'}
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        onOk={() => productForm.submit()}
        confirmLoading={saving}
        width={760}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={productForm} layout="vertical" onFinish={handleSaveProduct}>
          <div className="admin-filter-grid">
            <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название товара' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Категория" name="category_id" rules={[{ required: true, message: 'Выберите категорию' }]}>
              <Select
                options={categoryOptions}
                onChange={(value) => {
                  productForm.setFieldValue('vendor_id', undefined);
                  loadVendors(value, 'modal');
                }}
              />
            </Form.Item>
            <Form.Item label="Учреждение" name="facility_id" rules={[{ required: true, message: 'Выберите учреждение' }]}>
              <Select options={facilityOptions} />
            </Form.Item>
            <Form.Item label="Поставщик" name="vendor_id" rules={[{ required: true, message: 'Выберите поставщика' }]}>
              <Select options={modalVendorOptions} />
            </Form.Item>
            <Form.Item label="Цена" name="price" rules={[{ required: true, message: 'Введите цену' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Остаток" name="stock_quantity" rules={[{ required: true, message: 'Введите остаток' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Ссылка на изображение" name="image_url">
              <Input />
            </Form.Item>
            <Form.Item label="Активен" name="is_active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item label="Описание" name="description" rules={[{ required: true, message: 'Введите описание' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={stockProduct ? `Остаток: ${stockProduct.name}` : 'Изменение остатка'}
        open={stockModalOpen}
        onCancel={() => setStockModalOpen(false)}
        onOk={() => stockForm.submit()}
        confirmLoading={stockSaving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={stockForm} layout="vertical" onFinish={handleUpdateStock}>
          <Form.Item
            label="Количество на складе"
            name="stock_quantity"
            rules={[{ required: true, message: 'Введите новое количество' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Причина" name="reason" rules={[{ required: true, message: 'Введите причину' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
};

export default InventorySection;
