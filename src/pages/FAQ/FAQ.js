import React from 'react';
import { Card, Space, Typography } from 'antd';
import './FAQ.scss';

const { Title, Text, Paragraph } = Typography;

const FAQ = () => {
  return (
    <div className="faq-page">
      <div className="page-header">
        <div className="container">
          <Title level={1} className="page-title">
            Вопрос/ответ
          </Title>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <Card className="content-box" bordered={false}>
            <Title level={2} className="content-title">
              Вопрос/ответ
            </Title>

            <Space direction="vertical" size="large" className="faq-content">
              <Title level={4} className="faq-section-title">
                Вопросы и ответы
              </Title>

              <div className="faq-item">
                <Title level={5}>
                  Как зарегистрироваться в электронном магазине Bromart-57.kz?
                </Title>
                <Paragraph>
                  Зайдите на сайт <Text strong>www.bromart-57.kz</Text> и нажмите вход/регистрация
                </Paragraph>
                <Paragraph>
                  Внимательно заполняйте свои данные, предоставляйте только достоверные данные:
                </Paragraph>
                <ol className="faq-list">
                  <li>Придумайте логин</li>
                  <li>Укажите ФИО;</li>
                  <li>Укажите номер учреждения</li>
                  <li>Укажите Email</li>
                  <li>Придумайте и введите пароль. Необходимо запомнить введенный пароль.</li>
                  <li>Завершите регистрацию по инструкциям на сайте</li>
                </ol>
              </div>

              <div className="faq-item">
                <Title level={5}>Как я могу с Вами связаться?</Title>
                <Paragraph>Вы можете связаться с нами по нижеуказанным телефонам:</Paragraph>
                <Paragraph>
                  <Text strong>+7 707 742 11 01</Text>
                </Paragraph>
                <Paragraph>(Пн-Пт: 9:00 – 18:00; обед: выходной)</Paragraph>
                <Paragraph>
                  Вы можете оставить голосовые сообщения, мы обязательно перезвоним вам
                </Paragraph>
                <Paragraph>(Пн-Пт: 9:00 – 18:00; обед: выходной)</Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>В течение какого времени осуществляется доставка заказа?</Title>
                <Paragraph>
                  Доставка посылок осуществляется ежедневно, с понедельника по пятницу.
                </Paragraph>
                <Paragraph>
                  Доставка посылок осуществляется на следующий рабочий день, если заказ был размещен
                  до 15:00
                </Paragraph>
                <Paragraph>
                  Если заказ сделан после 15:00, доставка осуществляется через два рабочих день с
                  даты заказа.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Кто будет знать о моем заказе?</Title>
                <Paragraph>
                  При отправке посылки в Исправительную Колонию, СИЗО, мы сохраняем
                  конфиденциальность и не разглашаем информацию третьим лицам и родственников
                  заказе.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Какая стоимость доставки?</Title>
                <Paragraph>
                  Стоимость доставки <Text strong>БЕСПЛАТНАЯ!!!</Text>
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Как оформить заказ в Исправительную колонию?</Title>
                <ol className="faq-list">
                  <li>Зайдите на сайт www.bromart.kzипрорегистрируйтесь;</li>
                  <li>
                    Выберите ваш необходимые для вас товары и добавьте их в корзину, или список.
                    Обратите внимание на Вибиране количество.
                  </li>
                  <li>
                    В Корзине вы можете ознакомиться со списком товаров и их количеством. Важно
                    сообщать существующие ограничения.
                  </li>
                  <li>На странице оформления заказа, укажите ФИО и выберите Учреждение</li>
                  <li>Подтвердите заказ</li>
                </ol>
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
