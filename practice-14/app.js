const STORAGE_KEY = "practice13_todos";
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

function loadTodos() {
  const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  list.innerHTML = items.map((text) => `<li>${text}</li>`).join("");
}

function saveTodos(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function addTodo(text) {
  const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  items.push(text);
  saveTodos(items);
  loadTodos();
}

form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

loadTodos();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Service Worker registered", reg.scope))
      .catch((err) => console.error("Service Worker registration failed", err));
  });
}
