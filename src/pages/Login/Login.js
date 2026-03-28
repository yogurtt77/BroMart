import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import apiClient from '../../utils/apiClient';
import { saveAuthSession, startAuthRefreshScheduler } from '../../utils/auth';
import './Login.scss';

const { Title } = Typography;

const ADMIN_ROLES = ['SUPER_ADMIN', 'PRISON_ADMIN'];

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        login: values.login,
        password: values.password
      });
      const body = response.data;
      const data = body.data || body;
      const userRole = data.user_role || body.user_role;
      saveAuthSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        user_role: userRole
      });
      startAuthRefreshScheduler();
      form.resetFields();

      if (ADMIN_ROLES.includes(userRole)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
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
          <Card className="form-wrapper" bordered={false}>
            <Title level={2} className="form-title">Вход</Title>

            {error && <Alert type="error" message={error} showIcon className="login-alert" />}

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Логин"
                name="login"
                rules={[{ required: true, message: 'Введите логин' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: 'Введите пароль' }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item className="login-submit-wrap">
                <Button type="primary" htmlType="submit" block loading={loading}>
                  ВОЙТИ
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
