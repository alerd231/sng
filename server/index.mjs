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
import { put } from '@vercel/blob'
import { createClient } from '@vercel/kv'
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
const experiencePath = path.resolve(rootDir, 'src/data/experience.json')
const siteSettingsPath = path.resolve(rootDir, 'src/data/siteSettings.json')
const uploadsDirPath = path.resolve(rootDir, 'public/uploads')
const isServerlessRuntime = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
const blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? ''
const hasBlobStorage = Boolean(blobToken)
const kvUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? ''
const kvToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? ''
const hasKvStorage = Boolean(kvUrl && kvToken)
const kvClient = hasKvStorage ? createClient({ url: kvUrl, token: kvToken }) : null
const projectsStorageKey = 'sng:projects'
const siteSettingsStorageKey = 'sng:site-settings'

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

const careersSettingsSchema = z.object({
  vacanciesEnabled: z.boolean(),
  attractionTitle: z.string().min(3).max(200),
  attractionText: z.string().min(3).max(3000),
  attractionHighlights: z.array(z.string().min(2).max(180)).min(1).max(12),
})

const siteSettingsSchema = z.object({
  careers: careersSettingsSchema,
})

const defaultSiteSettings = {
  careers: {
    vacanciesEnabled: true,
    attractionTitle: 'Присоединяйтесь к команде СтройНефтеГаз',
    attractionText:
      'Мы формируем кадровый резерв для будущих производственных запусков. Предлагаем конкурентный доход, прозрачные премиальные механики и долгосрочную занятость на инфраструктурных проектах.',
    attractionHighlights: [
      'Конкурентный уровень оплаты труда и премии за результат',
      'Официальное трудоустройство и стабильные выплаты',
      'Работа на стратегически значимых промышленных объектах',
      'Профессиональный рост в команде с сильной инженерной экспертизой',
    ],
  },
}

const siteSettingsPartialSchema = siteSettingsSchema.deepPartial()

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

