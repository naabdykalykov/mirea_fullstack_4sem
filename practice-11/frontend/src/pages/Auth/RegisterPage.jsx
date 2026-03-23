import { useState } from "react";
import "./AuthPage.scss";

export default function RegisterPage({ onSwitchPage, onRegister }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
    };

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.password) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (payload.password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    if (passwordConfirm.trim() !== payload.password) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onRegister(payload);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка регистрации";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-header__inner">
          <div className="auth-brand">TechStore</div>
          <div className="auth-header__right">Регистрация</div>
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Создание аккаунта</h1>
            <p className="auth-subtitle">Заполните поля ниже, чтобы зарегистрироваться в системе.</p>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-label">
                Имя
                <input
                  className="auth-input"
                  type="text"
                  name="first_name"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="auth-label">
                Фамилия
                <input
                  className="auth-input"
                  type="text"
                  name="last_name"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
              <label className="auth-label">
                E-mail
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="auth-label">
                Пароль
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="auth-label">
                Подтверждение пароля
                <input
                  className="auth-input"
                  type="password"
                  name="passwordConfirm"
                  placeholder="Повторите пароль"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </label>
              <div className="auth-actions">
                <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
                  {loading ? "Регистрация..." : "Зарегистрироваться"}
                </button>
                <div className="auth-alt">
                  Уже есть аккаунт?{" "}
                  <button
                    type="button"
                    className="auth-link"
                    onClick={onSwitchPage}
                  >
                    Войти
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <footer className="auth-footer">
        <div className="auth-footer__inner">
          © {new Date().getFullYear()} TechStore · Учебный проект
        </div>
      </footer>
    </div>
  );
}
