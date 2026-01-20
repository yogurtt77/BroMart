import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    login: '',
    fullName: '',
    institution: '',
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
    console.log('Register:', formData);
  };

  return (
    <div className="register-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Регистрация</h1>
          <div className="breadcrumb">
            <span>Регистрация</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label className="form-label">
                  Логин <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="login"
                  placeholder="Логин на латинице"
                  value={formData.login}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  ФИО <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="ФИО"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Ваше учреждение <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="institution"
                  placeholder="Ваше учреждение"
                  value={formData.institution}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
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
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  РЕГИСТРАЦИЯ
                </button>
                <Link to="/login" className="btn-login">
                  Войти
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

