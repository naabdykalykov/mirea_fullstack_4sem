const { redisClient } = require("../redisClient.js");

const USERS_CACHE_TTL = 60; // 1 минута
const PRODUCTS_CACHE_TTL = 600; // 10 минут

function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json({
          source: "cache",
          data: JSON.parse(cachedData),
        });
      }

      req.cacheKey = key;
      req.cacheTTL = ttl;
      next();
    } catch (err) {
      console.error("Cache read error:", err.message);
      next();
    }
  };
}

async function saveToCache(key, data, ttl) {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (err) {
    console.error("Cache save error:", err.message);
  }
}

async function invalidateUsersCache(userId = null) {
  try {
    await redisClient.del("users:all");
    if (userId !== null && userId !== undefined) {
      await redisClient.del(`users:${userId}`);
    }
  } catch (err) {
    console.error("Users cache invalidate error:", err.message);
  }
}

async function invalidateProductsCache(productId = null) {
  try {
    await redisClient.del("products:all");
    if (productId !== null && productId !== undefined) {
      await redisClient.del(`products:${productId}`);
    }
  } catch (err) {
    console.error("Products cache invalidate error:", err.message);
  }
}

module.exports = {
  cacheMiddleware,
  saveToCache,
  invalidateUsersCache,
  invalidateProductsCache,
  USERS_CACHE_TTL,
  PRODUCTS_CACHE_TTL,
};
