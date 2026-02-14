interface TelegramApplicationPayload {
  vacancyTitle: string
  vacancySlug: string
  fullName: string
  email: string
  phone: string
  message: string
  city: string
  dept: string
  employment: string
  format: string
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const sanitize = (value: string): string => value.trim()

const isValidToken = (token: string): boolean => /^[0-9]+:[A-Za-z0-9_-]{20,}$/.test(token)

const formatText = (payload: TelegramApplicationPayload): string => {
  const lines = [
    '<b>Новый отклик с сайта СтройНефтеГаз</b>',
    '',
    `<b>Вакансия:</b> ${escapeHtml(payload.vacancyTitle)}`,
    `<b>Ссылка:</b> https://stroineftegaz.ru/careers/${escapeHtml(payload.vacancySlug)}`,
    `<b>Город:</b> ${escapeHtml(payload.city)}`,
    `<b>Отдел:</b> ${escapeHtml(payload.dept)}`,
    `<b>Формат:</b> ${escapeHtml(payload.format)}`,
    `<b>Занятость:</b> ${escapeHtml(payload.employment)}`,
    '',
    `<b>ФИО:</b> ${escapeHtml(payload.fullName)}`,
    `<b>Email:</b> ${escapeHtml(payload.email)}`,
    `<b>Телефон:</b> ${escapeHtml(payload.phone)}`,
    `<b>Комментарий:</b> ${escapeHtml(payload.message || 'Не указан')}`,
  ]

  return lines.join('\n')
}

export const sendApplicationToTelegram = async (
  payload: TelegramApplicationPayload,
): Promise<void> => {
  const token = sanitize(import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? '')
  const chatId = sanitize(import.meta.env.VITE_TELEGRAM_CHAT_ID ?? '')
  const threadId = sanitize(import.meta.env.VITE_TELEGRAM_THREAD_ID ?? '')

  if (!token || !chatId) {
    throw new Error('TELEGRAM_ENV_MISSING')
  }

  if (!isValidToken(token)) {
    throw new Error('TELEGRAM_ENV_INVALID')
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`
  const requestBody = {
    chat_id: chatId,
    text: formatText(payload),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    message_thread_id: threadId ? Number(threadId) : undefined,
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error('TELEGRAM_SEND_FAILED')
    }

    const result = (await response.json()) as { ok?: boolean }

    if (!result.ok) {
      throw new Error('TELEGRAM_SEND_FAILED')
    }
  } catch {
    const url = new URL(endpoint)
    url.searchParams.set('chat_id', chatId)
    url.searchParams.set('text', requestBody.text)
    url.searchParams.set('parse_mode', 'HTML')
    url.searchParams.set('disable_web_page_preview', 'true')

    if (threadId) {
      url.searchParams.set('message_thread_id', threadId)
    }

    await fetch(url.toString(), {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
    })
  }
}
