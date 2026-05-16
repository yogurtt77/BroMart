import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import apiClient from '../../utils/apiClient';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatOrderStatus,
  getApiErrorMessage,
  getPercent,
  unwrapResponseData
} from '../../utils/admin';

const { Title, Text } = Typography;

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'По дням' },
  { value: 'week', label: 'По неделям' },
  { value: 'month', label: 'По месяцам' }
];

const FacilityAnalyticsSection = () => {
  const [facilities, setFacilities] = useState([]);
  const [filters, setFilters] = useState({
    facility_id: undefined,
    date_from: '',
    date_to: '',
    group_by: 'month'
  });
  const [summary, setSummary] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [spendingChart, setSpendingChart] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityDetails, setFacilityDetails] = useState(null);
  const [facilityTopProducts, setFacilityTopProducts] = useState([]);
  const [facilityOrders, setFacilityOrders] = useState([]);
  const [facilityOrdersLoading, setFacilityOrdersLoading] = useState(false);
  const [facilityOrdersFilters, setFacilityOrdersFilters] = useState({
    status: undefined,
    page: 1,
    pageSize: 10
  });
  const didLoadFacilitiesRef = useRef(false);
  const didLoadAnalyticsRef = useRef(false);
  const didSyncFiltersRef = useRef(false);

  const loadFacilities = async () => {
    const response = await apiClient.get('/api/v1/facilities');
    setFacilities(unwrapResponseData(response.data));
  };

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      group_by: filters.group_by
    };

    if (filters.facility_id) {
      params.facility_id = filters.facility_id;
    }

    if (filters.date_from) {
      params.date_from = filters.date_from;
    }

    if (filters.date_to) {
      params.date_to = filters.date_to;
    }

    try {
      const [summaryResponse, tableResponse, spendingResponse, trendResponse] = await Promise.all([
        apiClient.get('/api/v1/admin/facilities/analytics/summary'),
        apiClient.get('/api/v1/admin/facilities/analytics/table'),
        apiClient.get('/api/v1/admin/facilities/analytics/spending-chart'),
        apiClient.get('/api/v1/admin/facilities/analytics/trend', { params })
      ]);

      setSummary(unwrapResponseData(summaryResponse.data));
      setTableData(unwrapResponseData(tableResponse.data));
      setSpendingChart(unwrapResponseData(spendingResponse.data));
      setTrendData(unwrapResponseData(trendResponse.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить аналитику по учреждениям'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (didLoadFacilitiesRef.current) {
      return;
    }

    didLoadFacilitiesRef.current = true;

    const initialize = async () => {
      try {
        await loadFacilities();
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Не удалось загрузить учреждения'));
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (didLoadAnalyticsRef.current) {
      return;
    }

    didLoadAnalyticsRef.current = true;
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!didLoadAnalyticsRef.current) {
      return;
    }

    if (!didSyncFiltersRef.current) {
      didSyncFiltersRef.current = true;
      return;
    }

    loadAnalytics();
  }, [filters, loadAnalytics]);

  const loadFacilityDetails = async (facilityId, options = facilityOrdersFilters) => {
    setFacilityOrdersLoading(true);

    const ordersParams = {
      skip: (options.page - 1) * options.pageSize,
      limit: options.pageSize
    };

    if (options.status) {
      ordersParams.status = options.status;
    }

    try {
      const [detailsResponse, topProductsResponse, ordersResponse] = await Promise.all([
        apiClient.get(`/api/v1/admin/facilities/${facilityId}/analytics`),
        apiClient.get(`/api/v1/admin/facilities/${facilityId}/top-products`),
        apiClient.get(`/api/v1/admin/facilities/${facilityId}/orders`, { params: ordersParams })
      ]);

      setFacilityDetails(unwrapResponseData(detailsResponse.data));
      setFacilityTopProducts(unwrapResponseData(topProductsResponse.data));
      setFacilityOrders(unwrapResponseData(ordersResponse.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить детали учреждения'));
    } finally {
      setFacilityOrdersLoading(false);
    }
  };

  const openDrawer = async record => {
    setSelectedFacility(record);
    setDrawerOpen(true);
    await loadFacilityDetails(record.facility_id, {
      status: undefined,
      page: 1,
      pageSize: 10
    });
  };

  const maxFacilitySpending = Math.max(
    ...spendingChart.map(item => Number(item.total_amount || 0)),
    0
  );
  const maxTrendAmount = Math.max(...trendData.map(item => Number(item.total_amount || 0)), 0);

  const facilityOptions = facilities.map(item => ({
    value: item.id,
    label: item.name
  }));

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">
            Аналитика по учреждениям
          </Title>
          <Text className="admin-section-note">
            Сводные показатели, таблицы и детализация по каждому учреждению.
          </Text>
        </div>
        <Space wrap className="admin-toolbar">
          <Select
            allowClear
            placeholder="Учреждение"
            options={facilityOptions}
            style={{ width: 220 }}
            onChange={value => setFilters(prev => ({ ...prev, facility_id: value }))}
          />
          <Input
            addonBefore="Дата от"
            type="date"
            value={filters.date_from}
            onChange={event => setFilters(prev => ({ ...prev, date_from: event.target.value }))}
          />
          <Input
            addonBefore="Дата до"
            type="date"
            value={filters.date_to}
            onChange={event => setFilters(prev => ({ ...prev, date_to: event.target.value }))}
          />
          <Select
            value={filters.group_by}
            options={GROUP_BY_OPTIONS}
            style={{ width: 170 }}
            onChange={value => setFilters(prev => ({ ...prev, group_by: value }))}
          />
        </Space>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="admin-stats-grid">
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic title="Общие расходы" value={formatCurrency(summary?.total_spent)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic
                title="Учреждения с заказами"
                value={formatNumber(summary?.facilities_with_orders)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic
                title="Средний чек"
                value={formatCurrency(summary?.average_order_amount)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic title="Топ учреждение" value={summary?.top_facility_name || '—'} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="admin-split-grid" style={{ marginTop: 20 }}>
          <Col xs={24} xl={12}>
            <Card className="admin-table-card" title="Расходы по учреждениям">
              {spendingChart.length ? (
                <div className="admin-chart-list">
                  {spendingChart.map(item => (
                    <div className="admin-chart-row" key={item.facility_id}>
                      <div className="admin-chart-meta">
                        <span>{item.facility_name}</span>
                        <strong>{formatCurrency(item.total_amount)}</strong>
                      </div>
                      <div className="admin-chart-bar">
                        <div
                          className="admin-chart-bar-fill"
                          style={{
                            width: `${getPercent(item.total_amount, maxFacilitySpending)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Нет данных" />
              )}
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card className="admin-table-card" title="Тренд расходов">
              {trendData.length ? (
                <div className="admin-chart-list">
                  {trendData.map(item => (
                    <div className="admin-chart-row" key={item.period}>
                      <div className="admin-chart-meta">
                        <span>{item.period}</span>
                        <strong>{formatCurrency(item.total_amount)}</strong>
                      </div>
                      <div className="admin-chart-bar">
                        <div
                          className="admin-chart-bar-fill admin-chart-bar-fill--secondary"
                          style={{ width: `${getPercent(item.total_amount, maxTrendAmount)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Нет данных" />
              )}
            </Card>
          </Col>
        </Row>

        <Card className="admin-table-card" title="Таблица по учреждениям" style={{ marginTop: 20 }}>
          <Table
            rowKey="facility_id"
            dataSource={tableData}
            locale={{ emptyText: 'Нет данных' }}
            columns={[
              { title: 'Учреждение', dataIndex: 'facility_name', key: 'facility_name' },
              {
                title: 'Расходы',
                dataIndex: 'total_spent',
                key: 'total_spent',
                render: value => formatCurrency(value)
              },
              {
                title: 'Заказов',
                dataIndex: 'orders_count',
                key: 'orders_count',
                render: value => formatNumber(value)
              },
              {
                title: 'Средний чек',
                dataIndex: 'average_order_amount',
                key: 'average_order_amount',
                render: value => formatCurrency(value)
              },
              {
                title: 'Активные заключённые',
                dataIndex: 'active_inmates',
                key: 'active_inmates',
                render: value => formatNumber(value)
              },
              { title: 'Топ товар', dataIndex: 'top_product', key: 'top_product' },
              { title: 'Топ категория', dataIndex: 'top_category', key: 'top_category' },
              {
                title: 'Детали',
                key: 'actions',
                render: (_, record) => (
                  <Button type="link" onClick={() => openDrawer(record)}>
                    Открыть
                  </Button>
                )
              }
            ]}
          />
        </Card>
      </Spin>

      <Drawer
        title={
          selectedFacility ? `Учреждение: ${selectedFacility.facility_name}` : 'Детали учреждения'
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={920}
      >
        <Spin spinning={facilityOrdersLoading}>
          <Descriptions bordered column={2} size="small" className="admin-descriptions">
            <Descriptions.Item label="Учреждение">
              {facilityDetails?.facility_name || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Расходы">
              {formatCurrency(facilityDetails?.total_spent)}
            </Descriptions.Item>
            <Descriptions.Item label="Заказов">
              {formatNumber(facilityDetails?.orders_count)}
            </Descriptions.Item>
            <Descriptions.Item label="Средний чек">
              {formatCurrency(facilityDetails?.average_order_amount)}
            </Descriptions.Item>
            <Descriptions.Item label="Активные заключённые">
              {formatNumber(facilityDetails?.active_inmates)}
            </Descriptions.Item>
            <Descriptions.Item label="Ожидающие заказы">
              {formatNumber(facilityDetails?.pending_orders)}
            </Descriptions.Item>
          </Descriptions>

          <Card className="admin-table-card" title="Топ товаров" style={{ marginTop: 16 }}>
            <Table
              rowKey="product_id"
              dataSource={facilityTopProducts}
              pagination={false}
              locale={{ emptyText: 'Нет данных' }}
              columns={[
                { title: 'Товар', dataIndex: 'product_name', key: 'product_name' },
                {
                  title: 'Количество',
                  dataIndex: 'total_quantity',
                  key: 'total_quantity',
                  render: value => formatNumber(value)
                },
                {
                  title: 'Сумма',
                  dataIndex: 'total_amount',
                  key: 'total_amount',
                  render: value => formatCurrency(value)
                }
              ]}
            />
          </Card>

          <Card className="admin-table-card" title="Заказы" style={{ marginTop: 16 }}>
            <Space wrap className="admin-toolbar">
              <Select
                allowClear
                placeholder="Статус"
                style={{ width: 180 }}
                options={[
                  { value: 'PENDING', label: 'Ожидает' },
                  { value: 'APPROVED', label: 'Одобрен' },
                  { value: 'REJECTED', label: 'Отклонён' }
                ]}
                onChange={value => {
                  const next = { ...facilityOrdersFilters, status: value, page: 1 };
                  setFacilityOrdersFilters(next);
                  loadFacilityDetails(selectedFacility.facility_id, next);
                }}
              />
            </Space>
            <Table
              rowKey="id"
              dataSource={facilityOrders}
              locale={{ emptyText: 'Нет данных' }}
              pagination={{
                current: facilityOrdersFilters.page,
                pageSize: facilityOrdersFilters.pageSize,
                total:
                  facilityOrders.length < facilityOrdersFilters.pageSize
                    ? (facilityOrdersFilters.page - 1) * facilityOrdersFilters.pageSize +
                      facilityOrders.length
                    : facilityOrdersFilters.page * facilityOrdersFilters.pageSize + 1,
                onChange: (page, pageSize) => {
                  const next = { ...facilityOrdersFilters, page, pageSize };
                  setFacilityOrdersFilters(next);
                  loadFacilityDetails(selectedFacility.facility_id, next);
                }
              }}
              columns={[
                { title: 'Заключённый', dataIndex: 'user_full_name', key: 'user_full_name' },
                {
                  title: 'Статус',
                  dataIndex: 'status',
                  key: 'status',
                  render: value => <Tag>{formatOrderStatus(value)}</Tag>
                },
                {
                  title: 'Сумма',
                  dataIndex: 'total_amount',
                  key: 'total_amount',
                  render: value => formatCurrency(value)
                },
                {
                  title: 'Дата',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: value => formatDateTime(value)
                }
              ]}
              expandable={{
                expandedRowRender: record => (
                  <div className="admin-order-items">
                    {(record.items || []).map(item => (
                      <div key={item.id} className="admin-order-item-row">
                        <span>{item.product_name}</span>
                        <span>{item.quantity} шт.</span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          </Card>
        </Spin>
      </Drawer>
    </section>
  );
};

export default FacilityAnalyticsSection;
