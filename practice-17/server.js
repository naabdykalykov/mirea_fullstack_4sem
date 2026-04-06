const path = require("path");
const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const socketIo = require("socket.io");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const vapidKeysPath = path.join(__dirname, "vapid-keys.json");

const isValidVapidPublicKey = (key = "") => /^[A-Za-z0-9_-]{87}$/.test(key);
const isValidVapidPrivateKey = (key = "") => /^[A-Za-z0-9_-]{43}$/.test(key);

let vapidKeys = null;

if (
  isValidVapidPublicKey(process.env.VAPID_PUBLIC_KEY || "") &&
  isValidVapidPrivateKey(process.env.VAPID_PRIVATE_KEY || "")
) {
  vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  };
} else if (fs.existsSync(vapidKeysPath)) {
  try {
    const fromFile = JSON.parse(fs.readFileSync(vapidKeysPath, "utf8"));
    if (
      isValidVapidPublicKey(fromFile?.publicKey) &&
      isValidVapidPrivateKey(fromFile?.privateKey)
    ) {
      vapidKeys = fromFile;
      console.log("Загружены постоянные VAPID ключи из vapid-keys.json");
    }
  } catch (err) {
    console.warn("Не удалось прочитать vapid-keys.json:", err.message);
  }
}

if (!vapidKeys) {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(vapidKeysPath, JSON.stringify(vapidKeys, null, 2), "utf8");
  console.warn(
    "VAPID ключи не найдены. Сгенерированы и сохранены в vapid-keys.json",
  );
}

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./")));

let subscriptions = [];
const reminders = new Map(); // id -> { timeoutId, text, reminderTime }

const certPath = path.join(__dirname, "localhost.pem");
const keyPath = path.join(__dirname, "localhost-key.pem");

const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);
const server = useHttps
  ? https.createServer(
      { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) },
      app,
    )
  : http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Клиент подключён:", socket.id);

  socket.on("newTask", (task) => {
    io.emit("taskAdded", task);
    const payload = JSON.stringify({ title: "Новая задача", body: task.text });
    subscriptions.forEach((sub) => {
      webpush
        .sendNotification(sub, payload)
        .catch((err) => console.error("Push error:", err));
    });
  });

  socket.on("newReminder", (reminder) => {
    const { id, text, reminderTime } = reminder || {};
    if (!id || !text || !reminderTime) return;

    if (reminders.has(id)) {
      clearTimeout(reminders.get(id).timeoutId);
    }

    const delay = reminderTime - Date.now();
    if (delay <= 0) return;

    const timeoutId = setTimeout(() => {
      const payload = JSON.stringify({
        title: "!!! Напоминание",
        body: text,
        reminderId: id,
      });
      subscriptions.forEach((sub) => {
        webpush
          .sendNotification(sub, payload)
          .catch((err) => console.error("Push error:", err));
      });
      reminders.delete(id);
    }, delay);

    reminders.set(id, { timeoutId, text, reminderTime });
  });

  socket.on("disconnect", () => {
    console.log("Клиент отключён:", socket.id);
  });
});

app.post("/subscribe", (req, res) => {
  const sub = req.body;
  if (!sub?.endpoint) {
    return res.status(400).json({ message: "Некорректная подписка" });
  }
  const exists = subscriptions.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    subscriptions.push(sub);
  }
  res.status(exists ? 200 : 201).json({ message: "Подписка сохранена" });
});

app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);
  res.status(200).json({ message: "Подписка удалена" });
});

app.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/snooze", (req, res) => {
  const reminderId = Number.parseInt(req.query.reminderId, 10);
  if (!reminderId || !reminders.has(reminderId)) {
    return res.status(404).json({ error: "Reminder not found" });
  }

  const reminder = reminders.get(reminderId);
  clearTimeout(reminder.timeoutId);

  const FIVE_MIN = 5 * 60 * 1000;
  const newReminderTime = Date.now() + FIVE_MIN;
  const timeoutId = setTimeout(() => {
    const payload = JSON.stringify({
      title: "Напоминание отложено",
      body: reminder.text,
      reminderId,
    });
    subscriptions.forEach((sub) => {
      webpush
        .sendNotification(sub, payload)
        .catch((err) => console.error("Push error:", err));
    });
    reminders.delete(reminderId);
  }, FIVE_MIN);

  reminders.set(reminderId, {
    timeoutId,
    text: reminder.text,
    reminderTime: newReminderTime,
  });

  res.status(200).json({ message: "Reminder snoozed for 5 minutes" });
});

const DEFAULT_PORT = 3001;
const requestedPort = Number(process.env.PORT) || DEFAULT_PORT;
const maxAttempts = process.env.PORT ? 1 : 10;

function listenWithFallback(port, attemptsLeft) {
  const onError = (err) => {
    server.removeListener("listening", onListening);

    if (err.code === "EADDRINUSE" && attemptsLeft > 1) {
      const nextPort = port + 1;
      console.warn(`Порт ${port} занят. Пробую ${nextPort}...`);
      listenWithFallback(nextPort, attemptsLeft - 1);
      return;
    }

    if (err.code === "EADDRINUSE") {
      console.error(
        `Порт ${port} уже занят. Остановите предыдущий процесс или запустите сервер на другом порту:`,
      );
      console.error("PowerShell: $env:PORT=3002; npm start");
      process.exit(1);
    }

    console.error("Ошибка запуска сервера:", err);
    process.exit(1);
  };

  const onListening = () => {
    server.removeListener("error", onError);
    const protocol = useHttps ? "https" : "http";
    const activePort = server.address()?.port ?? port;
    console.log(`Сервер запущен на ${protocol}://localhost:${activePort}`);
    if (!useHttps) {
      console.log(
        "⚠️  HTTPS не включён. Создайте localhost.pem и localhost-key.pem через mkcert для защищённого режима.",
      );
    }
  };

  server.once("error", onError);
  server.once("listening", onListening);
  server.listen(port);
}

listenWithFallback(requestedPort, maxAttempts);
