import { formatPrice } from './data';

export default function Stats({ stats }) {
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
    </section>
  );
}
