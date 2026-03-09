import React from 'react';
import './Admin.scss';

const Admin = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Кабинет родственника</h1>
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
                <li className="sidebar-item sidebar-item--active">Пополнить счёт</li>
                <li className="sidebar-item">История пополнений</li>
                <li className="sidebar-item">Профиль заключённого</li>
              </ul>
            </aside>

            <main className="admin-main">
              <section className="admin-card">
                <h2 className="admin-card-title">Баланс заключённого</h2>
                <p className="admin-card-balance">Текущий баланс: 0 ₸</p>
                <p className="admin-card-note">
                  Здесь в будущем будет отображаться реальный баланс счёта и данные по лимитам.
                </p>
              </section>

              <section className="admin-card">
                <h2 className="admin-card-title">Пополнить счёт</h2>
                <p className="admin-card-note">
                  Форма ниже демонстрационная. Логика оплаты и проверки данных будет добавлена
                  позднее.
                </p>

                <div className="admin-topup-grid">
                  <div className="admin-topup-field">
                    <span className="label">ФИО заключённого</span>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Введите ФИО заключённого"
                    />
                  </div>
                  <div className="admin-topup-field">
                    <span className="label">Учреждение</span>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Введите учреждение"
                    />
                  </div>
                  <div className="admin-topup-field">
                    <span className="label">Сумма пополнения</span>
                    <input
                      type="number"
                      className="admin-input"
                      placeholder="Введите сумму, ₸"
                    />
                  </div>
                </div>

                <button className="admin-topup-button">Пополнить счёт (макет)</button>
              </section>

              <section className="admin-card">
                <h2 className="admin-card-title">Краткая история</h2>
                <p className="admin-card-note">
                  Здесь можно будет вывести последние пополнения, статусы платежей и комментарии.
                </p>
                <div className="admin-history-placeholder">
                  Таблица истории пополнений (пока только заглушка).
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

