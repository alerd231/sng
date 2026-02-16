import 'dotenv/config'
import crypto from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const env = {
  port: Number(process.env.ADMIN_API_PORT ?? 8787),
  allowedOrigin: process.env.ADMIN_ALLOWED_ORIGIN ?? 'http://localhost:5173',
  username: process.env.ADMIN_USERNAME ?? 'admin',
  passwordHash: process.env.ADMIN_PASSWORD_HASH ?? '',
  password: process.env.ADMIN_PASSWORD ?? '',
  accessSecret: process.env.ADMIN_JWT_SECRET ?? '',
  refreshSecret: process.env.ADMIN_REFRESH_SECRET ?? '',
  secureCookie: process.env.NODE_ENV === 'production',
}

const allowedOrigins = env.allowedOrigin
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

if (!Number.isFinite(env.port) || env.port <= 0) {
  throw new Error('ADMIN_API_PORT должен быть положительным числом')
}

if (!env.accessSecret) {
  console.warn('[admin-api] ADMIN_JWT_SECRET не задан. Используется временный ключ (только dev).')
  env.accessSecret = crypto.randomBytes(48).toString('hex')
}

if (!env.refreshSecret) {
  console.warn('[admin-api] ADMIN_REFRESH_SECRET не задан. Используется временный ключ (только dev).')
  env.refreshSecret = crypto.randomBytes(48).toString('hex')
}

if (!env.passwordHash) {
  if (!env.password) {
    throw new Error('Укажите ADMIN_PASSWORD_HASH или ADMIN_PASSWORD в .env')
  }

  env.passwordHash = bcrypt.hashSync(env.password, 12)
  console.warn('[admin-api] Используется ADMIN_PASSWORD (dev). Для production задайте ADMIN_PASSWORD_HASH.')
}

const accessTtlSec = 60 * 15
const refreshTtlSec = 60 * 60 * 24 * 7
const refreshCookieName = 'sng_admin_refresh'

const projectsPath = path.resolve(rootDir, 'src/data/projects.json')
const vacanciesPath = path.resolve(rootDir, 'src/data/vacancies.json')
const documentsPath = path.resolve(rootDir, 'src/data/documents.json')
const uploadsDirPath = path.resolve(rootDir, 'public/uploads')

const runtimeSessions = new Map()

const idPattern = /^[a-z0-9-]{2,120}$/i
const slugPattern = /^[a-z0-9-]{2,160}$/

const projectFileSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  size: z.string().min(1).max(40),
  url: z.string().min(1).max(500),
})

const projectPassportSchema = z.object({
  period: z.string().min(1).max(200),
  status: z.string().min(1).max(200),
  customer: z.string().min(1).max(300),
  contractor: z.string().min(1).max(300),
  inn: z.string().min(1).max(24),
  location: z.string().min(1).max(260),
  objectType: z.string().min(1).max(180),
  workScope: z.string().min(1).max(280),
})

const projectSchema = z.object({
  id: z.string().regex(idPattern),
  slug: z.string().regex(slugPattern),
  year: z.number().int().min(2000).max(2100),
  title: z.string().min(3).max(300),
  shortTitle: z.string().min(3).max(200),
  excerpt: z.string().min(3).max(1500),
  heroImage: z.string().min(1).max(500),
  gallery: z.array(z.string().min(1).max(500)).max(40),
  region: z.string().min(1).max(160),
  objectType: z.string().min(1).max(160),
  workTypes: z.array(z.string().min(1).max(160)).max(20),
  passport: projectPassportSchema,
  tasks: z.array(z.string().min(1).max(2000)).max(80),
  solutions: z.array(z.string().min(1).max(2000)).max(80),
  results: z.array(z.string().min(1).max(2000)).max(80),
  files: z.array(projectFileSchema).max(40),
  relatedCompetencyIds: z.array(z.string().regex(idPattern)).max(40),
})

const vacancySchema = z.object({
  id: z.string().regex(idPattern),
  slug: z.string().regex(slugPattern),
  title: z.string().min(3).max(220),
  city: z.string().min(1).max(120),
  format: z.enum(['office', 'hybrid', 'remote']),
  dept: z.string().min(1).max(180),
  employment: z.enum(['full', 'part', 'rotation']),
  experience: z.enum(['0', '1-3', '3-6', '6+']),
  salaryFrom: z.number().int().min(0).max(1000000000),
  salaryTo: z.number().int().min(0).max(1000000000),
  currency: z.literal('RUB'),
  postedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.boolean(),
  keywords: z.array(z.string().min(1).max(120)).max(40),
  summary: z.string().min(3).max(2000),
  responsibilities: z.array(z.string().min(1).max(2000)).max(100),
  requirements: z.array(z.string().min(1).max(2000)).max(100),
  conditions: z.array(z.string().min(1).max(2000)).max(100),
}).superRefine((item, ctx) => {
  if (item.salaryTo < item.salaryFrom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['salaryTo'],
      message: 'salaryTo не может быть меньше salaryFrom',
    })
  }
})

