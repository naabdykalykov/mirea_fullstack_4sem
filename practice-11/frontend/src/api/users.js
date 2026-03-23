import { api } from "./http";

export async function fetchUsers() {
  const { data } = await api.get("/api/users");
  return data;
}

export async function fetchUser(id) {
  const { data } = await api.get(`/api/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/api/users/${id}`, payload);
  return data;
}

export async function blockUser(id) {
  await api.delete(`/api/users/${id}`);
}
