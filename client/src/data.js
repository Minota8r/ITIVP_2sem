export const CATEGORIES = [
  { id: 1, slug: 'electronics', name: 'Электроника' },
  { id: 2, slug: 'transport', name: 'Транспорт' },
  { id: 3, slug: 'realty', name: 'Недвижимость' },
  { id: 4, slug: 'jobs', name: 'Работа' },
  { id: 5, slug: 'services', name: 'Услуги' },
  { id: 6, slug: 'home', name: 'Дом и сад' },
  { id: 7, slug: 'clothes', name: 'Одежда' },
  { id: 8, slug: 'other', name: 'Другое' }
];

export const STATUSES = {
  active: 'Активно',
  sold: 'Продано',
  archived: 'В архиве'
};

export const SORTS = {
  newest: 'Сначала новые',
  oldest: 'Сначала старые',
  priceAsc: 'Цена по возрастанию',
  priceDesc: 'Цена по убыванию',
  title: 'По названию'
};

export function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} BYN`;
}
