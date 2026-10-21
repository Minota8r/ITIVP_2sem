import { useEffect, useMemo, useState } from 'react';

import { CATEGORIES, INITIAL_LISTINGS } from './data';
import { useLocalStorage } from './useLocalStorage';
import ListingFilters from './ListingFilters';
import ListingForm from './ListingForm';
import ListingItem from './ListingItem';
import Stats from './Stats';

const DEFAULT_FILTERS = { search: '', category: '', status: '', sort: 'newest' };

// Сравнение объявлений для каждого вида сортировки
const COMPARATORS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  title: (a, b) => a.title.localeCompare(b.title, 'ru')
};

export default function ListingList() {
  const [listings, setListings, { loaded, pending, savedAt }] = useLocalStorage(
    'board.listings',
    INITIAL_LISTINGS
  );
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editingId, setEditingId] = useState(null);

  const editing = listings.find((listing) => listing.id === editingId) ?? null;

  // Поиск по названию и описанию, фильтры по категории и статусу, затем сортировка
  const visible = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const categoryId = CATEGORIES.find((c) => c.slug === filters.category)?.id;

    return listings
      .filter((listing) => {
        if (categoryId && listing.categoryId !== categoryId) return false;
        if (filters.status && listing.status !== filters.status) return false;
        if (!search) return true;
        return `${listing.title} ${listing.description}`.toLowerCase().includes(search);
      })
      .sort(COMPARATORS[filters.sort]);
  }, [listings, filters]);

  const stats = useMemo(() => {
    const count = (status) => listings.filter((listing) => listing.status === status).length;
    const activeSum = listings
      .filter((listing) => listing.status === 'active')
      .reduce((sum, listing) => sum + listing.price, 0);

    return {
      total: listings.length,
      active: count('active'),
      sold: count('sold'),
      archived: count('archived'),
      activeSum
    };
  }, [listings]);

  // Заголовок вкладки показывает число активных объявлений
  useEffect(() => {
    document.title = `(${stats.active}) Доска объявлений`;
  }, [stats.active]);

  function handleAdd(fields) {
    const now = new Date().toISOString();
    setListings((prev) => {
      const id = prev.reduce((max, listing) => Math.max(max, listing.id), 0) + 1;
      return [...prev, { id, ...fields, createdAt: now, updatedAt: now }];
    });
  }

  function handleUpdate(fields) {
    const now = new Date().toISOString();
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === editingId ? { ...listing, ...fields, updatedAt: now } : listing
      )
    );
    setEditingId(null);
  }

  function handleDelete(listing) {
    if (!confirm(`Удалить объявление «${listing.title}»?`)) return;

    setListings((prev) => prev.filter((item) => item.id !== listing.id));
    if (listing.id === editingId) setEditingId(null);
  }

  // Быстрая смена статуса: активное → продано, остальные → снова активные
  function handleToggleStatus(listing) {
    const status = listing.status === 'active' ? 'sold' : 'active';
    const now = new Date().toISOString();
    setListings((prev) =>
      prev.map((item) => (item.id === listing.id ? { ...item, status, updatedAt: now } : item))
    );
  }

  function handleRestoreDemo() {
    if (!confirm('Заменить все объявления демонстрационными?')) return;

    setListings(INITIAL_LISTINGS);
    setEditingId(null);
  }

  // До чтения localStorage ничего не показываем, чтобы не мелькали демо-данные
  if (!loaded) return null;

  return (
    <div className="layout">
      <aside className="sidebar">
        <ListingForm
          key={editingId ?? 'new'}
          editing={editing}
          onSubmit={editing ? handleUpdate : handleAdd}
          onCancel={() => setEditingId(null)}
        />
        <Stats stats={stats} pending={pending} savedAt={savedAt} onRestoreDemo={handleRestoreDemo} />
      </aside>

      <main className="content">
        <ListingFilters
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        <p className="muted">
          Показано {visible.length} из {listings.length}
        </p>

        {visible.length > 0 ? (
          <ul className="listings">
            {visible.map((listing) => (
              <ListingItem
                key={listing.id}
                listing={listing}
                isEditing={listing.id === editingId}
                onEdit={setEditingId}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </ul>
        ) : (
          <div className="empty">
            {listings.length === 0 ? 'Объявлений пока нет — добавьте первое' : 'Ничего не найдено'}
          </div>
        )}
      </main>
    </div>
  );
}
