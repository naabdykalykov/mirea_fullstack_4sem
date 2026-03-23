import { useEffect, useState } from "react";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import {
  clearTokens,
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "./api";

export default function App() {
  const [page, setPage] = useState("login"); // "login" | "register"
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await fetchCurrentUser();
        if (!cancelled) {
          setUser(u);
        }
      } catch {
        if (!cancelled) {
          clearTokens();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (payload) => {
    const u = await loginUser(payload);
    const profile = u || (await fetchCurrentUser());
    setUser(profile);
  };

  const handleRegister = async (payload) => {
    await registerUser(payload);
    // после успешной регистрации — сразу пробуем войти
    await handleLogin({ email: payload.email, password: payload.password });
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setPage("login");
  };

  if (checkingAuth) {
    return (
      <div className="page">
        <div className="app-message">Проверка авторизации...</div>
      </div>
    );
  }

  if (user) {
    return <ProductsPage user={user} onLogout={handleLogout} />;
  }

  if (page === "register") {
    return (
      <RegisterPage
        onSwitchPage={() => setPage("login")}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <LoginPage
      onSwitchPage={() => setPage("register")}
      onLogin={handleLogin}
    />
  );
}
