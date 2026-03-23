import { useState, useEffect } from "react";
import "./ProductsPage.scss";
import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import * as api from "../../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    api.getProducts().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const openModal = (mode, product = null) => {
    setModalMode(mode);
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const onApi = (promise, onSuccess) => {
    promise.then(onSuccess).catch((e) => alert(e?.response?.data?.message || "Ошибка")).finally(closeModal);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Удалить товар?")) return;
    api.deleteProduct(id).then(() => setProducts((p) => p.filter((x) => x.id !== id))).catch((e) => alert(e?.response?.data?.message || "Ошибка"));
  };

  const handleSubmitModal = (payload) => {
    if (modalMode === "create") onApi(api.createProduct(payload), (created) => setProducts((p) => [...p, created]));
    else onApi(api.updateProduct(payload.id, payload), (updated) => setProducts((p) => p.map((x) => (x.id === updated.id ? updated : x))));
  };

  if (loading) return <div className="page"><div className="app-message">Загрузка...</div></div>;

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">TechStore</div>
          <div className="header__right">React</div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Товары</h1>
            <button type="button" className="btn btn--primary" onClick={() => openModal("create")}>+ Создать</button>
          </div>
          <ProductsList products={products} onEdit={(p) => openModal("edit", p)} onDelete={handleDelete} />
        </div>
      </main>
      <footer className="footer">
        <div className="footer__inner">© {new Date().getFullYear()} TechStore</div>
      </footer>
      <ProductModal open={modalOpen} mode={modalMode} initialProduct={editingProduct} onClose={closeModal} onSubmit={handleSubmitModal} />
    </div>
  );
}