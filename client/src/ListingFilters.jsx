import { useEffect, useRef } from 'react';

import { CATEGORIES, SORTS, STATUSES } from './data';

export default function ListingFilters({ filters, onChange, onReset }) {
  const searchRef = useRef(null);

  // Горячая клавиша «/» ставит фокус в поиск (если пользователь не печатает в другом поле)
  useEffect(() => {
    function handleKeyDown(event) {
      const tag = event.target.tagName;
      if (event.key !== '/' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      event.preventDefault();
      searchRef.current.focus();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const change = (name) => (event) => onChange({ [name]: event.target.value });

  return (
    <div className="card filters">
      <input
        ref={searchRef}
        type="search"
        className="search"
        value={filters.search}
        onChange={change('search')}
        onKeyDown={(event) => event.key === 'Escape' && onChange({ search: '' })}
        placeholder="Поиск по названию и описанию (/)"
        aria-label="Поиск"
      />

      <select value={filters.category} onChange={change('category')} aria-label="Категория">
        <option value="">Все категории</option>
        {CATEGORIES.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <select value={filters.status} onChange={change('status')} aria-label="Статус">
        <option value="">Все статусы</option>
        {Object.entries(STATUSES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select value={filters.sort} onChange={change('sort')} aria-label="Сортировка">
        {Object.entries(SORTS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <button type="button" onClick={onReset}>
        Сбросить
      </button>
    </div>
  );
}
