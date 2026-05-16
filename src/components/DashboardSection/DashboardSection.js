import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
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

const INITIAL_FILTERS = {
  date_from: '',
  date_to: '',
  group_by: 'day'
};

const DashboardSection = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [spendingTrend, setSpendingTrend] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topFacilities, setTopFacilities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const didLoadRef = useRef(false);
  const didSyncFiltersRef = useRef(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      group_by: filters.group_by
    };

    if (filters.date_from) {
      params.date_from = filters.date_from;
    }

    if (filters.date_to) {
      params.date_to = filters.date_to;
    }

    try {
      const [
        summaryResponse,
        trendResponse,
        statusResponse,
        topProductsResponse,
        topFacilitiesResponse,
        recentOrdersResponse,
        lowStockResponse
      ] = await Promise.all([
        apiClient.get('/api/v1/admin/dashboard/summary'),
        apiClient.get('/api/v1/admin/dashboard/spending-trend', { params }),
        apiClient.get('/api/v1/admin/dashboard/orders-by-status'),
        apiClient.get('/api/v1/admin/dashboard/top-products', { params: { ...params, limit: 5 } }),
        apiClient.get('/api/v1/admin/dashboard/top-facilities', {
          params: { ...params, limit: 5 }
        }),
        apiClient.get('/api/v1/admin/dashboard/recent-orders', { params: { ...params, limit: 5 } }),
        apiClient.get('/api/v1/admin/dashboard/low-stock-products', {
          params: { threshold: 10, limit: 5 }
        })
      ]);

      setSummary(unwrapResponseData(summaryResponse.data));
      setSpendingTrend(unwrapResponseData(trendResponse.data));
      setOrdersByStatus(unwrapResponseData(statusResponse.data));
      setTopProducts(unwrapResponseData(topProductsResponse.data));
      setTopFacilities(unwrapResponseData(topFacilitiesResponse.data));
      setRecentOrders(unwrapResponseData(recentOrdersResponse.data));
      setLowStockProducts(unwrapResponseData(lowStockResponse.data));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось загрузить панель управления'));
    } finally {
      setLoading(false);
    }
  }, [filters.date_from, filters.date_to, filters.group_by]);

  useEffect(() => {
    if (didLoadRef.current) {
      return;
    }

    didLoadRef.current = true;
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!didLoadRef.current) {
      return;
    }

    if (!didSyncFiltersRef.current) {
      didSyncFiltersRef.current = true;
      return;
    }

    loadDashboard();
  }, [filters.date_from, filters.date_to, filters.group_by, loadDashboard]);

  const maxTrendAmount = Math.max(...spendingTrend.map(item => Number(item.total_amount || 0)), 0);
  const maxStatusCount = Math.max(...ordersByStatus.map(item => Number(item.count || 0)), 0);
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <Title level={3} className="admin-section-title">
            Панель управления
          </Title>
          <Text className="admin-section-note">
            Сводные показатели, расходы, статусы и оперативная сводка.
          </Text>
        </div>
        <Space wrap className="admin-toolbar">
          <Input
            type="date"
            value={filters.date_from}
            onChange={event => setFilters(prev => ({ ...prev, date_from: event.target.value }))}
          />
          <Input
            type="date"
            value={filters.date_to}
            onChange={event => setFilters(prev => ({ ...prev, date_to: event.target.value }))}
          />
          <Select
            value={filters.group_by}
            onChange={value => setFilters(prev => ({ ...prev, group_by: value }))}
            options={GROUP_BY_OPTIONS}
            style={{ width: 170 }}
          />
          <Button onClick={handleResetFilters}>Сбросить</Button>
        </Space>
      </div>

      {error && <Alert type="error" message={error} showIcon className="admin-alert" />}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="admin-stats-grid">
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic
                title="Общая сумма заказов"
                value={formatCurrency(summary?.total_revenue)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic title="Количество заказов" value={formatNumber(summary?.orders_count)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic
                title="Активные заключённые"
                value={formatNumber(summary?.active_inmates)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic title="Ожидающие заказы" value={formatNumber(summary?.pending_orders)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <Card className="admin-stat-card">
              <Statistic
                title="Товары с низким остатком"
                value={formatNumber(summary?.low_stock_products_count)}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="admin-split-grid" style={{ marginTop: '20px' }}>
          <Col xs={24} xl={14}>
            <Card className="admin-table-card" title="Динамика расходов">
              {spendingTrend.length ? (
                <div className="admin-chart-list">
                  {spendingTrend.map(item => (
                    <div className="admin-chart-row" key={item.period}>
                      <div className="admin-chart-meta">
                        <span>{item.period}</span>
                        <strong>{formatCurrency(item.total_amount)}</strong>
                      </div>
                      <div className="admin-chart-bar">
                        <div
                          className="admin-chart-bar-fill"
                          style={{ width: `${getPercent(item.total_amount, maxTrendAmount)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Нет данных для графика" />
              )}
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card className="admin-table-card" title="Статусы заказов">
              {ordersByStatus.length ? (
                <div className="admin-chart-list">
                  {ordersByStatus.map(item => (
                    <div className="admin-chart-row" key={item.status}>
                      <div className="admin-chart-meta">
                        <span>{formatOrderStatus(item.status)}</span>
                        <Tag>{formatNumber(item.count)}</Tag>
                      </div>
                      <div className="admin-chart-bar">
                        <div
                          className="admin-chart-bar-fill admin-chart-bar-fill--secondary"
                          style={{ width: `${getPercent(item.count, maxStatusCount)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Нет данных по статусам" />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xxl={12}>
            <Card className="admin-table-card" title="Топ товаров" style={{ marginTop: '20px' }}>
              <Table
                rowKey="product_id"
                dataSource={topProducts}
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
          </Col>
          <Col xs={24} xxl={12}>
            <Card className="admin-table-card" title="Топ учреждений" style={{ marginTop: '20px' }}>
              <Table
                rowKey="facility_id"
                dataSource={topFacilities}
                pagination={false}
                locale={{ emptyText: 'Нет данных' }}
                columns={[
                  { title: 'Учреждение', dataIndex: 'facility_name', key: 'facility_name' },
                  {
                    title: 'Заказов',
                    dataIndex: 'orders_count',
                    key: 'orders_count',
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
          </Col>
          <Col xs={24} xxl={12}>
            <Card className="admin-table-card" title="Последние заказы">
              <Table
                rowKey="order_id"
                dataSource={recentOrders}
                pagination={false}
                locale={{ emptyText: 'Нет данных' }}
                columns={[
                  { title: 'Заключённый', dataIndex: 'inmate_name', key: 'inmate_name' },
                  { title: 'Учреждение', dataIndex: 'facility_name', key: 'facility_name' },
                  {
                    title: 'Сумма',
                    dataIndex: 'total_amount',
                    key: 'total_amount',
                    render: value => formatCurrency(value)
                  },
                  {
                    title: 'Статус',
                    dataIndex: 'status',
                    key: 'status',
                    render: value => <Tag>{formatOrderStatus(value)}</Tag>
                  },
                  {
                    title: 'Дата',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    render: value => formatDateTime(value)
                  }
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xxl={12}>
            <Card className="admin-table-card" title="Товары с низким остатком">
              <Table
                rowKey="product_id"
                dataSource={lowStockProducts}
                pagination={false}
                locale={{ emptyText: 'Нет данных' }}
                columns={[
                  { title: 'Товар', dataIndex: 'product_name', key: 'product_name' },
                  { title: 'Учреждение', dataIndex: 'facility_name', key: 'facility_name' },
                  {
                    title: 'Остаток',
                    dataIndex: 'stock_quantity',
                    key: 'stock_quantity',
                    render: value => formatNumber(value)
                  },
                  {
                    title: 'Цена',
                    dataIndex: 'price',
                    key: 'price',
                    render: value => formatCurrency(value)
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </section>
  );
};

export default DashboardSection;
