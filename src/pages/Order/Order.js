import React, { useState } from 'react';
import './Order.scss';

const Order = () => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    institution: 'Учреждение 57',
    productRequest: '',
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order by request:', formData);
  };

  return (
    <div className="order-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Заказ по запросу</h1>
          <div className="breadcrumb">
            <span>Заказ по запросу</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="form-wrapper">
            <h2 className="form-title">Форма заказа по индивидуальному запросу</h2>

            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Фамилия получателя"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Имя получателя"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Отчество получателя"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <select
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Учреждение 57">Учреждение 57</option>
                    <option value="Учреждение 58">Учреждение 58 (тестовое)</option>
                    <option value="Учреждение 59">Учреждение 59 (тестовое)</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Контактный телефон (тестовый)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (тестовый)"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <textarea
                  name="productRequest"
                  placeholder="Опишите, какие товары вы хотите заказать, желаемое количество и дополнительные пожелания"
                  value={formData.productRequest}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-submit">
                ОТПРАВИТЬ ЗАПРОС
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;

