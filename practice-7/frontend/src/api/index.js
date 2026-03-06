import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const api = axios.create({ baseURL: API_URL });

export async function getProducts() {
  const { data } = await api.get("/api/products");
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post("/api/products", payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.patch(`/api/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
}
