const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../data/users.js");

const {
  JWT_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
} = require("../configs.js");

const refreshTokens = new Set();

function generateAccessToken(user) {
  const payload = { userId: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

function generateRefreshToken(user) {
  const payload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
  refreshTokens.add(token);
  return token;
}

const requireAuth = require("../middleware/requireAuth.js");

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: Пользователь (без пароля)
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор
 *         email:
 *           type: string
 *           format: email
 *           description: Email (логин)
 *         first_name:
 *           type: string
 *           description: Имя
 *         last_name:
 *           type: string
 *           description: Фамилия
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       description: Тело запроса регистрации
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       description: Тело запроса входа
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     ErrorMessage:
 *       type: object
 *       description: Сообщение об ошибке
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создаёт нового пользователя. Пароль хранится в виде хеша.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные или email уже занят
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */

router.post("/register", async (req, res, next) => {
  try {
    const { email, first_name, last_name, password, role } = req.body || {};
    if (
      !email ||
      typeof email !== "string" ||
      !first_name ||
      typeof first_name !== "string" ||
      !last_name ||
      typeof last_name !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Неверные данные регистрации" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({ message: "Некорректный email" });
    }

    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const id = users.length ? Math.max(...users.map((u) => u.id || 0)) + 1 : 1;

    const user = {
      id,
      email: normalizedEmail,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      role: role || "user",
      isBlocked: false,
      passwordHash,
    };

    users.push(user);

    res.status(201).json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     description: Проверка email и пароля. В ответ возвращаются данные пользователя без пароля.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные запроса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       401:
 *         description: Неверный email или пароль
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Неверные данные для входа" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ message: "Неверный refresh токен" });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.userId);

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (e) {
    return res.status(401).json({ message: "Неверный refresh токен" });
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Текущий пользователь
 *     description: Возвращает объект пользователя по токену из заголовка Authorization. Без токена или с неверным токеном — 401.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успех, объект пользователя (без пароля)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Нет токена или токен недействителен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