const documentCategoryEnum = z.enum([
  'Учредительные',
  'СРО и лицензии',
  'Политики и регламенты',
  'Сертификаты',
  'Презентационные материалы',
])

const documentSchema = z.object({
  id: z.string().regex(idPattern),
  title: z.string().min(3).max(260),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string().min(1).max(30),
  size: z.string().min(1).max(30),
  category: documentCategoryEnum,
  url: z.string().min(1).max(500),
})

const loginSchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(300),
})

const assetUploadSchema = z.object({
  filename: z.string().min(1).max(180),
  dataUrl: z.string().min(30).max(10_000_000),
})

const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
])

const safeJsonParse = (raw, label) => {
  try {
    const normalized = typeof raw === 'string' ? raw.replace(/^\uFEFF/, '') : raw
    return JSON.parse(normalized)
  } catch {
    throw new Error(`Не удалось прочитать ${label}: некорректный JSON`)
  }
}

const readJsonArray = async (filePath, label) => {
  const raw = await readFile(filePath, 'utf8')
  const data = safeJsonParse(raw, label)

  if (!Array.isArray(data)) {
    throw new Error(`${label} должен быть массивом`)
  }

  return data
}

const writeJsonArray = async (filePath, value) => {
  const tempPath = `${filePath}.tmp-${Date.now()}-${Math.floor(Math.random() * 100000)}`
  const payload = `${JSON.stringify(value, null, 2)}\n`
  try {
    await writeFile(tempPath, payload, 'utf8')
    await rename(tempPath, filePath)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EROFS') {
      throw new Error('READ_ONLY_STORAGE')
    }

    throw error
  }
}

const writeBinaryFile = async (filePath, value) => {
  try {
    await writeFile(filePath, value)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EROFS') {
      throw new Error('READ_ONLY_STORAGE')
    }

    throw error
  }
}

const issueMessage = (error) => {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('; ')
  }

  return error instanceof Error ? error.message : 'Некорректные данные'
}

const sanitizeBaseName = (input) => {
  const base = path.basename(input).replace(/\.[^/.]+$/, '')
  const safe = base
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return safe || 'image'
}

const auditLog = ({ action, resource, id, actor }) => {
  const timestamp = new Date().toISOString()
  console.info(`[admin-api][audit] ${timestamp} actor=${actor} action=${action} resource=${resource} id=${id}`)
}

const createAccessToken = (username) => {
  return jwt.sign(
    { typ: 'access', role: 'admin' },
    env.accessSecret,
    { subject: username, expiresIn: accessTtlSec, issuer: 'site-sng-admin' },
  )
}

const createRefreshToken = (username, sid) => {
  return jwt.sign(
    { typ: 'refresh', sid },
    env.refreshSecret,
    { subject: username, expiresIn: refreshTtlSec, issuer: 'site-sng-admin' },
  )
}

const setRefreshCookie = (res, token) => {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.secureCookie,
    path: '/api/admin/auth',
    maxAge: refreshTtlSec * 1000,
  })
}

const clearRefreshCookie = (res) => {
  res.clearCookie(refreshCookieName, {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.secureCookie,
    path: '/api/admin/auth',
  })
}

const rotateSession = (username, oldSid) => {
  if (oldSid) {
    runtimeSessions.delete(oldSid)
  }

  const sid = crypto.randomUUID()
  runtimeSessions.set(sid, {
    username,
    expiresAt: Date.now() + refreshTtlSec * 1000,
  })

  return sid
}

const verifyAccess = (token) => {
  const decoded = jwt.verify(token, env.accessSecret, { issuer: 'site-sng-admin' })

  if (!decoded || typeof decoded !== 'object' || decoded.typ !== 'access') {
    throw new Error('INVALID_TOKEN_TYPE')
  }

  return decoded
}

const verifyRefresh = (token) => {
  const decoded = jwt.verify(token, env.refreshSecret, { issuer: 'site-sng-admin' })

  if (!decoded || typeof decoded !== 'object' || decoded.typ !== 'refresh' || typeof decoded.sid !== 'string') {
    throw new Error('INVALID_TOKEN_TYPE')
  }

  return decoded
}

