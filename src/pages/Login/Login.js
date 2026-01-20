import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.scss';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData);
  };

  return (
    <div className="login-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Мой аккаунт</h1>
          <div className="breadcrumb">
            <span>Мой аккаунт</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="form-wrapper">
            <h2 className="form-title">Вход</h2>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  Имя пользователя или Email <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Пароль <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                  <button type="button" className="password-toggle">
                    <img src="/eye-icon.svg" alt="Показать пароль" />
                  </button>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span>Запомнить меня</span>
                </label>
              </div>

              <button type="submit" className="btn-submit">
                ВОЙТИ
              </button>

              <div className="form-footer">
                <Link to="/forgot-password" className="forgot-link">
                  Забыли свой пароль?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