const readJsonRecord = async (filePath, label) => {
  const raw = await readFile(filePath, 'utf8')
  const data = safeJsonParse(raw, label)

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} должен быть объектом`)
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

const writeJsonRecord = async (filePath, value) => {
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

const readCollection = async ({ filePath, label, storageKey }) => {
  if (!hasKvStorage) {
    return readJsonArray(filePath, label)
  }

  try {
    if (!kvClient) {
      throw new Error('KV_UNAVAILABLE')
    }

    const payload = await kvClient.get(storageKey)

    if (Array.isArray(payload)) {
      return payload
    }

    if (payload === null) {
      const initialData = await readJsonArray(filePath, label)
      await kvClient.set(storageKey, initialData)
      return initialData
    }

    if (typeof payload === 'string') {
      const parsed = safeJsonParse(payload, label)

      if (Array.isArray(parsed)) {
        return parsed
      }
    }

    throw new Error('KV_INVALID_PAYLOAD')
  } catch (error) {
    if (error instanceof Error && error.message === 'KV_INVALID_PAYLOAD') {
      throw error
    }

    throw new Error('KV_UNAVAILABLE')
  }
}

const writeCollection = async ({ filePath, storageKey }, value) => {
  if (!hasKvStorage) {
    await writeJsonArray(filePath, value)
    return
  }

  try {
    if (!kvClient) {
      throw new Error('KV_UNAVAILABLE')
    }

    await kvClient.set(storageKey, value)
  } catch {
    throw new Error('KV_UNAVAILABLE')
  }
}

const normalizeSiteSettings = (value) => {
  const parsedPartial = siteSettingsPartialSchema.safeParse(value)

  if (!parsedPartial.success) {
    return defaultSiteSettings
  }

  const merged = {
    careers: {
      ...defaultSiteSettings.careers,
      ...(parsedPartial.data.careers ?? {}),
    },
  }

  const normalized = {
    careers: {
      ...merged.careers,
      attractionTitle: normalizeSpace(merged.careers.attractionTitle),
      attractionText: normalizeSpace(merged.careers.attractionText),
      attractionHighlights: Array.isArray(merged.careers.attractionHighlights)
        ? merged.careers.attractionHighlights
          .map((item) => normalizeSpace(item))
          .filter(Boolean)
        : [],
    },
  }

  const validated = siteSettingsSchema.safeParse(normalized)
  if (!validated.success) {
    return defaultSiteSettings
  }

  return validated.data
}

const readSiteSettings = async () => {
  const readFromFile = async () => {
    try {
      const fileValue = await readJsonRecord(siteSettingsPath, 'siteSettings.json')
      return normalizeSiteSettings(fileValue)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return defaultSiteSettings
      }

      throw error
    }
  }

  if (!hasKvStorage) {
    return readFromFile()
  }

  try {
    if (!kvClient) {
      throw new Error('KV_UNAVAILABLE')
    }

    const payload = await kvClient.get(siteSettingsStorageKey)

    if (payload === null) {
      const initialData = await readFromFile()
      await kvClient.set(siteSettingsStorageKey, initialData)
      return initialData
    }

    if (typeof payload === 'string') {
      const parsed = safeJsonParse(payload, 'site-settings')
      return normalizeSiteSettings(parsed)
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return normalizeSiteSettings(payload)
    }

    throw new Error('KV_INVALID_PAYLOAD')
  } catch (error) {
    if (error instanceof Error && error.message === 'KV_INVALID_PAYLOAD') {
      throw error
    }

    throw new Error('KV_UNAVAILABLE')
  }
}

const writeSiteSettings = async (value) => {
  const normalized = normalizeSiteSettings(value)

  if (!hasKvStorage) {
    await writeJsonRecord(siteSettingsPath, normalized)
    return normalized
  }

  try {
    if (!kvClient) {
      throw new Error('KV_UNAVAILABLE')
    }

    await kvClient.set(siteSettingsStorageKey, normalized)
    return normalized
  } catch {
    throw new Error('KV_UNAVAILABLE')
  }
}

const defaultExperienceProjectImage = '/images/background-project.png'
const defaultContractorName = 'ООО «СтройНефтеГаз»'
const defaultInn = '1655282573'

const normalizeSpace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const truncateText = (value, maxLength) => {
  const normalized = normalizeSpace(value)

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

const toSafeToken = (value, fallback) => {
  const safe = normalizeSpace(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return safe || fallback
}

const extractCustomerName = (customer) => {
  const [name] = String(customer ?? '').split(',')
  return normalizeSpace(name || customer || 'Заказчик')
}

const extractInn = (customer) => String(customer ?? '').match(/\b\d{10}\b/)?.[0] ?? defaultInn

const detectProjectObjectType = (subject, work) => {
  const source = `${subject} ${work}`.toLowerCase()

  if (source.includes('грс')) return 'ГРС'
  if (source.includes('гис')) return 'ГИС'
  if (source.includes('м-7') || source.includes('автомобильной дороги')) return 'Автодорога'
  if (source.includes('нпс') || source.includes('лпдс') || source.includes('рну')) {
    return 'Нефтепроводная инфраструктура'
  }
  if (source.includes('кс')) return 'Компрессорная станция'
  if (source.includes('итсо') || source.includes('тсо') || source.includes('охраны')) {
    return 'ИТСО/ТСО'
  }

  return 'Промышленный объект'
}

const detectProjectRegion = (subject) => {
  const text = String(subject ?? '').toLowerCase()

  if (text.includes('татарстан') || text.includes('казань') || text.includes('альметьев')) {
    return 'Республика Татарстан'
  }
  if (text.includes('чебоксар') || text.includes('чуваш')) return 'Чувашская Республика'
  if (text.includes('удмурт') || text.includes('увин')) return 'Удмуртская Республика'
  if (text.includes('перм') || text.includes('чайковск')) return 'Пермский край'
  if (text.includes('иванов')) return 'Ивановская область'
  if (text.includes('владимир')) return 'Владимирская область'
  if (text.includes('нижегород') || text.includes('нижний новгород')) {
    return 'Нижегородская область'
  }
  if (text.includes('марий')) return 'Республика Марий Эл'
  if (text.includes('башкир') || text.includes('салават') || text.includes('туймаз')) {
    return 'Республика Башкортостан'
  }
  if (text.includes('курган')) return 'Курганская область'

  return 'Регионы РФ'
}

const detectProjectWorkTypes = (subject, work) => {
  const source = `${subject} ${work}`.toLowerCase()
  const workTypes = []

  if (source.includes('пнр') || source.includes('пуско')) workTypes.push('ПНР')
  if (
    source.includes('автомат') ||
    source.includes('асу') ||
    source.includes('кип') ||
    source.includes('телемехан')
  ) {
    workTypes.push('Автоматизация')
  }
  if (source.includes('шеф')) workTypes.push('Шеф-монтаж')
  if (source.includes('монтаж') || source.includes('строител')) workTypes.push('СМР')
  if (source.includes('итсо')) workTypes.push('ИТСО')
  if (source.includes('тсо') || source.includes('сигнализац')) workTypes.push('ТСО')

  if (!workTypes.length) {
    const firstSegment = normalizeSpace(String(work ?? '').split(',')[0] || '')
    return [firstSegment || 'Комплекс работ']
  }

  return [...new Set(workTypes)]
}

const detectProjectCompetencyIds = (subject, work) => {
  const source = `${subject} ${work}`.toLowerCase()
  const competencyIds = []

  if (source.includes('шеф')) competencyIds.push('comp-supervision')
  if (source.includes('пнр') || source.includes('пуско')) competencyIds.push('comp-commissioning')
  if (
    source.includes('автомат') ||
    source.includes('асу') ||
    source.includes('кип') ||
    source.includes('телемехан')
  ) {
    competencyIds.push('comp-automation')
  }
  if (
    source.includes('итсо') ||
    source.includes('тсо') ||
    source.includes('сигнализац') ||
    source.includes('охраны')
  ) {
    competencyIds.push('comp-security')
  }
  if (source.includes('монтаж') || source.includes('строител')) competencyIds.push('comp-construction')

  if (!competencyIds.length) {
    competencyIds.push('comp-construction')
  }

  return [...new Set(competencyIds)]
}

const createProjectFromExperienceRow = (row, index) => {
  const normalizedRowId = toSafeToken(row?.id, `exp-${index + 1}`)
  const year = Number.isFinite(Number(row?.year)) ? Number(row.year) : new Date().getFullYear()
  const subject = normalizeSpace(row?.subject || 'Проект из реестра опыта')
  const work = normalizeSpace(row?.work || 'Комплекс работ')
  const customer = normalizeSpace(row?.customer || 'Заказчик')
  const title = truncateText(subject, 220)
  const objectType = detectProjectObjectType(subject, work)
  const workTypes = detectProjectWorkTypes(subject, work)
  const region = detectProjectRegion(subject)
  const customerName = truncateText(extractCustomerName(customer), 300)

  return {
    id: `exp-project-${normalizedRowId}`,
    slug: `experience-${normalizedRowId}`,
    year,
    title,
    shortTitle: truncateText(workTypes.join(', '), 200),
    excerpt: truncateText(`Выполнены работы: ${work}. Заказчик: ${customerName}.`, 500),
    heroImage: defaultExperienceProjectImage,
    gallery: [defaultExperienceProjectImage],
    region,
    objectType,
    workTypes,
    passport: {
      period: String(year),
      status: 'Завершен',
      customer: customerName,
      contractor: defaultContractorName,
      inn: extractInn(customer),
      location: truncateText(subject, 260),
      objectType: truncateText(objectType, 180),
      workScope: truncateText(work, 280),
    },
    tasks: [
      'Выполнить строительно-монтажные и/или наладочные работы в согласованные сроки.',
      'Обеспечить соответствие работ техническим требованиям заказчика.',
      'Подготовить комплект исполнительной и отчетной документации.',
    ],
    solutions: [
      'Сформирован поэтапный план производства работ и технического контроля.',
      'Организована координация инженерных и производственных служб на площадке.',
      'Проведены необходимые испытания и верификация параметров.',
    ],
    results: [
      'Работы завершены и переданы заказчику в установленном порядке.',
      'Подтверждена работоспособность систем по итогам приемо-сдаточных процедур.',
      'Сформирован комплект материалов для тендерного и эксплуатационного архива.',
    ],
    files: [],
    relatedCompetencyIds: detectProjectCompetencyIds(subject, work),
  }
}

const mergeProjectsWithExperience = (projects, experienceRows) => {
  const generatedProjects = experienceRows.map(createProjectFromExperienceRow)
  const existingIds = new Set(projects.map((item) => item.id))
  const existingSlugs = new Set(projects.map((item) => item.slug))
  const additions = []

  for (const item of generatedProjects) {
    if (existingIds.has(item.id) || existingSlugs.has(item.slug)) {
      continue
    }

    additions.push(item)
    existingIds.add(item.id)
    existingSlugs.add(item.slug)
  }

  if (!additions.length) {
    return { list: projects, added: 0 }
  }

  const merged = [...projects, ...additions].sort((left, right) => Number(right.year) - Number(left.year))
  return { list: merged, added: additions.length }
}

const readProjectsCollection = async () => {
  const list = await readCollection({
    filePath: projectsPath,
    label: 'projects.json',
    storageKey: projectsStorageKey,
  })

  let experienceRows = []

  try {
    experienceRows = await readJsonArray(experiencePath, 'experience.json')
  } catch (error) {
    console.error('[admin-api] failed to read experience.json', error)
    return list
  }

  const { list: mergedList, added } = mergeProjectsWithExperience(list, experienceRows)

  if (!added) {
    return mergedList
  }

  try {
    await writeCollection(
      { filePath: projectsPath, storageKey: projectsStorageKey },
      mergedList,
    )
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'READ_ONLY_STORAGE' || error.message === 'KV_UNAVAILABLE')
    ) {
      return mergedList
    }

    throw error
  }

  return mergedList
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

const uploadImageAsset = async ({ filename, extension, mimeType, buffer }) => {
  const safeName = sanitizeBaseName(filename)
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}.${extension}`

  if (hasBlobStorage) {
    try {
      const blob = await put(`uploads/${uniqueName}`, buffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: mimeType,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
        token: blobToken,
      })

      return {
        id: uniqueName,
        provider: 'blob',
        url: blob.url,
      }
    } catch (error) {
      console.error('[admin-api] blob upload failed', error)
      throw new Error('BLOB_UPLOAD_FAILED')
    }
  }

  if (isServerlessRuntime) {
    throw new Error('BLOB_NOT_CONFIGURED')
  }

  await mkdir(uploadsDirPath, { recursive: true })
  const fullPath = path.resolve(uploadsDirPath, uniqueName)
  await writeBinaryFile(fullPath, buffer)

  return {
    id: uniqueName,
    provider: 'local',
    url: `/uploads/${uniqueName}`,
  }
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

  const uploaded = await uploadImageAsset({
    filename,
    extension,
    mimeType,
    buffer,
  })

  auditLog({
    action: 'upload',
    resource: 'assets',
    id: uploaded.id,
    actor: req.admin?.username ?? 'admin',
  })

  return res.status(201).json({
    url: uploaded.url,
    size: buffer.length,
    storage: uploaded.provider,
    type: mimeType,
  })
})

