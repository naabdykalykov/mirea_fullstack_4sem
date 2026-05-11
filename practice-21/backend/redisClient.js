const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  socket: {
    reconnectStrategy: (retries) =>
      retries > 3
        ? new Error("Redis недоступен")
        : Math.min(retries * 200, 1000),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

async function initRedis() {
  await redisClient.connect();
  console.log("Redis connected");
}

module.exports = { redisClient, initRedis };
