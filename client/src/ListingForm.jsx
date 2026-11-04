import { useEffect, useRef, useState } from 'react';

import { CATEGORIES, STATUSES } from './data';

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  city: '',
  categoryId: String(CATEGORIES[0].id),
  status: 'active'
};

function toForm(listing) {
  return {
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    city: listing.city,
    categoryId: String(listing.categoryId),
    status: listing.status
  };
}

function validate(form) {
  const errors = {};

  for (const field of ['title', 'description', 'city']) {
    if (form[field].trim() === '') errors[field] = 'Обязательное поле';
  }

  const price = Number(form.price);
  if (form.price.trim() === '' || !Number.isFinite(price) || price < 0) {
    errors.price = 'Неотрицательное число';
  }

  return errors;
}

export default function ListingForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => (editing ? toForm(editing) : EMPTY_FORM));
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!isEditing) return;
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    titleRef.current.focus();
  }, [isEditing]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      city: form.city.trim(),
      categoryId: Number(form.categoryId),
      status: form.status
    });

    if (!editing) {
      setForm(EMPTY_FORM);
      titleRef.current.focus();
    }
  }

  function handleCancel() {
    if (editing) {
      onCancel();
    } else {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      formRef.current.requestSubmit();
    }
  }

  const field = (name) => ({
    id: `form-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errors[name])
  });

  return (
    <form
      ref={formRef}
      className={`card form${editing ? ' form-editing' : ''}`}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
    >
      <h2>{editing ? `Редактирование #${editing.id}` : 'Новое объявление'}</h2>

      <label htmlFor="form-title">Название</label>
      <input ref={titleRef} {...field('title')} placeholder="Например, iPhone 13" />
      {errors.title && <span className="error">{errors.title}</span>}

      <label htmlFor="form-description">Описание</label>
      <textarea {...field('description')} rows={3} placeholder="Состояние, комплектация…" />
      {errors.description && <span className="error">{errors.description}</span>}

      <div className="row">
        <div>
          <label htmlFor="form-price">Цена, BYN</label>
          <input {...field('price')} type="number" min="0" step="any" placeholder="0" />
          {errors.price && <span className="error">{errors.price}</span>}
        </div>
        <div>
          <label htmlFor="form-city">Город</label>
          <input {...field('city')} placeholder="Минск" />
          {errors.city && <span className="error">{errors.city}</span>}
        </div>
      </div>

      <div className="row">
        <div>
          <label htmlFor="form-categoryId">Категория</label>
          <select {...field('categoryId')}>
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="form-status">Статус</label>
          <select {...field('status')}>
            {Object.entries(STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="primary">
          {editing ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" onClick={handleCancel}>
          {editing ? 'Отмена' : 'Очистить'}
        </button>
      </div>
      <p className="hint">Enter — отправить, Ctrl+Enter — из описания, Esc — отмена</p>
    </form>
  );
}