app.get('/api/public/projects', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  const list = await readProjectsCollection()
  return res.json(list)
})

app.get('/api/public/vacancies', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  const list = await readCollection({
    filePath: vacanciesPath,
    label: 'vacancies.json',
    storageKey: 'sng:vacancies',
  })
  return res.json(list)
})

app.get('/api/public/documents', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  const list = await readCollection({
    filePath: documentsPath,
    label: 'documents.json',
    storageKey: 'sng:documents',
  })
  return res.json(list)
})

app.get('/api/public/site-settings', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  const settings = await readSiteSettings()
  return res.json(settings)
})

app.get('/api/admin/settings', authenticate, async (_req, res) => {
  const settings = await readSiteSettings()
  return res.json(settings)
})

app.put('/api/admin/settings', authenticate, async (req, res) => {
  const parsed = siteSettingsSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ message: issueMessage(parsed.error) })
  }

  const saved = await writeSiteSettings(parsed.data)
  auditLog({
    action: 'update',
    resource: 'settings',
    id: 'site-settings',
    actor: req.admin?.username ?? 'admin',
  })
  return res.json(saved)
})

const createCrudHandlers = ({
  key,
  filePath,
  storageKey,
  schema,
  uniqueFields = [],
  readList,
}) => {
  const getList = async () => {
    if (typeof readList === 'function') {
      return readList()
    }

    return readCollection({
      filePath,
      label: `${key}.json`,
      storageKey,
    })
  }

  app.get(`/api/admin/${key}`, authenticate, async (_req, res) => {
    const list = await getList()
    return res.json(list)
  })

  app.post(`/api/admin/${key}`, authenticate, async (req, res) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({ message: issueMessage(parsed.error) })
    }

    const nextItem = parsed.data
    const list = await getList()

    if (list.some((item) => item.id === nextItem.id)) {
      return res.status(409).json({ message: `Элемент с id=${nextItem.id} уже существует` })
    }

    for (const field of uniqueFields) {
      if (list.some((item) => item[field] === nextItem[field])) {
        return res.status(409).json({ message: `Поле ${field} должно быть уникальным` })
      }
    }

    const nextList = [...list, nextItem]
    await writeCollection({ filePath, storageKey }, nextList)
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

    const list = await getList()
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
    await writeCollection({ filePath, storageKey }, nextList)
    auditLog({ action: 'update', resource: key, id, actor: req.admin?.username ?? 'admin' })
    return res.json(updated)
  })

  app.delete(`/api/admin/${key}/:id`, authenticate, async (req, res) => {
    const id = String(req.params.id ?? '')
    const list = await getList()
    const index = list.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ message: 'Элемент не найден' })
    }

    const [removed] = list.splice(index, 1)
    await writeCollection({ filePath, storageKey }, list)
    auditLog({ action: 'delete', resource: key, id, actor: req.admin?.username ?? 'admin' })
    return res.json({ ok: true, removed })
  })
}

