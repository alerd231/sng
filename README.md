# СтройНефтеГаз — корпоративный сайт

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run lint
npm run build
npm run preview
```

## Отправка откликов в Telegram

1. Скопируйте `.env.example` в `.env`.
2. Заполните переменные:
   - `VITE_TELEGRAM_BOT_TOKEN`
   - `VITE_TELEGRAM_CHAT_ID`
   - `VITE_TELEGRAM_THREAD_ID` (опционально)

После этого форма отклика на странице вакансии отправляет заявку в Telegram Bot API.

Примечание: для production рекомендуется отправка через backend-прокси, чтобы не хранить токен бота в клиентском коде.

## Админ-панель (CRUD)

Маршруты:
- `/admin/login` — вход администратора
- `/admin` — защищенная панель CRUD для:
  - проектов
  - вакансий
  - документов

Запуск (frontend + admin API):

```bash
npm run dev
```

Admin API работает на `http://localhost:8787` и проксируется через Vite на `/api`.

### Обязательные переменные безопасности

В `.env`:
- `ADMIN_API_PORT`
- `ADMIN_ALLOWED_ORIGIN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` (рекомендуется)
- `ADMIN_JWT_SECRET`
- `ADMIN_REFRESH_SECRET`
- `BLOB_READ_WRITE_TOKEN` (для загрузки изображений в admin на Vercel)
- Redis/KV переменные (для persistent CRUD на Vercel):
  - `KV_REST_API_URL` и `KV_REST_API_TOKEN`
  - или `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`

Для dev можно использовать `ADMIN_PASSWORD`, но для production нужно перейти на `ADMIN_PASSWORD_HASH`.

### Почему изменения не сохраняются на Vercel

Vercel выполняет serverless-функции в read-only окружении для файлов проекта, поэтому запись в `src/data/*.json` не персистентна.

В проекте включена поддержка KV:
- если заданы `KV_REST_API_URL` + `KV_REST_API_TOKEN` или `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, CRUD использует KV/Redis (данные сохраняются);
- если переменные не заданы, используется локальный JSON-режим (подходит для local dev).

Публичные страницы (`/projects`, `/documents`, `/careers` и карточки) читают данные через `/api/public/*`, поэтому изменения из админ-панели отображаются после сохранения.

Рекомендуется в Vercel подключить Redis-интеграцию (Upstash/Vercel Marketplace), после чего добавить переменные `KV_REST_API_URL` и `KV_REST_API_TOKEN` в Project Settings -> Environment Variables.

### Загрузка фото в админ-панели

- В редакторе админки есть блок `Загрузка фото`.
- Если задан `BLOB_READ_WRITE_TOKEN`, сервер загружает файл в Vercel Blob и возвращает публичный URL.
- Для локальной разработки (без Blob) используется fallback в `public/uploads`.
- Для проектов можно сразу подставить URL в `heroImage` или добавить в `gallery`.

Важно: на Vercel файловая система read-only, поэтому для загрузки изображений в production обязательно подключить Blob Storage и переменную `BLOB_READ_WRITE_TOKEN`.
