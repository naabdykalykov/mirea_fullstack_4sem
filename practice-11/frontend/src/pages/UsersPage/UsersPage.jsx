import { useEffect, useState } from "react";
import "./UsersPage.scss";
import { fetchUsers, updateUser, blockUser } from "../../api";

export default function UsersPage({ user, onLogout, onGoProducts }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e?.response?.data?.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (id, patch) => {
    try {
      const updated = await updateUser(id, patch);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      alert(e?.response?.data?.message || "Ошибка сохранения");
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Заблокировать пользователя?")) return;
    try {
      await blockUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isBlocked: true } : u)));
    } catch (e) {
      alert(e?.response?.data?.message || "Ошибка блокировки");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="app-message">Загрузка пользователей...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">TechStore Admin</div>
          <div className="header__right">
            <span className="userBadge">{user.email} · {user.role}</span>
            <button className="btn" onClick={onGoProducts}>Товары</button>
            <button className="btn btn--secondary" onClick={onLogout}>Выйти</button>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Пользователи</h1>
            {error && <div className="alert">{error}</div>}
          </div>
          <div className="usersTable">
            <div className="usersRow usersRow--head">
              <div>ID</div>
              <div>Email</div>
              <div>Имя</div>
              <div>Фамилия</div>
              <div>Роль</div>
              <div>Статус</div>
              <div>Действия</div>
            </div>
            {users.map((u) => (
              <div key={u.id} className="usersRow">
                <div>#{u.id}</div>
                <div>{u.email}</div>
                <div>{u.first_name}</div>
                <div>{u.last_name}</div>
                <div>
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                  >
                    <option value="user">user</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className={u.isBlocked ? "status status--blocked" : "status status--active"}>
                  {u.isBlocked ? "Заблокирован" : "Активен"}
                </div>
                <div className="usersActions">
                  <button
                    className="btn"
                    onClick={() => handleUpdate(u.id, { isBlocked: !u.isBlocked })}
                  >
                    {u.isBlocked ? "Разблокировать" : "Блокировать"}
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={() => handleBlock(u.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="footer__inner">© {new Date().getFullYear()} TechStore</div>
      </footer>
    </div>
  );
}
