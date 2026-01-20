import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Category.scss';

const Category = () => {
  const { categoryId } = useParams();

  // Данные категорий
  const categories = {
    hot: {
      name: 'Горячее',
      subcategories: [
        {
          id: 'kfc',
          name: 'KFC',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-2-noyab.-2025-g.-01_56_11-300x300.png'
        },
        {
          id: 'mangal-doner',
          name: 'Mangal doner',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-2-noyab.-2025-g.-01_55_19-300x300.png'
        },
        {
          id: 'salam-bro',
          name: 'SALAM BRO',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-2-noyab.-2025-g.-01_56_06.png'
        },
        {
          id: 'gippo',
          name: 'GIPPO',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-2-noyab.-2025-g.-02_07_34-300x300-1.png'
        },
        {
          id: 'red-dragon',
          name: 'Red Dragon',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/8c19e3f7-3886-463f-9bac-c4f953bf148e-300x300.png'
        },
        {
          id: 'doner-satpayeva',
          name: 'Doner Na Satpayeva',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-2-noyab.-2025-g.-01_56_23-300x300.png'
        },
        {
          id: 'shipudim',
          name: 'SHIPUDIM',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/11/chatgpt-image-2-noyab.-2025-g.-01_56_00-300x300.png'
        },
        {
          id: 'okadzaki',
          name: 'OKADZAKI',
          icon: 'https://bromart-57.kz/wp-content/uploads/2025/12/bf8f1663-459e-49fb-b776-13a903acdff6-300x300.png'
        }
      ]
    }
  };

  const category = categories[categoryId];

  if (!category) {
    return <div>Категория не найдена</div>;
  }

  return (
    <div className="category-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">{category.name}</h1>
          <div className="breadcrumb">
            <Link to="/">⌂</Link>
            <span className="separator">›</span>
            <span>{category.name}</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="subcategories-grid">
            {category.subcategories.map(subcategory => (
              <Link
                key={subcategory.id}
                to={`/category/${categoryId}/${subcategory.id}`}
                className="subcategory-card"
              >
                <div className="subcategory-image">
                  <img src={subcategory.icon} alt={subcategory.name} />
                </div>
                <div className="subcategory-footer">
                  <span className="arrow-icon">➤</span>
                  <h3 className="subcategory-name">{subcategory.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
