import { useEffect, useState } from "react";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import {
  clearTokens,
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "./api";

export default function App() {
  const [page, setPage] = useState("login"); // "login" | "register" | "products" | "users"
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await fetchCurrentUser();
        if (!cancelled) {
          setUser(u);
          setPage("products");
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
    setPage("products");
  };

  const handleRegister = async (payload) => {
    await registerUser(payload);
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
    if (page === "users" && user.role === "admin") {
      return (
        <UsersPage
          user={user}
          onLogout={handleLogout}
          onGoProducts={() => setPage("products")}
        />
      );
    }
    return (
      <ProductsPage
        user={user}
        onLogout={handleLogout}
        onGoUsers={() => setPage("users")}
      />
    );
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
