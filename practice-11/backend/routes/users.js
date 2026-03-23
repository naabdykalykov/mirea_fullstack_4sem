const express = require("express");
const users = require("../data/users.js");
const requireAuth = require("../middleware/requireAuth.js");
const requireRole = require("../middleware/requireRole.js");

const router = express.Router();

// GET /api/users - admin only
router.get("/", requireAuth, requireRole(["admin"]), (req, res) => {
  const safeUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
    isBlocked: !!u.isBlocked,
  }));
  res.json(safeUsers);
});

// GET /api/users/:id - admin only
router.get("/:id", requireAuth, requireRole(["admin"]), (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    isBlocked: !!user.isBlocked,
  });
});

// PUT /api/users/:id - admin only
router.put("/:id", requireAuth, requireRole(["admin"]), (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  const { email, first_name, last_name, role, isBlocked } = req.body || {};

  if (email !== undefined) {
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "Некорректный email" });
    }
    const normalized = email.trim().toLowerCase();
    const exists = users.some((u) => u.email === normalized && u.id !== id);
    if (exists) {
      return res.status(400).json({ message: "Email уже используется" });
    }
    user.email = normalized;
  }
  if (first_name !== undefined) {
    if (typeof first_name !== "string" || !first_name.trim()) {
      return res.status(400).json({ message: "Некорректное имя" });
    }
    user.first_name = first_name.trim();
  }
  if (last_name !== undefined) {
    if (typeof last_name !== "string" || !last_name.trim()) {
      return res.status(400).json({ message: "Некорректная фамилия" });
    }
    user.last_name = last_name.trim();
  }
  if (role !== undefined) {
    const allowedRoles = ["user", "seller", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Некорректная роль" });
    }
    user.role = role;
  }
  if (isBlocked !== undefined) {
    user.isBlocked = !!isBlocked;
  }

  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    isBlocked: !!user.isBlocked,
  });
});

// DELETE /api/users/:id - admin only, marks as blocked
router.delete("/:id", requireAuth, requireRole(["admin"]), (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  user.isBlocked = true;
  res.status(204).send();
});

module.exports = router;