const authenticate = (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' })
  }

  const token = header.slice('Bearer '.length)

  try {
    const decoded = verifyAccess(token)
    req.admin = {
      username: typeof decoded.sub === 'string' ? decoded.sub : env.username,
    }
    return next()
  } catch {
    return res.status(401).json({ message: 'Недействительный токен доступа' })
  }
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

app.use((req, res, next) => {
  const origin = req.headers.origin
  const requestHost = req.headers.host
  const forwardedProto = req.headers['x-forwarded-proto']
  const protocol = typeof forwardedProto === 'string' ? forwardedProto : 'https'
  const sameOrigin = origin && requestHost ? origin === `${protocol}://${requestHost}` : false

  if (!origin) {
    return next()
  }

  if (sameOrigin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Vary', 'Origin')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204)
    }

    return next()
  }

  return res.status(403).json({ message: 'Origin запрещен политикой безопасности' })
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Слишком много запросов. Повторите позже.' },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Слишком много попыток входа. Повторите позже.' },
})

app.use(apiLimiter)
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  return res.json({ ok: true })
})

app.post('/api/admin/auth/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ message: issueMessage(parsed.error) })
  }

  const { username, password } = parsed.data

  if (username !== env.username) {
    return res.status(401).json({ message: 'Неверный логин или пароль' })
  }

  const match = await bcrypt.compare(password, env.passwordHash)

  if (!match) {
    return res.status(401).json({ message: 'Неверный логин или пароль' })
  }

  const sid = rotateSession(username)
  const accessToken = createAccessToken(username)
  const refreshToken = createRefreshToken(username, sid)
  setRefreshCookie(res, refreshToken)
  auditLog({ action: 'login', resource: 'auth', id: sid, actor: username })

  return res.json({
    accessToken,
    expiresIn: accessTtlSec,
    user: {
      username,
      role: 'admin',
    },
  })
})

app.post('/api/admin/auth/refresh', (req, res) => {
  const token = req.cookies?.[refreshCookieName]

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Отсутствует refresh cookie' })
  }

  try {
    const decoded = verifyRefresh(token)
    const username = typeof decoded.sub === 'string' ? decoded.sub : ''

    if (!username) {
      return res.status(401).json({ message: 'Некорректный refresh token' })
    }

    const session = runtimeSessions.get(decoded.sid)

    if (!session || session.username !== username || session.expiresAt <= Date.now()) {
      runtimeSessions.delete(decoded.sid)
      clearRefreshCookie(res)
      return res.status(401).json({ message: 'Сессия истекла. Выполните вход повторно.' })
    }

    const newSid = rotateSession(username, decoded.sid)
    const accessToken = createAccessToken(username)
    const refreshToken = createRefreshToken(username, newSid)
    setRefreshCookie(res, refreshToken)

    return res.json({
      accessToken,
      expiresIn: accessTtlSec,
      user: {
        username,
        role: 'admin',
      },
    })
  } catch {
    clearRefreshCookie(res)
    return res.status(401).json({ message: 'Недействительный refresh token' })
  }
})

app.post('/api/admin/auth/logout', (req, res) => {
  const token = req.cookies?.[refreshCookieName]

  if (token && typeof token === 'string') {
    try {
      const decoded = verifyRefresh(token)
      runtimeSessions.delete(decoded.sid)
    } catch {
      // ignore invalid token
    }
  }

  clearRefreshCookie(res)
  auditLog({ action: 'logout', resource: 'auth', id: 'session', actor: 'admin' })
  return res.json({ ok: true })
})

