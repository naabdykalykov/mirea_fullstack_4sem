import { useState } from "react";
import "./AuthPage.scss";

export default function LoginPage({ onSwitchPage, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Введите email и пароль");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onLogin({ email: trimmedEmail, password: trimmedPassword });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка входа";
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
          <div className="auth-header__right">Вход</div>
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Вход в аккаунт</h1>
            <p className="auth-subtitle">Используйте e-mail и пароль для входа.</p>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className="auth-actions">
                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={loading}
                >
                  {loading ? "Вход..." : "Войти"}
                </button>
                <div className="auth-alt">
                  Нет аккаунта?{" "}
                  <button
                    type="button"
                    className="auth-link"
                    onClick={onSwitchPage}
                  >
                    Зарегистрироваться
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
