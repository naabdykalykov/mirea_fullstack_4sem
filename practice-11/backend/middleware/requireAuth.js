const jwt = require("jsonwebtoken");
const users = require("../data/users.js");
const { JWT_SECRET } = require("../configs.js");

function requireAuth(req, res, next) {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
}

module.exports = requireAuth;
