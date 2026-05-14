import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Modal, Space, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { saveAuthSession, startAuthRefreshScheduler } from '../../utils/auth';
import './Login.scss';

const { Title } = Typography;

const ADMIN_ROLES = ['SUPER_ADMIN', 'PRISON_ADMIN'];

const faceFrameMetrics = canvas => {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const { data } = ctx.getImageData(0, 0, w, h);
  const step = 4;
  let sumL = 0;
  let n = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      sumL += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      n++;
    }
  }
  const client_brightness = n ? sumL / n / 255 : 0;
  const gray = (xi, yi) => {
    const i = (yi * w + xi) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
  let lapSum = 0;
  let lapSumSq = 0;
  let m = 0;
  for (let y = 1; y < h - 1; y += 2) {
    for (let x = 1; x < w - 1; x += 2) {
      const L = 4 * gray(x, y) - gray(x - 1, y) - gray(x + 1, y) - gray(x, y - 1) - gray(x, y + 1);
      lapSum += L;
      lapSumSq += L * L;
      m++;
    }
  }
  const mean = m ? lapSum / m : 0;
  const client_blur_score = m ? lapSumSq / m - mean * mean : 0;
  return { client_brightness, client_blur_score };
};

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

    let videoElement = videoRef.current;

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      streamRef.current = stream;
      const el = videoRef.current;
      if (el) {
        el.srcObject = stream;
        videoElement = el;
      }
    });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [faceModalOpen]);

  const handleFaceCapture = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const { client_brightness, client_blur_score } = faceFrameMetrics(canvas);
    let client_face_count = '';
    let face_bbox = '';
    if ('FaceDetector' in window) {
      try {
        const faces = await new window.FaceDetector({ maxDetectedFaces: 5 }).detect(canvas);
        client_face_count = String(faces.length);
        if (faces[0]) {
          const b = faces[0].boundingBox;
          face_bbox = JSON.stringify({ x: b.x, y: b.y, width: b.width, height: b.height });
        }
      } catch {}
    }

    canvas.toBlob(async blob => {
      setFaceLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      formData.append('capture_width', String(canvas.width));
      formData.append('capture_height', String(canvas.height));
      formData.append('client_face_count', client_face_count);
      formData.append('client_blur_score', String(client_blur_score));
      formData.append('client_brightness', String(client_brightness));
      formData.append('face_bbox', face_bbox);
      console.log('[POST /api/v1/auth/face-login]', {
        file: { name: 'face.jpg', size: blob.size, type: blob.type },
        capture_width: canvas.width,
        capture_height: canvas.height,
        client_face_count: client_face_count || '(empty)',
        client_blur_score,
        client_brightness,
        face_bbox: face_bbox || '(empty)',
        faceDetectorUsed: Boolean('FaceDetector' in window)
      });
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
