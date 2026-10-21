import { categoryName, formatPrice, STATUSES } from './data';

export default function ListingItem({ listing, isEditing, onEdit, onDelete, onToggleStatus }) {
  const date = new Date(listing.createdAt).toLocaleDateString('ru-RU');

  return (
    <li className={`card listing status-${listing.status}${isEditing ? ' listing-editing' : ''}`}>
      <div className="listing-head">
        <h3>{listing.title}</h3>
        <span className="price">{formatPrice(listing.price)}</span>
      </div>

      <p className="description">{listing.description}</p>

      <div className="meta">
        <span className={`badge badge-${listing.status}`}>{STATUSES[listing.status]}</span>
        <span>{categoryName(listing.categoryId)}</span>
        <span>{listing.city}</span>
        <span>{date}</span>
      </div>

      <div className="actions">
        <button type="button" onClick={() => onEdit(listing.id)} disabled={isEditing}>
          Изменить
        </button>
        <button type="button" onClick={() => onToggleStatus(listing)}>
          {listing.status === 'active' ? 'Продано' : 'Вернуть в активные'}
        </button>
        <button type="button" className="danger" onClick={() => onDelete(listing)}>
          Удалить
        </button>
      </div>
    </li>
  );
}