app.post('/api/admin/assets/upload', authenticate, async (req, res) => {
  const parsed = assetUploadSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ message: issueMessage(parsed.error) })
  }

  const { filename, dataUrl } = parsed.data
  const match = /^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)

  if (!match) {
    return res.status(400).json({ message: 'Некорректный формат dataUrl' })
  }

  const mimeType = match[1].toLowerCase()
  const encoded = match[2]
  const extension = allowedImageTypes.get(mimeType)

  if (!extension) {
    return res.status(400).json({ message: 'Поддерживаются только JPG, PNG, WEBP, AVIF, GIF' })
  }

  let buffer
  try {
    buffer = Buffer.from(encoded, 'base64')
  } catch {
    return res.status(400).json({ message: 'Не удалось декодировать изображение' })
  }

  if (!buffer.length) {
    return res.status(400).json({ message: 'Файл пустой' })
  }

  const maxBytes = 6 * 1024 * 1024
  if (buffer.length > maxBytes) {
    return res.status(413).json({ message: 'Размер файла превышает 6MB' })
  }

  await mkdir(uploadsDirPath, { recursive: true })

  const safeName = sanitizeBaseName(filename)
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}.${extension}`
  const fullPath = path.resolve(uploadsDirPath, uniqueName)
  await writeBinaryFile(fullPath, buffer)

  auditLog({
    action: 'upload',
    resource: 'assets',
    id: uniqueName,
    actor: req.admin?.username ?? 'admin',
  })

  return res.status(201).json({
    url: `/uploads/${uniqueName}`,
    size: buffer.length,
    type: mimeType,
  })
})

app.get('/api/public/projects', async (_req, res) => {
  const list = await readJsonArray(projectsPath, 'projects.json')
  return res.json(list)
})

app.get('/api/public/vacancies', async (_req, res) => {
  const list = await readJsonArray(vacanciesPath, 'vacancies.json')
  return res.json(list)
})

app.get('/api/public/documents', async (_req, res) => {
  const list = await readJsonArray(documentsPath, 'documents.json')
  return res.json(list)
})

const createCrudHandlers = ({
  key,
  filePath,
  schema,
  uniqueFields = [],
}) => {
  app.get(`/api/admin/${key}`, authenticate, async (_req, res) => {
    const list = await readJsonArray(filePath, `${key}.json`)
    return res.json(list)
  })

  app.post(`/api/admin/${key}`, authenticate, async (req, res) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({ message: issueMessage(parsed.error) })
    }

    const nextItem = parsed.data
    const list = await readJsonArray(filePath, `${key}.json`)

    if (list.some((item) => item.id === nextItem.id)) {
      return res.status(409).json({ message: `Элемент с id=${nextItem.id} уже существует` })
    }

    for (const field of uniqueFields) {
      if (list.some((item) => item[field] === nextItem[field])) {
        return res.status(409).json({ message: `Поле ${field} должно быть уникальным` })
      }
    }

    const nextList = [...list, nextItem]
    await writeJsonArray(filePath, nextList)
    auditLog({ action: 'create', resource: key, id: nextItem.id, actor: req.admin?.username ?? 'admin' })
    return res.status(201).json(nextItem)
  })

  app.put(`/api/admin/${key}/:id`, authenticate, async (req, res) => {
    const id = String(req.params.id ?? '')
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({ message: issueMessage(parsed.error) })
    }

    const updated = parsed.data

    if (updated.id !== id) {
      return res.status(400).json({ message: 'ID в URL и payload должен совпадать' })
    }

    const list = await readJsonArray(filePath, `${key}.json`)
    const index = list.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Элемент не найден' })
    }

    for (const field of uniqueFields) {
      if (list.some((item, itemIndex) => itemIndex !== index && item[field] === updated[field])) {
        return res.status(409).json({ message: `Поле ${field} должно быть уникальным` })
      }
    }

    const nextList = [...list]
    nextList[index] = updated
    await writeJsonArray(filePath, nextList)
    auditLog({ action: 'update', resource: key, id, actor: req.admin?.username ?? 'admin' })
    return res.json(updated)
  })

  app.delete(`/api/admin/${key}/:id`, authenticate, async (req, res) => {
    const id = String(req.params.id ?? '')
    const list = await readJsonArray(filePath, `${key}.json`)
    const index = list.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Элемент не найден' })
    }

    const [removed] = list.splice(index, 1)
    await writeJsonArray(filePath, list)
    auditLog({ action: 'delete', resource: key, id, actor: req.admin?.username ?? 'admin' })
    return res.json({ ok: true, removed })
  })
}

createCrudHandlers({
  key: 'projects',
  filePath: projectsPath,
  schema: projectSchema,
  uniqueFields: ['slug'],
})

createCrudHandlers({
  key: 'vacancies',
  filePath: vacanciesPath,
  schema: vacancySchema,
  uniqueFields: ['slug'],
})

createCrudHandlers({
  key: 'documents',
  filePath: documentsPath,
  schema: documentSchema,
})

app.use((error, _req, res, _next) => {
  if (error instanceof Error && error.message === 'READ_ONLY_STORAGE') {
    return res.status(503).json({
      message: 'Запись недоступна в read-only окружении. Для Vercel подключите внешнюю БД/хранилище.',
    })
  }

  console.error('[admin-api] unexpected error', error)
  return res.status(500).json({ message: 'Внутренняя ошибка сервера' })
})

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

if (!isServerless) {
  app.listen(env.port, () => {
    console.log(`[admin-api] listening on http://localhost:${env.port}`)
  })
}

export default app
