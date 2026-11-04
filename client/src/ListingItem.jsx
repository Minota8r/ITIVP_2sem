import { formatPrice, STATUSES } from './data';

export default function ListingItem({ listing, isEditing, canModify, onEdit, onDelete, onToggleStatus }) {
  const date = new Date(listing.createdAt).toLocaleDateString('ru-RU');
  const classes = ['card', 'listing', `status-${listing.status}`];
  if (isEditing) classes.push('listing-editing');
  if (listing.pending) classes.push('listing-pending');

  return (
    <li className={classes.join(' ')}>
      <div className="listing-head">
        <h3>{listing.title}</h3>
        <span className="price">{formatPrice(listing.price)}</span>
      </div>

      <p className="description">{listing.description}</p>

      <div className="meta">
        <span className={`badge badge-${listing.status}`}>{STATUSES[listing.status]}</span>
        <span>{listing.category?.name ?? '—'}</span>
        <span>{listing.city}</span>
        <span>{listing.user?.name}</span>
        <span>{date}</span>
        {listing.pending && <span className="pending-label">Сохранение…</span>}
      </div>

      {canModify && (
        <div className="actions">
          <button type="button" onClick={() => onEdit(listing.id)} disabled={isEditing || listing.pending}>
            Изменить
          </button>
          <button type="button" onClick={() => onToggleStatus(listing)} disabled={listing.pending}>
            {listing.status === 'active' ? 'Продано' : 'Вернуть в активные'}
          </button>
          <button type="button" className="danger" onClick={() => onDelete(listing)} disabled={listing.pending}>
            Удалить
          </button>
        </div>
      )}
    </li>
  );
}
