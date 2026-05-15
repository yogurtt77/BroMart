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
import { getUserRole } from '../../utils/auth';
import './Admin.scss';

const SUPER_ADMIN_NAVIGATION = [
  { id: 'dashboard', label: 'Панель управления' },
  { id: 'inventory', label: 'Управление складом' },
  { id: 'facility-analytics', label: 'Аналитика по учреждениям' },
  { id: 'inmates', label: 'Управление заключёнными' },
  { id: 'monthly-limits', label: 'Месячные лимиты' },
  { id: 'audit-log', label: 'Журнал аудита' },
  { id: 'prison-admins', label: 'Начальники учреждений' },
  { id: 'facility', label: 'Учреждения' }
];

const PRISON_ADMIN_NAVIGATION = [
  { id: 'orders', label: 'Список заказов' },
  { id: 'inmate-wallets', label: 'Счета заключённых' },
  { id: 'profile', label: 'Заключённые' }
];

const SUPER_ADMIN_COMPONENTS = {
  dashboard: DashboardSection,
  inventory: InventorySection,
  'facility-analytics': FacilityAnalyticsSection,
  inmates: InmatesManagementSection,
  'monthly-limits': MonthlyLimitsSection,
  'audit-log': AuditLogSection,
  'prison-admins': PrisonAdminsSection,
  facility: FacilityForm
};

const PRISON_ADMIN_COMPONENTS = {
  orders: OrdersSection,
  'inmate-wallets': InmateWalletsSection,
  profile: AdminProfileSection
};

const Admin = () => {
  const role = getUserRole();

  const navigationItems = useMemo(() => (
    role === 'SUPER_ADMIN' ? SUPER_ADMIN_NAVIGATION : PRISON_ADMIN_NAVIGATION
  ), [role]);

  const sectionComponents = useMemo(() => (
    role === 'SUPER_ADMIN' ? SUPER_ADMIN_COMPONENTS : PRISON_ADMIN_COMPONENTS
  ), [role]);

  const [activeSection, setActiveSection] = useState(navigationItems[0]?.id || '');

  useEffect(() => {
    setActiveSection(navigationItems[0]?.id || '');
  }, [navigationItems]);

  const ActiveSectionComponent = sectionComponents[activeSection] || sectionComponents[navigationItems[0]?.id];

  return (
    <div className="admin-page">
      <div className="content-section">
        <div className="container">
          <div className="admin-layout">
            <aside className="admin-sidebar">
              <h2 className="sidebar-title">Навигация</h2>
              <ul className="sidebar-menu">
                {navigationItems.map((item) => (
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
