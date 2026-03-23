import { api, setTokens } from "./http";

export async function registerUser(payload) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await api.post("/api/auth/login", payload);
  const { accessToken: at, refreshToken: rt, user } = data || {};
  if (at && rt) {
    setTokens(at, rt);
  }
  return user;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

