const path = require("path");
const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const socketIo = require("socket.io");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

// VAPID ключи (сгенерированы локально)
const vapidKeys = {
  publicKey:
    "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEj28xqegSKWwyUhn3_A9TQZVCekNYRy7uuPgaVWtgV8rr_6jSn0lDJ3g3yJCFAZWdKdngimooIzZpBaLf0Bjsjw",
  privateKey:
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgvzMdyinew6xXQttd1RXE4oe3mySAzZTaYlQYaGMdfbShRANCAASPbzGp6BIpbDJSGff8D1NBlUJ6Q1hHLu64-BpVa2BXyuv_qNKfSUMneDfIkIUBlZ0p2eCKaigjNmkFot_QGOyP",
};

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

  socket.on("disconnect", () => {
    console.log("Клиент отключён:", socket.id);
  });
});

app.post("/subscribe", (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({ message: "Подписка сохранена" });
});

app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);
  res.status(200).json({ message: "Подписка удалена" });
});

const PORT = 3001;
server.listen(PORT, () => {
  const protocol = useHttps ? "https" : "http";
  console.log(`Сервер запущен на ${protocol}://localhost:${PORT}`);
  if (!useHttps) {
    console.log(
      "⚠️  HTTPS не включён. Создайте localhost.pem и localhost-key.pem через mkcert для защищённого режима.",
    );
  }
});
