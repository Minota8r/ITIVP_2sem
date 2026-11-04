import { useState } from 'react';

import { errorMessage, login } from './api';

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);

    try {
      onLogin(await login(form.email.trim(), form.password));
    } catch (err) {
      setError(errorMessage(err));
      setSending(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Вход</h2>
      <p className="hint">Войдите, чтобы добавлять и редактировать объявления</p>

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        autoComplete="username"
        required
      />

      <label htmlFor="login-password">Пароль</label>
      <input
        id="login-password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        autoComplete="current-password"
        required
      />

      {error && <span className="error">{error}</span>}

      <div className="actions">
        <button type="submit" className="primary" disabled={sending}>
          {sending ? 'Вход…' : 'Войти'}
        </button>
      </div>
      <p className="hint">
        Демо: admin@example.com / admin123, alexey@example.com / password123
      </p>
    </form>
  );
}
