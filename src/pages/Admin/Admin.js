import React, { useEffect, useMemo, useState } from 'react';
import FacilityForm from '../../components/FacilityForm/FacilityForm';
import PrisonAdminsSection from '../../components/PrisonAdminsSection/PrisonAdminsSection';
import InmateWalletsSection from '../../components/InmateWalletsSection/InmateWalletsSection';
import OrdersSection from '../../components/OrdersSection/OrdersSection';
import AdminProfileSection from '../../components/AdminProfileSection/AdminProfileSection';
import DashboardSection from '../../components/DashboardSection/DashboardSection';
import InventorySection from '../../components/InventorySection/InventorySection';
import FacilityAnalyticsSection from '../../components/FacilityAnalyticsSection/FacilityAnalyticsSection';
import InmatesManagementSection from '../../components/InmatesManagementSection/InmatesManagementSection';
import MonthlyLimitsSection from '../../components/MonthlyLimitsSection/MonthlyLimitsSection';
import AuditLogSection from '../../components/AuditLogSection/AuditLogSection';
import WarehouseOrdersSection from '../../components/WarehouseOrdersSection/WarehouseOrdersSection';
import CourierDeliveriesSection from '../../components/CourierDeliveriesSection/CourierDeliveriesSection';
import VendorsSection from '../../components/VendorsSection/VendorsSection';
import { getUserRole } from '../../utils/auth';
import './Admin.scss';

const ROLE_SECTIONS = {
  SUPER_ADMIN: {
    defaultSection: 'dashboard',
    navigation: [
      { id: 'dashboard', label: 'Панель управления' },
      { id: 'facility-analytics', label: 'Аналитика по учреждениям' },
      { id: 'inmates', label: 'Управление заключёнными' },
      { id: 'monthly-limits', label: 'Месячные лимиты' },
      { id: 'audit-log', label: 'Журнал аудита' },
      { id: 'prison-admins', label: 'Сотрудники' },
      { id: 'facility', label: 'Учреждения' }
    ],
    components: {
      dashboard: DashboardSection,
      inventory: InventorySection,
      'facility-analytics': FacilityAnalyticsSection,
      inmates: InmatesManagementSection,
      'monthly-limits': MonthlyLimitsSection,
      'audit-log': AuditLogSection,
      'prison-admins': PrisonAdminsSection,
      facility: FacilityForm
    }
  },
  PRISON_ADMIN: {
    defaultSection: 'orders',
    navigation: [
      { id: 'orders', label: 'Заказы учреждения' },
      { id: 'inmate-wallets', label: 'Кошельки заключённых' },
      { id: 'profile', label: 'Заключённые' }
    ],
    components: {
      orders: OrdersSection,
      'inmate-wallets': InmateWalletsSection,
      profile: AdminProfileSection
    }
  },
  WAREHOUSE_MANAGER: {
    defaultSection: 'inventory',
    navigation: [
      { id: 'warehouse-orders', label: 'Заказы склада' },
      { id: 'inventory', label: 'Каталог и склад' },
      { id: 'vendors', label: 'Поставщики' }
    ],
    components: {
      'warehouse-orders': WarehouseOrdersSection,
      inventory: InventorySection,
      vendors: VendorsSection
    }
  },
  COURIER: {
    defaultSection: 'courier-deliveries',
    navigation: [
      { id: 'courier-deliveries', label: 'Мои доставки' }
    ],
    components: {
      'courier-deliveries': CourierDeliveriesSection
    }
  }
};

const Admin = () => {
  const role = getUserRole();
  const roleConfig = useMemo(() => ROLE_SECTIONS[role] || ROLE_SECTIONS.PRISON_ADMIN, [role]);
  const navigationItems = roleConfig.navigation;
  const sectionComponents = roleConfig.components;
  const [activeSection, setActiveSection] = useState(roleConfig.defaultSection);

  useEffect(() => {
    setActiveSection(roleConfig.defaultSection);
  }, [roleConfig]);

  const ActiveSectionComponent =
    sectionComponents[activeSection] || sectionComponents[roleConfig.defaultSection];

  return (
    <div className="admin-page">
      <div className="content-section">
        <div className="container">
          <div className="admin-layout">
            <aside className="admin-sidebar">
              <h2 className="sidebar-title">Навигация</h2>
              <ul className="sidebar-menu">
                {navigationItems.map(item => (
                  <li
                    key={item.id}
                    className={`sidebar-item ${activeSection === item.id ? 'sidebar-item--active' : ''}`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </aside>

            <main className="admin-main">
              {ActiveSectionComponent ? <ActiveSectionComponent /> : null}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
