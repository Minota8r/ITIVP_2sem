import { useCallback, useEffect, useRef, useState } from 'react';

import { setUnauthorizedHandler } from './api';
import ListingList from './ListingList';
import Toasts from './Toasts';

function readUser() {
  if (!localStorage.getItem('token')) return null;
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(readUser);
  const [toasts, setToasts] = useState([]);
  const nextToastId = useRef(1);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (text, type = 'error') => {
      const id = nextToastId.current++;
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => closeToast(id), 4000);
    },
    [closeToast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  function handleLogin({ token, user }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    notify(`Вы вошли как ${user.name}`, 'success');
  }

  return (
    <>
      <header className="header">
        <div>
          <h1>Доска объявлений</h1>
          <p>Данные загружаются с сервера</p>
        </div>
        {user && (
          <div className="user">
            <span>
              {user.name}
              {user.role === 'admin' && ' (администратор)'}
            </span>
            <button type="button" onClick={logout}>
              Выйти
            </button>
          </div>
        )}
      </header>
      <ListingList user={user} onLogin={handleLogin} notify={notify} />
      <Toasts toasts={toasts} onClose={closeToast} />
    </>
  );
}
