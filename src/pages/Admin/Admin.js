import React, { useMemo, useState } from 'react';
import FacilityForm from '../../components/FacilityForm/FacilityForm';
import AdminProfileSection from '../../components/AdminProfileSection/AdminProfileSection';
import PrisonAdminsSection from '../../components/PrisonAdminsSection/PrisonAdminsSection';
import InmateWalletsSection from '../../components/InmateWalletsSection/InmateWalletsSection';
import OrdersSection from '../../components/OrdersSection/OrdersSection';
import './Admin.scss';

const Admin = () => {
  const [activeSection, setActiveSection] = useState('prison-admins');

  const navigationItems = useMemo(
    () => [
      { id: 'prison-admins', label: 'Начальники учреждений' },
      { id: 'inmate-wallets', label: 'Счета заключенных' },
      { id: 'orders', label: 'Список заказов' },
      { id: 'facility', label: 'Учреждений' },
      { id: 'profile', label: 'Заключённые' }
    ],
    []
  );

  const sectionComponents = {
    'prison-admins': PrisonAdminsSection,
    'inmate-wallets': InmateWalletsSection,
    orders: OrdersSection,
    facility: FacilityForm,
    profile: AdminProfileSection
  };

  const ActiveSectionComponent = sectionComponents[activeSection] || AdminProfileSection;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <span>Админ-панель</span>
          </div>
        </div>
      </div>

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
              <ActiveSectionComponent />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

