# Практикум «Фронтенд и бэкенд», 4 семестр

| Папка | Содержание |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `practice-1` | Карточка товара: HTML + SCSS (переменные, миксины, БЭМ-подобная разметка). Открыть `index.html` в браузере. |
| `practice-2` | Express, порт 3000. CRUD по `/products` (GET, GET/:id, POST, PATCH, DELETE), данные в памяти. `npm install && npm start` |
| `practice-3` | То же, что practice-2 — закрепление. `npm install && node app.js` |
| `practice-4` | **Backend:** Express :3001, CORS, `/api/products` (CRUD), данные в `data/products.js`. **Frontend:** React, Vite, Axios; страница товаров с модальным окном. Backend: `practice-4/backend` → `npm start`. Frontend: `practice-4/frontend` → `npm run dev`. |
| `practice-5` | Как practice-4 + OpenAPI 3.0 (swagger-jsdoc по JSDoc в `routes/products.js`) и Swagger UI на `/api-docs`. Backend: `practice-5/backend` → `npm start`. Документация: http://localhost:3001/api-docs |
| `practice-6` | **Backend:** Express :3001, multer загрузки файлов, Swagger UI. **Frontend:** React + Vite. Запуск: backend `npm install && npm start`, frontend `npm install && npm run dev` (http://localhost:5173). |
| `practice-7` | То же, что practice-6 + регистрация/логин на bcrypt (без JWT), Swagger. Запуск: backend `npm install && npm start` (:3001), frontend `npm install && npm run dev` (:5173). |
| `practice-8` | JWT access token в auth, Swagger. Backend :3001 `npm install && npm start`, frontend React/Vite `npm install && npm run dev` (:5173). |
| `practice-9` | Access + refresh token (`/refresh`), Swagger. Backend :3001 `npm install && npm start`, frontend Vite `npm install && npm run dev` (:5173). |
| `practice-10` | Refresh token + нормализация email/доп. валидация, Swagger. Backend :3001 `npm install && npm start`, frontend Vite `npm install && npm run dev` (:5173). |
| `practice-11` | Роли (user/seller/admin) на CRUD, middleware requireAuth/requireRole, Swagger. Backend :3001 `npm install && npm start`, frontend Vite `npm install && npm run dev` (:5173). |
| `practice-12` | Файл-заглушка, практика = предыдущие задания вместе. |
| `practice-13` | Offline ToDo + Service Worker (cache-only). Открыть `index.html` в браузере. |
| `practice-14` | PWA (manifest + icons), offline cache, Service Worker. Открыть `index.html`. |
| `practice-15` | SPA заметок, ленивая подгрузка content, SW app-shell + dynamic cache. Открыть `index.html`. |
| `practice-16` | Заметки + Socket.IO синхронизация + Web Push (VAPID). `npm install && npm start`, HTTPS localhost, порт 3001 (авто переход до 3003). |
| `practice-17` | Напоминания: планирование push + snooze 5 мин, Service Worker actions. Запуск как в practice-16 (HTTPS, `npm install && npm start`, 3001→3003). |

**Стек:** HTML, SCSS, React, Vite, Axios, Node.js, Express, CORS, swagger-jsdoc, swagger-ui-express, multer, bcrypt, jsonwebtoken, Socket.IO, Service Worker/PWA, Web Push (VAPID).
