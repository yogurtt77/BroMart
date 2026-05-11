import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Modal, Space, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { saveAuthSession, startAuthRefreshScheduler } from '../../utils/auth';
import './Login.scss';

const { Title } = Typography;

const ADMIN_ROLES = ['SUPER_ADMIN', 'PRISON_ADMIN'];

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceModalOpen, setFaceModalOpen] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
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
    setFaceModalOpen(false);
    if (ADMIN_ROLES.includes(userRole)) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (!faceModalOpen) return undefined;

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [faceModalOpen]);

  const handleFaceCapture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async blob => {
      setFaceLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      try {
        const response = await apiClient.post('/api/v1/auth/face-login', formData);
        const body = response.data;
        message.info(body.message);
        completeLogin(body);
      } catch (err) {
        message.error(err?.response?.data?.message);
      } finally {
        setFaceLoading(false);
      }
    }, 'image/jpeg');
  };

  const handleSubmit = async values => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        login: values.login,
        password: values.password
      });
      completeLogin(response.data);
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
            <Title level={2} className="form-title">
              Вход
            </Title>

            {error && <Alert type="error" message={error} showIcon className="login-alert" />}

            <Modal
              title="Вход по Face ID"
              open={faceModalOpen}
              onCancel={() => setFaceModalOpen(false)}
              destroyOnClose
              width="min(700px, 64vw)"
              centered
              footer={
                <Space>
                  <Button onClick={() => setFaceModalOpen(false)}>Отмена</Button>
                  <Button type="primary" onClick={handleFaceCapture} loading={faceLoading}>
                    Сделать снимок
                  </Button>
                </Space>
              }
            >
              <p className="login-face-modal-hint">Разрешите доступ к камере в браузере.</p>
              <div className="login-face-stage">
                <video ref={videoRef} className="login-face-video" autoPlay playsInline muted />
                <div className="login-face-oval" aria-hidden />
              </div>
            </Modal>

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
