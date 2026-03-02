const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();
const products = require("../data/products.js");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || "";
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Можно загружать только изображения"));
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория
 *         description:
 *           type: string
 *           description: Описание
 *         price:
 *           type: number
 *           description: Цена
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *         rating:
 *           type: number
 *           nullable: true
 *           description: Рейтинг (1-5)
 *         images:
 *           type: array
 *           description: Список URL изображений товара
 *           items:
 *             type: string
 *     ProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         rating:
 *           type: number
 *           nullable: true
 *         images:
 *           type: array
 *           description: Список URL изображений товара
 *           items:
 *             type: string
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Успешный ответ, массив товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", (req, res) => {
  res.json(products);
});

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  res.json(product);
});

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post("/", (req, res) => {
  const { name, category, description, price, stock, rating, images } = req.body;
  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const newProduct = {
    id,
    name: name || "",
    category: category || "",
    description: description || "",
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    rating: rating != null ? Number(rating) : null,
    images: Array.isArray(images) ? images : [],
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар по ID (частичное обновление)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Товар обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  const { name, category, description, price, stock, rating, images } = req.body;
  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = rating != null ? Number(rating) : null;
  if (images !== undefined && Array.isArray(images)) product.images = images;
  res.json(product);
});

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар по ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Товар удалён (тело ответа пустое)
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  const product = products[index];

  if (product && Array.isArray(product.images)) {
    product.images.forEach((url) => {
      if (typeof url === "string" && url.includes("/uploads/")) {
        try {
          const fileName = url.split("/").pop();
          if (fileName) {
            const filePath = path.join(uploadsDir, fileName);
            fs.unlink(filePath, (err) => {
              if (err && err.code !== "ENOENT") {
                console.error("Ошибка при удалении файла изображения товара:", err);
              }
            });
          }
        } catch (e) {
          console.error("Ошибка при обработке пути к изображению товара:", e);
        }
      }
    });
  }

  products.splice(index, 1);
  res.status(204).send();
});

/**
 * @openapi
 * /api/products/{id}/images:
 *   get:
 *     summary: Получить список изображений товара
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список URL изображений товара
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id/images", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }
  res.json(Array.isArray(product.images) ? product.images : []);
});

/**
 * @openapi
 * /api/products/{id}/images:
 *   post:
 *     summary: Загрузить одно или несколько изображений для товара
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Изображения успешно загружены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Ошибка валидации файла
 *       404:
 *         description: Товар не найден
 */
router.post("/:id/images", upload.array("images", 10), (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Товар не найден" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Не переданы файлы изображений" });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const newImages = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);

  if (!Array.isArray(product.images)) {
    product.images = [];
  }
  product.images.push(...newImages);

  res.status(201).json({ images: product.images });
});

/**
 * @openapi
 * /api/products/{id}/images/{imageIndex}:
 *   delete:
 *     summary: Удалить изображение товара по индексу
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Изображение удалено
 *       404:
 *         description: Товар или изображение не найдены
 */
router.delete("/:id/images/:imageIndex", (req, res) => {
  const id = Number(req.params.id);
  const imageIndex = Number(req.params.imageIndex);

  const product = products.find((p) => p.id === id);
  if (!product || !Array.isArray(product.images)) {
    return res.status(404).json({ message: "Товар или изображение не найдены" });
  }

  if (!Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= product.images.length) {
    return res.status(404).json({ message: "Изображение не найдено" });
  }

  const [removed] = product.images.splice(imageIndex, 1);

  if (removed && typeof removed === "string" && removed.includes("/uploads/")) {
    try {
      const fileName = removed.split("/").pop();
      if (fileName) {
        const filePath = path.join(uploadsDir, fileName);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Ошибка при удалении файла изображения:", err);
          }
        });
      }
    } catch (e) {
      console.error("Ошибка при обработке пути к изображению:", e);
    }
  }

  res.status(204).send();
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Размер файла превышает 5 МБ" });
    }
    return res.status(400).json({ message: err.message || "Ошибка загрузки файла" });
  }
  if (err && err.message === "Можно загружать только изображения") {
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

module.exports = router;
