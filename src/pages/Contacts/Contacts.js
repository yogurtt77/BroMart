import React from 'react';
import './Contacts.scss';

const Contacts = () => {
  return (
    <div className="contacts-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Контакты</h1>
          <div className="breadcrumb">
            <span>Контакты</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="contacts-layout">
            <div className="contacts-card">
              <h2 className="section-title">Свяжитесь с нами</h2>
              <p className="subtitle">
                Данные указаны тестовые и используются только для демонстрации интерфейса.
              </p>

              <div className="contacts-list">
                <div className="contacts-item">
                  <span className="label">Телефон</span>
                  <span className="value">+7 (700) 000-00-00</span>
                </div>
                <div className="contacts-item">
                  <span className="label">Доп. телефон</span>
                  <span className="value">+7 (707) 111-11-11</span>
                </div>
                <div className="contacts-item">
                  <span className="label">Email</span>
                  <span className="value">info@bromart-test.kz</span>
                </div>
                <div className="contacts-item">
                  <span className="label">Адрес офиса</span>
                  <span className="value">
                    г. Астана, ул. Тестовая 1, Бизнес-центр &laquo;BROMART&raquo;
                  </span>
                </div>
                <div className="contacts-item">
                  <span className="label">График работы</span>
                  <span className="value">
                    Пн–Пт: 9:00–18:00
                    <br />
                    Сб–Вс: выходной
                  </span>
                </div>
              </div>
            </div>

            <div className="contacts-card contacts-info">
              <h2 className="section-title">Дополнительная информация</h2>
              <p>
                Служба поддержки работает в тестовом режиме. Вы можете использовать указанные
                контакты как пример для интеграции реальных данных в будущем.
              </p>
              <p>
                При переходе на боевой режим здесь можно разместить данные колл-центра, юридический
                адрес, реквизиты компании и ссылки на мессенджеры.
              </p>

              <div className="placeholder-map">
                <span>Здесь может быть карта или фотография офиса</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;

