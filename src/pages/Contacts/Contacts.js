import React from 'react';
import { Card, Col, Descriptions, Row, Typography } from 'antd';
import './Contacts.scss';

const { Title, Text, Paragraph } = Typography;

const CONTACT_ITEMS = [
  { key: 'phone', label: 'Телефон', children: '+7 (700) 000-00-00' },
  { key: 'phone2', label: 'Доп. телефон', children: '+7 (707) 111-11-11' },
  { key: 'email', label: 'Email', children: 'info@bromart-test.kz' },
  {
    key: 'address',
    label: 'Адрес офиса',
    children: 'г. Астана, ул. Тестовая 1, Бизнес-центр «BROMART»'
  },
  {
    key: 'hours',
    label: 'График работы',
    children: (
      <>
        Пн–Пт: 9:00–18:00
        <br />
        Сб–Вс: выходной
      </>
    )
  }
];

const Contacts = () => {
  return (
    <div className="contacts-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            Контакты
          </Title>
          <div className="contacts-breadcrumb">
            <Text type="secondary">Контакты</Text>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Row gutter={[40, 40]} className="contacts-layout">
            <Col xs={24} lg={14}>
              <Card className="contacts-card" bordered={false}>
                <Title level={2} className="section-title">
                  Свяжитесь с нами
                </Title>
                <Paragraph type="secondary" className="subtitle">
                  Данные указаны тестовые и используются только для демонстрации интерфейса.
                </Paragraph>
                <Descriptions
                  column={1}
                  layout="vertical"
                  size="middle"
                  items={CONTACT_ITEMS}
                  className="contacts-descriptions"
                />
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="contacts-card contacts-info" bordered={false}>
                <Title level={2} className="section-title">
                  Дополнительная информация
                </Title>
                <Paragraph>
                  Служба поддержки работает в тестовом режиме. Вы можете использовать указанные
                  контакты как пример для интеграции реальных данных в будущем.
                </Paragraph>
                <Paragraph>
                  При переходе на боевой режим здесь можно разместить данные колл-центра, юридический
                  адрес, реквизиты компании и ссылки на мессенджеры.
                </Paragraph>
                <div className="placeholder-map">
                  <Text type="secondary">Здесь может быть карта или фотография офиса</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
