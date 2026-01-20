import React from 'react';
import { Link } from 'react-router-dom';
import './Home.scss';

const Home = () => {
  const categories = [
    {
      id: 1,
      name: 'Горячее',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-31-okt.-2025-g.-18_21_54-300x300.png',
      link: '/category/hot'
    },
    {
      id: 2,
      name: 'Кондитерское',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_14_22-300x300.png'
    },
    {
      id: 3,
      name: 'Напитки',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_18_19-300x300.png'
    },
    {
      id: 4,
      name: 'Продукты питания',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_14_30-300x300.png'
    },
    {
      id: 5,
      name: 'Табачные изделия',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_14_35-300x300.png'
    },
    {
      id: 6,
      name: 'Чай, кофе, какао',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_14_41-300x300.png'
    },
    {
      id: 7,
      name: 'Хозяйственные товары',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_15_03-300x300.png'
    },
    {
      id: 8,
      name: 'Молочные изделия',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_15_12-300x300.png'
    },
    {
      id: 9,
      name: 'Одежда и обувья',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_25_50-300x300.png'
    },
    {
      id: 10,
      name: 'Гигиенические товары',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_14_57-300x300.png'
    },
    {
      id: 11,
      name: 'Соусы и специи',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_15_07-300x300.png'
    },
    {
      id: 12,
      name: 'Разное',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_15_23-300x300.png'
    },
    {
      id: 13,
      name: 'Канцелярские товары',
      icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-1-noyab.-2025-g.-01_15_16-300x300.png'
    }
  ];

  return (
    <div className="home">
      <div className="page-title-section">
        <div className="container">
          <h1 className="page-title">Главная страница</h1>
        </div>
      </div>

      <section className="hero-section">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <h2 className="hero-title">
            Магазин онлайн-покупок
            <br />
            учреждение №57
          </h2>
          <button className="btn-primary">Ознакомиться с каталогом</button>
        </div>
      </section>

      <section className="catalog-section">
        <div className="container">
          <h2 className="section-title">Каталог продукции</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link key={category.id} to={category.link || '#'} className="category-card">
                <div className="category-icon">
                  <img src={category.icon} alt={category.name} />
                </div>
                <h3 className="category-name">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
