import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { saveAuthSession, startAuthRefreshScheduler } from '../../utils/auth';
import './AuthLogin.scss';

const { Title } = Typography;

const ADMIN_ROLES = ['SUPER_ADMIN', 'PRISON_ADMIN', 'WAREHOUSE_MANAGER', 'COURIER'];

const AuthLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const completeLogin = responseData => {
    const body = responseData;
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
      return;
    }

    navigate('/');
  };

  const handleSubmit = async values => {
    setLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        login: values.login,
        password: values.password
      });
      completeLogin(response.data);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-login-page">
      <div className="auth-login-shell">
        <Card className="auth-login-card" bordered={false}>
          <Title level={2} className="auth-login-title">
            Вход
          </Title>

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

            <Form.Item className="auth-login-submit">
              <Button type="primary" htmlType="submit" block loading={loading}>
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AuthLogin;