createCrudHandlers({
  key: 'projects',
  filePath: projectsPath,
  storageKey: projectsStorageKey,
  schema: projectSchema,
  uniqueFields: ['slug'],
  readList: readProjectsCollection,
})

createCrudHandlers({
  key: 'vacancies',
  filePath: vacanciesPath,
  storageKey: 'sng:vacancies',
  schema: vacancySchema,
  uniqueFields: ['slug'],
})

createCrudHandlers({
  key: 'documents',
  filePath: documentsPath,
  storageKey: 'sng:documents',
  schema: documentSchema,
})

app.use((error, _req, res, _next) => {
  if (error instanceof Error && error.message === 'READ_ONLY_STORAGE') {
    return res.status(503).json({
      message: 'Запись недоступна в read-only окружении. Для Vercel подключите Redis/KV или внешнюю БД.',
    })
  }

  if (error instanceof Error && error.message === 'KV_UNAVAILABLE') {
    return res.status(503).json({
      message: 'Хранилище KV недоступно. Проверьте переменные KV_REST_API_URL и KV_REST_API_TOKEN.',
    })
  }

  if (error instanceof Error && error.message === 'KV_INVALID_PAYLOAD') {
    return res.status(500).json({
      message: 'Данные в KV повреждены или имеют неверный формат.',
    })
  }

  if (error instanceof Error && error.message === 'BLOB_NOT_CONFIGURED') {
    return res.status(503).json({
      message: 'Хранилище Blob не настроено. Добавьте BLOB_READ_WRITE_TOKEN в переменные окружения Vercel.',
    })
  }

  if (error instanceof Error && error.message === 'BLOB_UPLOAD_FAILED') {
    return res.status(503).json({
      message: 'Не удалось загрузить файл в Blob Storage. Проверьте токен и настройки проекта Vercel.',
    })
  }

  console.error('[admin-api] unexpected error', error)
  return res.status(500).json({ message: 'Внутренняя ошибка сервера' })
})

if (!isServerlessRuntime) {
  app.listen(env.port, () => {
    console.log(`[admin-api] listening on http://localhost:${env.port}`)
  })
}

export default app
