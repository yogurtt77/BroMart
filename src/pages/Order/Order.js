import React from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography
} from 'antd';
import './Order.scss';

const { Title, Text } = Typography;

const INSTITUTION_OPTIONS = [
  { value: 'Учреждение 57', label: 'Учреждение 57' },
  { value: 'Учреждение 58', label: 'Учреждение 58 (тестовое)' },
  { value: 'Учреждение 59', label: 'Учреждение 59 (тестовое)' }
];

const Order = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('Order by request:', values);
  };

  return (
    <div className="order-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            Заказ по запросу
          </Title>
          <div className="order-breadcrumb">
            <Text type="secondary">Заказ по запросу</Text>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Card className="form-wrapper" bordered={false}>
            <Title level={2} className="form-title">
              Форма заказа по индивидуальному запросу
            </Title>

            <Form
              form={form}
              layout="vertical"
              initialValues={{ institution: 'Учреждение 57' }}
              onFinish={handleSubmit}
              className="order-form"
            >
              <Row gutter={[20, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="lastName"
                    rules={[{ required: true, message: 'Укажите фамилию' }]}
                  >
                    <Input placeholder="Фамилия получателя" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="firstName"
                    rules={[{ required: true, message: 'Укажите имя' }]}
                  >
                    <Input placeholder="Имя получателя" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="middleName"
                    rules={[{ required: true, message: 'Укажите отчество' }]}
                  >
                    <Input placeholder="Отчество получателя" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[20, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item name="institution">
                    <Select options={INSTITUTION_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="phone">
                    <Input type="tel" placeholder="Контактный телефон (тестовый)" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="email">
                    <Input type="email" placeholder="Email (тестовый)" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="productRequest"
                rules={[{ required: true, message: 'Опишите заказ' }]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Опишите, какие товары вы хотите заказать, желаемое количество и дополнительные пожелания"
                />
              </Form.Item>

              <Form.Item className="order-submit-wrap">
                <Button type="primary" htmlType="submit" block>
                  ОТПРАВИТЬ ЗАПРОС
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Order;
