const express = require("express");
const router = express.Router();
const products = require("../data/products.js");

router.get("/", (req, res) => {
  res.json(products);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  res.json(product);
});

router.post("/", (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;
  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const newProduct = {
    id,
    name: name || "",
    category: category || "",
    description: description || "",
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    rating: rating != null ? Number(rating) : null,
    image: image || "",
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  const { name, category, description, price, stock, rating, image } = req.body;
  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = rating != null ? Number(rating) : null;
  if (image !== undefined) product.image = image;
  res.json(product);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  products.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
