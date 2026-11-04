import { useEffect, useMemo, useState } from 'react';

import { addListing, deleteListing, errorMessage, fetchListings, isCancel, updateListing } from './api';
import { CATEGORIES } from './data';
import { useDebounce } from './useDebounce';
import ListingFilters from './ListingFilters';
import ListingForm from './ListingForm';
import ListingItem from './ListingItem';
import LoginForm from './LoginForm';
import Stats from './Stats';

const DEFAULT_FILTERS = { search: '', category: '', status: '', sort: 'newest' };

const COMPARATORS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  title: (a, b) => a.title.localeCompare(b.title, 'ru')
};

function findCategory(id) {
  return CATEGORIES.find((category) => category.id === id);
}

function toFields(listing) {
  const { title, description, price, city, categoryId, status } = listing;
  return { title, description, price, city, categoryId, status };
}

function canModify(user, listing) {
  return Boolean(user) && (user.role === 'admin' || user.id === listing.userId);
}

export default function ListingList({ user, onLogin, notify }) {
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [answeredKey, setAnsweredKey] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editingId, setEditingId] = useState(null);

  const search = useDebounce(filters.search.trim(), 400);
  const { category, status } = filters;
  const requestKey = [search, category, status, reloadKey].join('|');
  const loading = answeredKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      search: search || undefined,
      category: category || undefined,
      status: status || undefined
    };

    fetchListings(params, controller.signal)
      .then((data) => {
        setListings(data);
        setLoaded(true);
        setError(null);
        setAnsweredKey(requestKey);
      })
      .catch((err) => {
        if (isCancel(err)) return;
        setError(errorMessage(err));
        setAnsweredKey(requestKey);
      });

    return () => controller.abort();
  }, [search, category, status, requestKey]);

  const editing = listings.find((listing) => listing.id === editingId) ?? null;

  const visible = useMemo(() => [...listings].sort(COMPARATORS[filters.sort]), [listings, filters.sort]);

  const stats = useMemo(() => {
    const count = (value) => listings.filter((listing) => listing.status === value).length;
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

  useEffect(() => {
    document.title = `(${stats.active}) Доска объявлений`;
  }, [stats.active]);

  function replaceListing(id, next) {
    setListings((prev) => prev.map((listing) => (listing.id === id ? next : listing)));
  }

  async function handleAdd(fields) {
    const now = new Date().toISOString();
    const tempId = Date.now();
    const draft = {
      id: tempId,
      ...fields,
      userId: user.id,
      user: { id: user.id, name: user.name },
      category: findCategory(fields.categoryId),
      createdAt: now,
      updatedAt: now,
      pending: true
    };

    setListings((prev) => [draft, ...prev]);

    try {
      replaceListing(tempId, await addListing(fields));
      notify('Объявление добавлено', 'success');
    } catch (err) {
      setListings((prev) => prev.filter((listing) => listing.id !== tempId));
      notify(`Не удалось добавить объявление: ${errorMessage(err)}`);
    }
  }

  async function saveListing(original, fields) {
    replaceListing(original.id, {
      ...original,
      ...fields,
      category: findCategory(fields.categoryId),
      updatedAt: new Date().toISOString(),
      pending: true
    });

    try {
      replaceListing(original.id, await updateListing(original.id, fields));
      return true;
    } catch (err) {
      replaceListing(original.id, original);
      notify(`Не удалось сохранить изменения: ${errorMessage(err)}`);
      return false;
    }
  }

  async function handleUpdate(fields) {
    const original = editing;
    setEditingId(null);
    if (await saveListing(original, fields)) {
      notify('Изменения сохранены', 'success');
    }
  }

  function handleToggleStatus(listing) {
    const next = listing.status === 'active' ? 'sold' : 'active';
    saveListing(listing, { ...toFields(listing), status: next });
  }

  async function handleDelete(listing) {
    if (!confirm(`Удалить объявление «${listing.title}»?`)) return;

    const index = listings.findIndex((item) => item.id === listing.id);
    setListings((prev) => prev.filter((item) => item.id !== listing.id));
    if (listing.id === editingId) setEditingId(null);

    try {
      await deleteListing(listing.id);
      notify('Объявление удалено', 'success');
    } catch (err) {
      setListings((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, listing);
        return next;
      });
      notify(`Не удалось удалить объявление: ${errorMessage(err)}`);
    }
  }

  function renderContent() {
    if (error && !loading) {
      return (
        <div className="card state state-error">
          <p>Не удалось загрузить объявления: {error}</p>
          <button type="button" className="primary" onClick={() => setReloadKey((key) => key + 1)}>
            Повторить
          </button>
        </div>
      );
    }

    if (!loaded) {
      return (
        <div className="state">
          <span className="spinner" />
          Загрузка объявлений…
        </div>
      );
    }

    return (
      <>
        <p className="muted">
          Найдено: {listings.length}
          {loading && <span className="loading-inline"> · обновление…</span>}
        </p>

        {visible.length > 0 ? (
          <ul className="listings">
            {visible.map((listing) => (
              <ListingItem
                key={listing.id}
                listing={listing}
                isEditing={listing.id === editingId}
                canModify={canModify(user, listing)}
                onEdit={setEditingId}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </ul>
        ) : (
          <div className="empty">Ничего не найдено</div>
        )}
      </>
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        {user ? (
          <ListingForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onSubmit={editing ? handleUpdate : handleAdd}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <LoginForm onLogin={onLogin} />
        )}
        <Stats stats={stats} />
      </aside>

      <main className="content">
        <ListingFilters
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
        {renderContent()}
      </main>
    </div>
  );
}
