import "./AuthPage.scss";

export default function RegisterPage({ onSwitchPage }) {
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
            <p className="auth-subtitle">
              Заполните поля ниже, чтобы зарегистрироваться в системе.
            </p>
            <form className="auth-form">
              <label className="auth-label">
                Имя
                <input
                  className="auth-input"
                  type="text"
                  name="first_name"
                  placeholder="Иван"
                />
              </label>
              <label className="auth-label">
                Фамилия
                <input
                  className="auth-input"
                  type="text"
                  name="last_name"
                  placeholder="Иванов"
                />
              </label>
              <label className="auth-label">
                E-mail
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                />
              </label>
              <label className="auth-label">
                Пароль
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  placeholder="Минимум 6 символов"
                />
              </label>
              <label className="auth-label">
                Подтверждение пароля
                <input
                  className="auth-input"
                  type="password"
                  name="passwordConfirm"
                  placeholder="Повторите пароль"
                />
              </label>
              <div className="auth-actions">
                <button
                  type="button"
                  className="auth-btn auth-btn--primary"
                  onClick={onSwitchPage}
                >
                  Зарегистрироваться
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
