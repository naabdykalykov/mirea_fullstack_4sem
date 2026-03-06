export default function ProductItem({ product, onEdit, onDelete }) {
  const { id, name, category, description, price, stock, rating, images } = product;
  const inStock = stock > 0;
  const preview = Array.isArray(images) && images.length > 0 ? images[0] : null;
  const displayRating = rating != null ? Number(rating).toFixed(1) : null;

  return (
    <div className="productRow">
      <div className="productMain">
        {preview && (
          <div className="productImageWrapper">
            <img src={preview} alt={name} className="productImage" />
          </div>
        )}

        <div className="productInfo">
          <div className="productHeader">
            <div className="productTitle">
              <div className="productName">{name}</div>
              {category && <div className="productCategory">{category}</div>}
            </div>

            <div className="productMeta">
              <div className="productPrice">
                {new Intl.NumberFormat("ru-RU").format(price)} ₽
              </div>
              {displayRating && (
                <div className="productRating" aria-label={`Рейтинг ${displayRating} из 5`}>
                  ★ {displayRating}
                </div>
              )}
            </div>
          </div>

          {description && (
            <div className="productDescription" title={description}>
              {description}
            </div>
          )}

          <div className="productFooter">
            <div className={`productStock ${inStock ? "" : "productStock--out"}`}>
              {inStock ? `В наличии: ${stock}` : "Нет в наличии"}
            </div>
            <div className="productId">#{id}</div>
          </div>
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
