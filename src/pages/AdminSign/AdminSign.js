import React, { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import './AdminSign.scss';
import apiClient from '../../utils/apiClient';
import { saveAuthSession, startAuthRefreshScheduler } from '../../utils/auth';

const { Title, Paragraph } = Typography;

const AdminSign = () => {
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
      const responseBody = response.data;
      saveAuthSession(responseBody.data || responseBody);
      startAuthRefreshScheduler();
      form.resetFields();
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
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
          <Card className="form-wrapper" bordered={false}>
            <Title level={2} className="form-title">Авторизация</Title>
            <Paragraph className="form-subtitle">
              Здесь авторизуются родственники и близкие заключённых, чтобы пополнять счёт.
            </Paragraph>

            {error && <Alert type="error" message={error} showIcon className="error-message" />}

            <Form form={form} layout="vertical" className="admin-sign-form" onFinish={handleSubmit}>
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

              <Form.Item className="submit-wrap">
                <Button type="primary" htmlType="submit" block loading={loading}>
                  ВОЙТИ В АДМИНКУ
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSign;

