import React from 'react';
import { Button, Card, Form, Input, Select, Typography } from 'antd';
import './Complaints.scss';

const { Title, Text } = Typography;

const INSTITUTION_OPTIONS = [{ value: 'Тест', label: 'Тест' }];

const Complaints = () => {
  const [form] = Form.useForm();

  const handleSubmit = values => {
    console.log('Form submitted:', values);
  };

  return (
    <div className="complaints-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            Жалобы и предложения
          </Title>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Card className="form-wrapper" bordered={false}>
            <Title level={2} className="form-title">
              Ваши жалобы и предложения
            </Title>

            <Form form={form} layout="vertical" onFinish={handleSubmit} className="complaints-form">
              <Form.Item name="lastName" rules={[{ required: true, message: 'Укажите фамилию' }]}>
                <Input placeholder="Фамилия получателя" />
              </Form.Item>

              <Form.Item name="firstName" rules={[{ required: true, message: 'Укажите имя' }]}>
                <Input placeholder="Имя получателя" />
              </Form.Item>

              <Form.Item
                name="middleName"
                rules={[{ required: true, message: 'Укажите отчество' }]}
              >
                <Input placeholder="Отчество получателя" />
              </Form.Item>

              <Form.Item name="institution">
                <Select options={INSTITUTION_OPTIONS} />
              </Form.Item>

              <Form.Item name="message" rules={[{ required: true, message: 'Введите текст' }]}>
                <Input.TextArea rows={6} placeholder="Ваши предложения" />
              </Form.Item>

              <Form.Item className="complaints-submit-wrap">
                <Button type="primary" htmlType="submit" block>
                  ОТПРАВИТЬ
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
