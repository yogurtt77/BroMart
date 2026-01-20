import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Subcategory.scss';

const Subcategory = () => {
  const { categoryId, subcategoryId } = useParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');

  // Данные подкатегорий
  const subcategories = {
    hot: {
      kfc: {
        name: 'КФС',
        categoryName: 'Товары',
        products: [
          {
            id: 1,
            name: 'KFC Баскет 12 крылышек + 6 ножки',
            price: 13750.0,
            category: 'КФС',
            image: 'https://bromart-57.kz/wp-content/uploads/2025/11/ttttt.jpg'
          },
          {
            id: 2,
            name: 'KFC Баскет 12 ножки',
            price: 9900.0,
            category: 'КФС',
            image: 'https://bromart-57.kz/wp-content/uploads/2025/11/ttttt.jpg'
          },
          {
            id: 3,
            name: 'KFC Баскет 16 Крылышек + 16 Стрипсов',
            price: 13750.0,
            category: 'КФС',
            image: 'https://bromart-57.kz/wp-content/uploads/2025/11/ttttt.jpg'
          }
        ]
      }
    }
  };

  const subcategory = subcategories[categoryId]?.[subcategoryId];

  if (!subcategory) {
    return <div>Подкатегория не найдена</div>;
  }

  return (
    <div className="subcategory-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">{subcategory.name}</h1>
          <div className="breadcrumb">
            <Link to="/">⌂</Link>
            <span className="separator">›</span>
            <Link to={`/category/${categoryId}`}>{subcategory.categoryName}</Link>
            <span className="separator">›</span>
            <span>{subcategory.name}</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="toolbar">
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="2" width="7" height="7" />
                  <rect x="11" y="2" width="7" height="7" />
                  <rect x="2" y="11" width="7" height="7" />
                  <rect x="11" y="11" width="7" height="7" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="3" width="16" height="2" />
                  <rect x="2" y="9" width="16" height="2" />
                  <rect x="2" y="15" width="16" height="2" />
                </svg>
              </button>
            </div>

            <div className="sort-control">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Исходная сортировка</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="name">По названию</option>
              </select>
            </div>

            <div className="view-info">
              ПРОСМОТРЕТЬ: <span>12 / 24 / ВСЕ</span>
            </div>
          </div>

          <div className={`products-grid ${viewMode}`}>
            {subcategory.products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-footer">
                    <span className="product-price">{product.price.toFixed(2)} ₸</span>
                    <button className="btn-add-cart">В корзину</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subcategory;
