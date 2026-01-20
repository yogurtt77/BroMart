import React, { useState } from 'react';
import './Complaints.scss';

const Complaints = () => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    institution: 'Учреждение 57',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="complaints-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Жалобы и предложения</h1>
          <div className="breadcrumb">
            <span>Жалобы и предложения</span>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <div className="form-wrapper">
            <h2 className="form-title">Ваши жалобы и предложения</h2>

            <form onSubmit={handleSubmit} className="complaints-form">
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Фамилия получателя"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Имя получателя"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="middleName"
                  placeholder="Отчество получателя"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <select
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Учреждение 57">Учреждение 57</option>
                </select>
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Ваши предложения"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-submit">
                ОТПРАВИТЬ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;

