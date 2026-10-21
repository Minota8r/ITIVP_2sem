import { useEffect, useState } from 'react';

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch (err) {
    // Битый JSON или недоступное хранилище — работаем с начальными данными
    console.warn(`Не удалось прочитать "${key}" из localStorage`, err);
    return undefined;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`Не удалось сохранить "${key}" в localStorage`, err);
    return false;
  }
}

// Состояние, которое хранится в localStorage.
// Загружается при монтировании, сохраняется через delay мс после последнего изменения.
export function useLocalStorage(key, initialValue, delay = 500) {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);
  // Что сейчас лежит в хранилище и когда это было записано
  const [saved, setSaved] = useState({ value: undefined, at: null });

  // Загрузка при монтировании (ключ за время жизни компонента не меняется).
  // Можно было бы читать хранилище в ленивом инициализаторе useState,
  // но по заданию загрузка делается эффектом с пустым массивом зависимостей.
  useEffect(() => {
    const stored = readStorage(key);
    if (stored !== undefined) {
      // oxlint-disable-next-line react/set-state-in-effect
      setValue(stored);
      setSaved({ value: stored, at: null });
    }
    setLoaded(true);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = loaded && value !== saved.value;

  // Автосохранение с debounce: каждое новое изменение отменяет предыдущий таймер
  useEffect(() => {
    if (!pending) return;

    const timer = setTimeout(() => {
      if (writeStorage(key, value)) {
        setSaved({ value, at: new Date() });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [key, value, pending, delay]);

  // Если страницу закрывают раньше, чем сработал таймер, сохраняем сразу
  useEffect(() => {
    if (!pending) return;

    const flush = () => writeStorage(key, value);
    window.addEventListener('pagehide', flush);

    return () => window.removeEventListener('pagehide', flush);
  }, [key, value, pending]);

  return [value, setValue, { loaded, pending, savedAt: saved.at }];
}
