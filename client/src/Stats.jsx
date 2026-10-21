import { formatPrice } from './data';

export default function Stats({ stats, pending, savedAt, onRestoreDemo }) {
  let saveStatus = 'Данные загружены из localStorage';
  if (pending) {
    saveStatus = 'Сохранение…';
  } else if (savedAt) {
    saveStatus = `Сохранено в ${savedAt.toLocaleTimeString('ru-RU')}`;
  }

  return (
    <section className="card stats">
      <h2>Статистика</h2>
      <dl>
        <dt>Всего</dt>
        <dd>{stats.total}</dd>
        <dt>Активных</dt>
        <dd>{stats.active}</dd>
        <dt>Продано</dt>
        <dd>{stats.sold}</dd>
        <dt>В архиве</dt>
        <dd>{stats.archived}</dd>
        <dt>Сумма активных</dt>
        <dd>{formatPrice(stats.activeSum)}</dd>
      </dl>

      <p className={`save-status${pending ? ' save-pending' : ''}`}>{saveStatus}</p>
      <button type="button" className="link" onClick={onRestoreDemo}>
        Восстановить демо-данные
      </button>
    </section>
  );
}
