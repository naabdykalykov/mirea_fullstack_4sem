import ProductItem from "./ProductItem";

export default function ProductsList({ products, onEdit, onDelete }) {
  return (
    <div className={products.length ? "list" : "empty"}>
      {products.length
        ? products.map((p) => (
            <ProductItem key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />
          ))
        : "Товаров пока нет"}
    </div>
  );
}
