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
              Часто задаваемые вопросы
            </Title>

            <Space direction="vertical" size="large" className="faq-content">
              <Title level={4} className="faq-section-title">
                Работа с системой
              </Title>

              <div className="faq-item">
                <Title level={5}>Как войти в систему?</Title>
                <Paragraph>
                  Для входа используйте выданные логин и пароль. Если для вашего аккаунта доступна
                  биометрическая авторизация, вы можете воспользоваться кнопкой
                  <Text strong> «Вход по Face ID»</Text> на странице входа.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Кто может оформлять заказы?</Title>
                <Paragraph>
                  Оформление заказов доступно пользователям с ролью <Text strong>INMATE</Text>.
                  Административные роли работают в своих кабинетах и не используют корзину для
                  покупки товаров.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Как оформить заказ?</Title>
                <ol className="faq-list">
                  <li>Выберите нужную категорию и товар.</li>
                  <li>Добавьте товары в корзину и укажите количество.</li>
                  <li>Перейдите в корзину и проверьте состав заказа.</li>
                  <li>Убедитесь, что на балансе хватает средств и не превышен лимит.</li>
                  <li>Подтвердите оформление заказа.</li>
                </ol>
              </div>

              <div className="faq-item">
                <Title level={5}>Когда списываются деньги?</Title>
                <Paragraph>
                  После создания заказ не списывается мгновенно. Сначала он получает статус
                  <Text strong> «Ожидает одобрения»</Text>. Списание происходит после подтверждения
                  заказа.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Где посмотреть баланс и лимиты?</Title>
                <Paragraph>
                  На странице корзины отображаются:
                </Paragraph>
                <ol className="faq-list">
                  <li>остаток на балансе;</li>
                  <li>сколько уже потрачено за месяц;</li>
                  <li>месячный лимит.</li>
                </ol>
              </div>

              <div className="faq-item">
                <Title level={5}>Какие статусы бывают у заказа?</Title>
                <Paragraph>
                  В системе используются следующие основные статусы:
                </Paragraph>
                <ol className="faq-list">
                  <li>Ожидает одобрения</li>
                  <li>Одобрен</li>
                  <li>В сборке</li>
                  <li>Готов к отправке</li>
                  <li>В пути</li>
                  <li>Прибыл в учреждение</li>
                  <li>Доставлен</li>
                  <li>Проблема с доставкой</li>
                  <li>Отклонён</li>
                  <li>Отменён</li>
                </ol>
              </div>

              <div className="faq-item">
                <Title level={5}>Что будет, если заказ отклонён или доставка не удалась?</Title>
                <Paragraph>
                  Если заказ отклонён или не был завершён, в интерфейсе отображается соответствующий
                  статус. В таких случаях списание не должно завершаться как обычная успешная покупка.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Где посмотреть историю заказов?</Title>
                <Paragraph>
                  Пользователь с ролью <Text strong>INMATE</Text> может открыть раздел
                  <Text strong> «Мои заказы»</Text>, где отображаются все его заказы, их состав,
                  текущий статус и этапы движения.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Как отправить жалобу или предложение?</Title>
                <Paragraph>
                  Авторизованный пользователь может открыть раздел
                  <Text strong> «Предложения и жалобы»</Text>, выбрать тип обращения, указать тему и
                  текст, а затем отправить форму.
                </Paragraph>
              </div>

              <div className="faq-item">
                <Title level={5}>Можно ли посмотреть отправленные обращения?</Title>
                <Paragraph>
                  Да. В разделе <Text strong>«Предложения и жалобы»</Text> доступна кнопка
                  <Text strong> «Мои обращения»</Text>. Там отображаются отправленные обращения и их
                  статус доставки:
                </Paragraph>
                <ol className="faq-list">
                  <li>В очереди</li>
                  <li>Отправлено</li>
                  <li>Ошибка отправки</li>
                </ol>
              </div>

              <div className="faq-item">
                <Title level={5}>Кто обрабатывает заказы и обращения?</Title>
                <Paragraph>
                  В системе используются разные роли: супер-администратор, начальник учреждения,
                  начальник склада, курьер и заключённый. Каждый пользователь видит только свой
                  кабинет и свой рабочий функционал.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
