import React, { useState } from 'react';
import './AdminSign.scss';

const AdminSign = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    console.log('Admin sign in (mock):', formData);
  };

  return (
    <div className="admin-sign-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Вход для родственников</h1>
          <div className="breadcrumb">
            <span>Админ-панель / Вход</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="form-wrapper">
            <h2 className="form-title">Авторизация</h2>
            <p className="form-subtitle">
              Здесь авторизуются родственники и близкие заключённых, чтобы пополнять счёт.
            </p>

            <form onSubmit={handleSubmit} className="admin-sign-form">
              <div className="form-group">
                <label className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Пароль <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn-submit">
                ВОЙТИ В АДМИНКУ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSign;

