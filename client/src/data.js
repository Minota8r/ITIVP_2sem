// Категории и статусы совпадают с сидами и моделью Listing на сервере
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

export function categoryName(id) {
  return CATEGORIES.find((category) => category.id === id)?.name ?? '—';
}

// Начальные данные, если в localStorage ещё ничего нет
export const INITIAL_LISTINGS = [
  {
    id: 1,
    title: 'iPhone 13, 128 ГБ',
    description: 'Состояние отличное, полный комплект, батарея 89%',
    price: 1450,
    city: 'Минск',
    categoryId: 1,
    status: 'active',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Велосипед Stels Navigator',
    description: 'Горный, 21 скорость, после ТО',
    price: 380,
    city: 'Гродно',
    categoryId: 2,
    status: 'active',
    createdAt: '2026-09-11T14:30:00.000Z',
    updatedAt: '2026-09-11T14:30:00.000Z'
  },
  {
    id: 3,
    title: 'Сдам 1-комнатную квартиру',
    description: 'Рядом с метро, есть мебель и техника',
    price: 900,
    city: 'Минск',
    categoryId: 3,
    status: 'active',
    createdAt: '2026-09-12T09:15:00.000Z',
    updatedAt: '2026-09-12T09:15:00.000Z'
  },
  {
    id: 4,
    title: 'Ноутбук Lenovo IdeaPad 5',
    description: 'Ryzen 5, 16 ГБ ОЗУ, SSD 512 ГБ, без царапин',
    price: 1800,
    city: 'Гомель',
    categoryId: 1,
    status: 'sold',
    createdAt: '2026-09-13T12:00:00.000Z',
    updatedAt: '2026-09-15T18:20:00.000Z'
  },
  {
    id: 5,
    title: 'Требуется курьер',
    description: 'Доставка по городу, гибкий график, оплата еженедельно',
    price: 1200,
    city: 'Минск',
    categoryId: 4,
    status: 'active',
    createdAt: '2026-09-14T08:45:00.000Z',
    updatedAt: '2026-09-14T08:45:00.000Z'
  }
];

export function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} BYN`;
}
