export default function ProductItem({ product, onEdit, onDelete }) {
  const { id, name, category, description, price, stock, images } = product;
  const inStock = stock > 0;
  const preview = Array.isArray(images) && images.length > 0 ? images[0] : null;

  return (
    <div className="productRow">
      <div className="productMain">
        {preview && (
          <div className="productImageWrapper">
            <img src={preview} alt={name} className="productImage" />
          </div>
        )}
        <div className="productId">#{id}</div>
        <div>
          <div className="productName">{name}</div>
          {description && (
            <div className="productDescription" title={description}>
              {description}
            </div>
          )}
        </div>
        {category && <div className="productCategory">{category}</div>}
        <div className="productPrice">
          {new Intl.NumberFormat("ru-RU").format(price)} ₽
        </div>
        <div className={`productStock ${inStock ? "" : "productStock--out"}`}>
          {inStock ? `В наличии: ${stock}` : "Нет в наличии"}
        </div>
      </div>
      <div className="productActions">
        <button type="button" className="btn" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button type="button" className="btn btn--danger" onClick={() => onDelete(id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}
