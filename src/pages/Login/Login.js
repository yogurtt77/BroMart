import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Modal, Space, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { saveAuthSession, startAuthRefreshScheduler } from '../../utils/auth';
import './Login.scss';

const { Title } = Typography;

const ADMIN_ROLES = ['SUPER_ADMIN', 'PRISON_ADMIN', 'WAREHOUSE_MANAGER', 'COURIER'];

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
      const L =
        4 * gray(x, y) -
        gray(x - 1, y) -
        gray(x + 1, y) -
        gray(x, y - 1) -
        gray(x, y + 1);
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
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!faceModalOpen) {
      return undefined;
    }

    let videoElement = videoRef.current;

    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      streamRef.current = stream;
      const element = videoRef.current;

      if (element) {
        element.srcObject = stream;
        videoElement = element;
      }
    });

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;

      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [faceModalOpen]);

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
    setFaceModalOpen(false);

    if (ADMIN_ROLES.includes(userRole)) {
      window.location.replace('/admin');
      return;
    }

    window.location.replace('/');
  };

  const handleFaceCapture = async () => {
    const video = videoRef.current;

    if (!video?.videoWidth) {
      return;
    }

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
          const bounds = faces[0].boundingBox;
          face_bbox = JSON.stringify({
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
          });
        }
      } catch {}
    }

    canvas.toBlob(async blob => {
      setFaceLoading(true);

      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      formData.append('capture_width', String(canvas.width));
      formData.append('capture_height', String(canvas.height));
      formData.append('client_face_count', client_face_count);
      formData.append('client_blur_score', String(client_blur_score));
      formData.append('client_brightness', String(client_brightness));
      formData.append('face_bbox', face_bbox);

      try {
        const response = await apiClient.post('/api/v1/auth/face-login', formData);
        message.info(response.data.message);
        completeLogin(response.data);
      } catch (error) {
        message.error(error?.response?.data?.message);
      } finally {
        setFaceLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="login-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Вход по Face ID</h1>
        </div>
      </div>

      <div className="content-section">
        <Card className="face-login-card" bordered={false}>
          <Title level={2} className="form-title">
            Авторизация заключённых
          </Title>
          <p className="face-login-copy">
            Камера открывается автоматически. Если окно было закрыто, нажмите кнопку ниже.
          </p>
          <Button type="primary" onClick={() => setFaceModalOpen(true)}>
            Открыть Face ID
          </Button>
        </Card>

        <Modal
          title="Вход по Face ID"
          open={faceModalOpen}
          onCancel={() => setFaceModalOpen(false)}
          destroyOnClose
          width="min(700px, 64vw)"
          centered
          footer={(
            <Space>
              <Button onClick={() => setFaceModalOpen(false)}>Отмена</Button>
              <Button type="primary" onClick={handleFaceCapture} loading={faceLoading}>
                Сделать снимок
              </Button>
            </Space>
          )}
        >
          <p className="login-face-modal-hint">Разрешите доступ к камере в браузере.</p>
          <div className="login-face-stage">
            <video ref={videoRef} className="login-face-video" autoPlay playsInline muted />
            <div className="login-face-oval" aria-hidden />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Login;
