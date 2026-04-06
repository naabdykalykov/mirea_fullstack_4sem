const socket = io(); // Socket.IO на тот же origin

const contentDiv = document.getElementById("app-content");
const homeBtn = document.getElementById("home-btn");
const aboutBtn = document.getElementById("about-btn");
const enablePushBtn = document.getElementById("enable-push");
const disablePushBtn = document.getElementById("disable-push");

let vapidPublicKeyCache = null;

function setActiveButton(activeId) {
  [homeBtn, aboutBtn].forEach((btn) => btn.classList.remove("active"));
  document.getElementById(activeId).classList.add("active");
}

async function loadContent(page) {
  try {
    const response = await fetch(`./content/${page}.html`);
    const html = await response.text();
    contentDiv.innerHTML = html;
    if (page === "home") {
      initNotes();
    }
  } catch (err) {
    contentDiv.innerHTML =
      '<p class="is-center text-error">Ошибка загрузки страницы.</p>';
    console.error(err);
  }
}

homeBtn.addEventListener("click", () => {
  setActiveButton("home-btn");
  loadContent("home");
});

aboutBtn.addEventListener("click", () => {
  setActiveButton("about-btn");
  loadContent("about");
});

loadContent("home");

function loadNotesList(listEl) {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  listEl.innerHTML = notes
    .map((note) => {
      const text = typeof note === "string" ? note : note.text;
      return `<li class="card" style="margin-bottom: 0.5rem; padding: 0.5rem;">${text}</li>`;
    })
    .join("");
}

function initNotes() {
  const form = document.getElementById("note-form");
  const input = document.getElementById("note-input");
  const list = document.getElementById("notes-list");
  if (!form || !input || !list) return;

  function addNote(text) {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    const newNote = { id: Date.now(), text, timestamp: Date.now() };
    notes.push(newNote);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotesList(list);
    socket.emit("newTask", { text, timestamp: newNote.timestamp });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      addNote(text);
      input.value = "";
    }
  });

  loadNotesList(list);
}

socket.on("taskAdded", (task) => {
  console.log("Задача от другого клиента:", task);
  const notification = document.createElement("div");
  notification.textContent = `Новая задача: ${task.text}`;
  notification.style.cssText = `
    position: fixed; top: 10px; right: 10px;
    background: #4285f4; color: white; padding: 1rem;
    border-radius: 5px; z-index: 1000; box-shadow: 0 2px 6px rgba(0,0,0,.2);
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
});

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const vapidPublicKey = await getVapidPublicKey();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  await fetch("/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
  console.log("Подписка на push отправлена");
}

async function getVapidPublicKey() {
  if (vapidPublicKeyCache) return vapidPublicKeyCache;

  const response = await fetch("/vapid-public-key");
  if (!response.ok) {
    throw new Error("Не удалось получить VAPID public key с сервера.");
  }

  const data = await response.json();
  if (
    !data?.publicKey ||
    !/^[A-Za-z0-9_-]{87}$/.test(String(data.publicKey))
  ) {
    throw new Error("Сервер вернул некорректный VAPID public key.");
  }

  vapidPublicKeyCache = data.publicKey;
  return vapidPublicKeyCache;
}

async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await fetch("/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
    console.log("Отписка выполнена");
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      console.log("SW registered:", reg.scope);

      if (enablePushBtn && disablePushBtn) {
        const current = await reg.pushManager.getSubscription();
        if (current) {
          enablePushBtn.style.display = "none";
          disablePushBtn.style.display = "inline-block";
        }

        enablePushBtn.addEventListener("click", async () => {
          if (Notification.permission === "denied") {
            alert("Уведомления запрещены. Разрешите их в настройках браузера.");
            return;
          }
          if (Notification.permission === "default") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
              alert("Необходимо разрешить уведомления.");
              return;
            }
          }
          try {
            await subscribeToPush();
            enablePushBtn.style.display = "none";
            disablePushBtn.style.display = "inline-block";
          } catch (err) {
            console.error("Ошибка подписки на push:", err);
            alert("Не удалось включить push-уведомления. Проверь консоль.");
          }
        });

        disablePushBtn.addEventListener("click", async () => {
          await unsubscribeFromPush();
          disablePushBtn.style.display = "none";
          enablePushBtn.style.display = "inline-block";
        });
      }
    } catch (err) {
      console.log("SW registration failed:", err);
    }
  });
}
