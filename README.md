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
