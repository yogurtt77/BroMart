import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Spin, Typography, message } from 'antd';
import apiClient from '../../utils/apiClient';
import { formatDate } from '../../utils/admin';
import { clearAuthSession, stopAuthRefreshScheduler } from '../../utils/auth';
import './Profile.scss';

const { Title, Text } = Typography;

const unwrapData = payload => payload?.data ?? payload;

const fieldItems = profile => [
  {
    key: 'iin',
    label: 'ИИН',
    children: profile.iin || '—'
  },
  {
    key: 'full_name',
    label: 'ФИО',
    children: profile.full_name || '—'
  },
  {
    key: 'facility_name',
    label: 'Учреждение',
    children: profile.facility_name || '—'
  },
  {
    key: 'transfer_date',
    label: 'Дата перевода',
    children: formatDate(profile.transfer_date)
  },
  {
    key: 'release_date',
    label: 'Дата освобождения',
    children: formatDate(profile.release_date)
  }
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await apiClient.get('/api/v1/users/me/profile', { signal });
        const data = unwrapData(response.data);
        setProfile(data && typeof data === 'object' ? data : null);
      } catch (requestError) {
        if (signal.aborted) {
          return;
        }

        const errorMessage = requestError?.response?.data?.message || 'Ошибка загрузки профиля';
        setError(errorMessage);
        setProfile(null);
        message.error(errorMessage);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      clearAuthSession();
      stopAuthRefreshScheduler();
      await new Promise(resolve => setTimeout(resolve, 250));
      window.location.replace('/login');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            Профиль
          </Title>
          <Text className="page-subtitle">
            Информация отображается только для заключенного и подтягивается из личного профиля.
          </Text>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Spin spinning={loading}>
            {error ? <Alert type="error" message={error} showIcon className="profile-alert" /> : null}

            {profile ? (
              <Card bordered={false} className="profile-card">
                <Descriptions
                  bordered
                  column={1}
                  items={fieldItems(profile)}
                  className="profile-descriptions"
                />
                <div className="profile-actions">
                  <Button
                    type="primary"
                    loading={logoutLoading}
                    onClick={handleLogout}
                    className="profile-logout-button"
                  >
                    Выйти
                  </Button>
                </div>
              </Card>
            ) : null}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Profile;
