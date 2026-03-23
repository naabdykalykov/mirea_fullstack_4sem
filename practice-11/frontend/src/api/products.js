import { api } from "./http";

export async function getProducts() {
  const { data } = await api.get("/api/products");
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post("/api/products", payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/api/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
}

