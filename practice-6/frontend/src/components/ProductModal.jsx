import { useEffect, useState } from "react";

const INIT = { name: "", category: "", description: "", price: "", stock: "" };

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [form, setForm] = useState(INIT);

  useEffect(() => {
    if (!open) return;
    const p = initialProduct;
    setForm({
      name: p?.name ?? "",
      category: p?.category ?? "",
      description: p?.description ?? "",
      price: p?.price != null ? String(p.price) : "",
      stock: p?.stock != null ? String(p.stock) : "",
    });
  }, [open, initialProduct]);

  if (!open) return null;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!name) return alert("Введите название");
    if (!Number.isFinite(price) || price < 0) return alert("Введите корректную цену (≥ 0)");
    if (!Number.isInteger(stock) || stock < 0) return alert("Введите количество (целое ≥ 0)");
    onSubmit({
      id: initialProduct?.id,
      name,
      category: form.category.trim(),
      description: form.description.trim(),
      price,
      stock,
    });
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">{mode === "edit" ? "Редактирование товара" : "Создание товара"}</div>
          <button type="button" className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">Название <input className="input" value={form.name} onChange={update("name")} placeholder="Смартфон X" autoFocus /></label>
          <label className="label">Категория <input className="input" value={form.category} onChange={update("category")} placeholder="Телефоны" /></label>
          <label className="label">Описание <input className="input" value={form.description} onChange={update("description")} placeholder="Краткое описание" /></label>
          <label className="label">Цена (₽) <input className="input" type="number" min="0" value={form.price} onChange={update("price")} placeholder="0" /></label>
          <label className="label">На складе <input className="input" type="number" min="0" step="1" value={form.stock} onChange={update("stock")} placeholder="0" /></label>
          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn--primary">{mode === "edit" ? "Сохранить" : "Создать"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
