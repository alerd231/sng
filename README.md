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

Для dev можно использовать `ADMIN_PASSWORD`, но для production нужно перейти на `ADMIN_PASSWORD_HASH`.
