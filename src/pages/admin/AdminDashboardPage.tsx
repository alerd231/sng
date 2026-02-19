import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../admin/AdminAuthProvider'
import { Seo } from '../../components/seo/Seo'
import { Button } from '../../components/ui/Button'
import type {
  DocumentCategory,
  DocumentItem,
  Project,
  ProjectFile,
  Vacancy,
} from '../../types/models'

type ResourceKey = 'projects' | 'vacancies' | 'documents'
type ResourceItem = Project | Vacancy | DocumentItem
type EditorView = 'form' | 'json'

const resources: Array<{ key: ResourceKey; label: string; description: string }> = [
  { key: 'projects', label: 'Проекты', description: 'Управление проектным портфелем' },
  { key: 'vacancies', label: 'Вакансии', description: 'Управление кадровыми позициями' },
  { key: 'documents', label: 'Документы', description: 'Управление библиотекой документов' },
]

const documentCategories: DocumentCategory[] = [
  'Учредительные',
  'СРО и лицензии',
  'Политики и регламенты',
  'Сертификаты',
  'Презентационные материалы',
]

const vacancyFormatOptions: Array<{ value: Vacancy['format']; label: string }> = [
  { value: 'office', label: 'Офис' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'remote', label: 'Удаленно' },
]

const vacancyEmploymentOptions: Array<{ value: Vacancy['employment']; label: string }> = [
  { value: 'full', label: 'Полная занятость' },
  { value: 'part', label: 'Частичная занятость' },
  { value: 'rotation', label: 'Вахта' },
]

const vacancyExperienceOptions: Array<{ value: Vacancy['experience']; label: string }> = [
  { value: '0', label: 'Без опыта' },
  { value: '1-3', label: '1-3 года' },
  { value: '3-6', label: '3-6 лет' },
  { value: '6+', label: '6+ лет' },
]

const idPrefixByResource: Record<ResourceKey, string> = {
  projects: 'project',
  vacancies: 'vacancy',
  documents: 'doc',
}

const parseResponseMessage = async (response: Response) => {
  try {
    const payload = await response.json()
    return typeof payload?.message === 'string'
      ? payload.message
      : `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

const readFileAsDataUrl = (file: File) => (
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Не удалось прочитать файл'))
    }

    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
)

const createProjectTemplate = (): Project => {
  const id = `project-${crypto.randomUUID().slice(0, 8)}`
  const slug = id

  return {
    id,
    slug,
    year: new Date().getFullYear(),
    title: 'Новый проект',
    shortTitle: 'Новый проект',
    excerpt: 'Краткое описание проекта.',
    heroImage: '/images/object-grs.png',
    gallery: ['/images/object-grs.png'],
    region: 'Республика Татарстан',
    objectType: 'Газораспределительная станция',
    workTypes: ['Шеф-монтаж'],
    passport: {
      period: `${new Date().getFullYear()}`,
      status: 'В работе',
      customer: 'Заказчик',
      contractor: 'ООО «СтройНефтеГаз»',
      inn: '0000000000',
      location: 'РФ',
      objectType: 'Промышленный объект',
      workScope: 'Комплекс работ',
    },
    tasks: ['Описание задачи'],
    solutions: ['Описание решения'],
    results: ['Описание результата'],
    files: [],
    relatedCompetencyIds: [],
  }
}

const createVacancyTemplate = (): Vacancy => {
  const id = `vacancy-${crypto.randomUUID().slice(0, 8)}`
  const slug = id

  return {
    id,
    slug,
    title: 'Новая вакансия',
    city: 'Казань',
    format: 'office',
    dept: 'Производственный департамент',
    employment: 'full',
    experience: '1-3',
    salaryFrom: 100000,
    salaryTo: 150000,
    currency: 'RUB',
    postedAt: new Date().toISOString().slice(0, 10),
    priority: false,
    keywords: ['Монтаж'],
    summary: 'Краткое описание вакансии.',
    responsibilities: ['Описание обязанностей'],
    requirements: ['Описание требований'],
    conditions: ['Описание условий'],
  }
}

const createDocumentTemplate = (): DocumentItem => ({
  id: `doc-${crypto.randomUUID().slice(0, 8)}`,
  title: 'Новый документ',
  date: new Date().toISOString().slice(0, 10),
  type: 'PDF',
  size: '0.2 MB',
  category: 'Презентационные материалы',
  url: '/files/new-document.pdf',
})

const createTemplateByResource = (resource: ResourceKey): ResourceItem => {
  if (resource === 'projects') {
    return createProjectTemplate()
  }

  if (resource === 'vacancies') {
    return createVacancyTemplate()
  }

  return createDocumentTemplate()
}

const getEntityLabel = (item: ResourceItem) => item.title

const getEntityMeta = (item: ResourceItem, resource: ResourceKey) => {
  if (resource === 'projects') {
    const project = item as Project
    return `${project.year} • ${project.region}`
  }

  if (resource === 'vacancies') {
    const vacancy = item as Vacancy
    return `${vacancy.city} • ${vacancy.postedAt}`
  }

  const document = item as DocumentItem
  return `${document.category} • ${document.date}`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toStringValue = (value: unknown) => (typeof value === 'string' ? value : '')

const toNumberValue = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

const toBooleanValue = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  return false
}

const toStringArray = (value: unknown) => (
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
)

const linesToArray = (value: string) => (
  (() => {
    const hasTrailingBreak = /\r?\n$/.test(value)
    const normalized = value
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter(Boolean)

    if (hasTrailingBreak) {
      return [...normalized, '']
    }

    return normalized
  })()
)

const compactStringArray = (value: unknown) => (
  toStringArray(value)
    .map((line) => line.trim())
    .filter(Boolean)
)

const arrayToLines = (value: unknown) => toStringArray(value).join('\n')

const projectFilesToLines = (value: unknown) => {
  if (!Array.isArray(value)) {
    return ''
  }

  const lines = value.map((item) => {
    if (!isRecord(item)) {
      return ''
    }

    const file: ProjectFile = {
      name: toStringValue(item.name),
      type: toStringValue(item.type),
      size: toStringValue(item.size),
      url: toStringValue(item.url),
    }

    if (!file.name && !file.type && !file.size && !file.url) {
      return ''
    }

    return [file.name, file.type, file.size, file.url].join(' | ')
  })

  return lines.join('\n')
}

const linesToProjectFiles = (value: string): ProjectFile[] => (
  value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .map((line) => {
      if (!line) {
        return {
          name: '',
          type: '',
          size: '',
          url: '',
        }
      }

      const [name = '', type = '', size = '', url = ''] = line.split('|').map((part) => part.trim())
      return {
        name,
        type,
        size,
        url,
      }
    })
)

const compactProjectFiles = (value: unknown): ProjectFile[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const files: ProjectFile[] = []

  value.forEach((item) => {
    if (!isRecord(item)) {
      return
    }

    const name = toStringValue(item.name).trim()
    const type = toStringValue(item.type).trim()
    const size = toStringValue(item.size).trim()
    const url = toStringValue(item.url).trim()

    if (!name && !type && !size && !url) {
      return
    }

    files.push({
      name: name || `Файл ${files.length + 1}`,
      type: type || 'PDF',
      size,
      url,
    })
  })

  return files
}

const normalizePayloadBeforeSave = (resource: ResourceKey, item: ResourceItem): ResourceItem => {
  const draft = JSON.parse(JSON.stringify(item)) as Record<string, unknown>

  if (resource === 'projects') {
    draft.gallery = compactStringArray(draft.gallery)
    draft.workTypes = compactStringArray(draft.workTypes)
    draft.relatedCompetencyIds = compactStringArray(draft.relatedCompetencyIds)
    draft.tasks = compactStringArray(draft.tasks)
    draft.solutions = compactStringArray(draft.solutions)
    draft.results = compactStringArray(draft.results)
    draft.files = compactProjectFiles(draft.files)
  }

  if (resource === 'vacancies') {
    draft.keywords = compactStringArray(draft.keywords)
    draft.responsibilities = compactStringArray(draft.responsibilities)
    draft.requirements = compactStringArray(draft.requirements)
    draft.conditions = compactStringArray(draft.conditions)
  }

  return draft as unknown as ResourceItem
}

const translitRuMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

const transliterateRu = (value: string) => (
  value
    .toLowerCase()
    .split('')
    .map((char) => translitRuMap[char] ?? char)
    .join('')
)

const slugify = (value: string) => (
  transliterateRu(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160)
)

const buildEntityId = (prefix: string, seed = '') => {
  const normalizedSeed = slugify(seed).slice(0, 96)
  if (normalizedSeed) {
    return `${prefix}-${normalizedSeed}`.slice(0, 120)
  }

  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

const formSectionClassName = 'border border-white/15 bg-white/[0.02] p-3 sm:p-4'
const fieldLabelClassName = 'flex flex-col gap-2'
const inputClassName =
  'h-11 border border-white/20 bg-black/30 px-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
const selectClassName =
  'h-11 border border-white/20 bg-black/30 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
const textareaClassName =
  'min-h-[110px] border border-white/20 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { authFetch, logout, user } = useAdminAuth()

  const [resource, setResource] = useState<ResourceKey>('projects')
  const [itemsByResource, setItemsByResource] = useState<Record<ResourceKey, ResourceItem[]>>({
    projects: [],
    vacancies: [],
    documents: [],
  })
  const [loadingList, setLoadingList] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editorView, setEditorView] = useState<EditorView>('form')
  const [editorValue, setEditorValue] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')

  const currentResourceMeta = useMemo(
    () => resources.find((item) => item.key === resource) ?? resources[0],
    [resource],
  )

  const currentItems = itemsByResource[resource]

  const filteredItems = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()

    if (!normalizedQuery) {
      return currentItems
    }

    return currentItems.filter((item) => {
      const stack = JSON.stringify(item).toLowerCase()
      return stack.includes(normalizedQuery)
    })
  }, [currentItems, search])

  const parsedEditorState = useMemo(() => {
    try {
      const parsed = JSON.parse(editorValue) as ResourceItem
      return { parsed, parseError: '' }
    } catch (error) {
      if (!editorValue.trim()) {
        return { parsed: null, parseError: '' }
      }

      return {
        parsed: null,
        parseError: error instanceof Error ? error.message : 'Некорректный JSON',
      }
    }
  }, [editorValue])

  const parsedRecord = useMemo(
    () => (isRecord(parsedEditorState.parsed) ? parsedEditorState.parsed : null),
    [parsedEditorState.parsed],
  )

  const loadResource = useCallback(async (resourceKey: ResourceKey) => {
    setLoadingList(true)
    setErrorMessage('')

    try {
      const response = await authFetch(`/api/admin/${resourceKey}`)

      if (!response.ok) {
        throw new Error(await parseResponseMessage(response))
      }

      const list = (await response.json()) as ResourceItem[]

      setItemsByResource((prev) => ({
        ...prev,
        [resourceKey]: list,
      }))
    } catch (loadError) {
      setErrorMessage(loadError instanceof Error ? loadError.message : 'Не удалось загрузить данные')
    } finally {
      setLoadingList(false)
    }
  }, [authFetch])

  useEffect(() => {
    void loadResource(resource)
  }, [loadResource, resource])

  useEffect(() => {
    setSearch('')
    setStatusMessage('')
    setErrorMessage('')
    const template = createTemplateByResource(resource)
    setMode('create')
    setEditorView('form')
    setSelectedId('')
    setEditorValue(JSON.stringify(template, null, 2))
    setSelectedImageFile(null)
    setSelectedImagePreview('')
    setUploadedImageUrl('')
  }, [resource])

  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedImageFile)
    setSelectedImagePreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedImageFile])

  const handleSelect = (item: ResourceItem) => {
    setMode('edit')
    setSelectedId(item.id)
    setEditorView('form')
    setStatusMessage('')
    setErrorMessage('')
    setEditorValue(JSON.stringify(item, null, 2))
  }

  const handleCreateMode = () => {
    setMode('create')
    setSelectedId('')
    setEditorView('form')
    setStatusMessage('')
    setErrorMessage('')
    setEditorValue(JSON.stringify(createTemplateByResource(resource), null, 2))
  }

  const updateEditorDraft = useCallback((updater: (draft: Record<string, unknown>) => void) => {
    try {
      const parsed = JSON.parse(editorValue) as unknown

      if (!isRecord(parsed)) {
        throw new Error('JSON должен быть объектом')
      }

      const draft = JSON.parse(JSON.stringify(parsed)) as Record<string, unknown>
      updater(draft)
      setEditorValue(JSON.stringify(draft, null, 2))
      setErrorMessage('')
    } catch {
      setErrorMessage('Невозможно применить изменения: исправьте формат JSON в редакторе')
    }
  }, [editorValue])

  const setField = useCallback((field: string, value: unknown) => {
    updateEditorDraft((draft) => {
      draft[field] = value
    })
  }, [updateEditorDraft])

  const setArrayFieldFromLines = useCallback((field: string, lines: string) => {
    setField(field, linesToArray(lines))
  }, [setField])

  const setPassportField = useCallback((field: keyof Project['passport'], value: string) => {
    updateEditorDraft((draft) => {
      const currentPassport = isRecord(draft.passport) ? draft.passport : {}
      draft.passport = {
        ...currentPassport,
        [field]: value,
      }
    })
  }, [updateEditorDraft])

  const handleDuplicate = () => {
    if (!parsedRecord) {
      setErrorMessage('Невозможно клонировать: исправьте JSON')
      return
    }

    const draft = JSON.parse(JSON.stringify(parsedRecord)) as Record<string, unknown>
    const title = toStringValue(draft.title)
    const idPrefix = idPrefixByResource[resource]
    const nextId = buildEntityId(idPrefix, `${title} копия`)
    draft.id = nextId

    if (resource !== 'documents') {
      const nextSlug = slugify(`${title}-copy`) || `${idPrefix}-${crypto.randomUUID().slice(0, 8)}`
      draft.slug = nextSlug
    }

    if (title) {
      draft.title = `${title} (копия)`
    }

    setMode('create')
    setSelectedId('')
    setEditorView('form')
    setStatusMessage('Создана копия. Проверьте данные и сохраните как новый элемент.')
    setErrorMessage('')
    setEditorValue(JSON.stringify(draft, null, 2))
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(editorValue)
      setEditorValue(JSON.stringify(parsed, null, 2))
      setStatusMessage('JSON отформатирован')
      setErrorMessage('')
    } catch {
      setErrorMessage('Невозможно форматировать: JSON содержит ошибку')
    }
  }

  const handleValidateJson = () => {
    try {
      JSON.parse(editorValue)
      setStatusMessage('JSON синтаксически корректен')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(
        `Ошибка JSON: ${error instanceof Error ? error.message : 'некорректный формат'}`,
      )
    }
  }

  const handleGenerateId = () => {
    const title = toStringValue(parsedRecord?.title)
    setField('id', buildEntityId(idPrefixByResource[resource], title))
  }

  const handleGenerateSlug = () => {
    if (resource === 'documents') {
      return
    }

    const title = toStringValue(parsedRecord?.title)
    const generated = slugify(title) || `${idPrefixByResource[resource]}-${crypto.randomUUID().slice(0, 8)}`
    setField('slug', generated)
  }

  const handleSave = async () => {
    setSaving(true)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const parsed = JSON.parse(editorValue) as ResourceItem
      const normalized = normalizePayloadBeforeSave(resource, parsed)

      if (!normalized || typeof normalized !== 'object' || typeof normalized.id !== 'string') {
        throw new Error('Payload должен быть JSON-объектом с полем id')
      }

      const isCreate = mode === 'create'
      const endpoint = isCreate
        ? `/api/admin/${resource}`
        : `/api/admin/${resource}/${encodeURIComponent(normalized.id)}`

      const response = await authFetch(endpoint, {
        method: isCreate ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalized),
      })

      if (!response.ok) {
        throw new Error(await parseResponseMessage(response))
      }

      await loadResource(resource)
      setMode('edit')
      setSelectedId(normalized.id)
      setEditorValue(JSON.stringify(normalized, null, 2))
      setStatusMessage(isCreate ? 'Элемент успешно создан' : 'Изменения сохранены')
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const idToDelete = selectedId || (() => {
      try {
        const parsed = JSON.parse(editorValue) as { id?: unknown }
        return typeof parsed.id === 'string' ? parsed.id : ''
      } catch {
        return ''
      }
    })()

    if (!idToDelete) {
      setErrorMessage('Выберите элемент для удаления')
      return
    }

    if (!window.confirm(`Удалить элемент ${idToDelete}? Операция необратима.`)) {
      return
    }

    setSaving(true)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const response = await authFetch(`/api/admin/${resource}/${encodeURIComponent(idToDelete)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await parseResponseMessage(response))
      }

      await loadResource(resource)
      handleCreateMode()
      setStatusMessage('Элемент удален')
    } catch (deleteError) {
      setErrorMessage(deleteError instanceof Error ? deleteError.message : 'Ошибка удаления')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      setErrorMessage('Выберите изображение для загрузки')
      return
    }

    if (!selectedImageFile.type.startsWith('image/')) {
      setErrorMessage('Можно загружать только изображения')
      return
    }

    const maxBytes = 6 * 1024 * 1024
    if (selectedImageFile.size > maxBytes) {
      setErrorMessage('Размер изображения не должен превышать 6MB')
      return
    }

    setUploadingImage(true)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const dataUrl = await readFileAsDataUrl(selectedImageFile)
      const response = await authFetch('/api/admin/assets/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedImageFile.name,
          dataUrl,
        }),
      })

      if (!response.ok) {
        throw new Error(await parseResponseMessage(response))
      }

      const payload = await response.json() as { url?: string }

      if (!payload.url || typeof payload.url !== 'string') {
        throw new Error('Сервер не вернул URL изображения')
      }

      setUploadedImageUrl(payload.url)
      setStatusMessage('Изображение загружено')
    } catch (uploadError) {
      setErrorMessage(uploadError instanceof Error ? uploadError.message : 'Ошибка загрузки изображения')
    } finally {
      setUploadingImage(false)
    }
  }

  const applyUploadedUrlToJson = (target: 'projectHero' | 'projectGallery' | 'documentUrl') => {
    if (!uploadedImageUrl) {
      setErrorMessage('Сначала загрузите изображение')
      return
    }

    try {
      const parsed = JSON.parse(editorValue) as Record<string, unknown>

      if (target === 'projectHero' && resource === 'projects') {
        parsed.heroImage = uploadedImageUrl
      }

      if (target === 'projectGallery' && resource === 'projects') {
        const gallery = Array.isArray(parsed.gallery)
          ? parsed.gallery.filter((item): item is string => typeof item === 'string')
          : []

        if (!gallery.includes(uploadedImageUrl)) {
          gallery.push(uploadedImageUrl)
        }

        parsed.gallery = gallery
      }

      if (target === 'documentUrl' && resource === 'documents') {
        parsed.url = uploadedImageUrl
      }

      setEditorValue(JSON.stringify(parsed, null, 2))
      setStatusMessage('URL изображения добавлен в JSON')
      setErrorMessage('')
    } catch {
      setErrorMessage('Текущий JSON содержит ошибки. Исправьте формат перед подстановкой URL.')
    }
  }

  const handleCopyUploadedUrl = async () => {
    if (!uploadedImageUrl) {
      setErrorMessage('Сначала загрузите изображение')
      return
    }

    try {
      await navigator.clipboard.writeText(uploadedImageUrl)
      setStatusMessage('URL скопирован в буфер обмена')
      setErrorMessage('')
    } catch {
      setErrorMessage('Не удалось скопировать URL. Скопируйте вручную из поля ниже.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const renderProjectForm = () => {
    if (!parsedRecord) {
      return null
    }

    const passport = isRecord(parsedRecord.passport) ? parsedRecord.passport : {}

    return (
      <div className="space-y-3">
        <div className={formSectionClassName}>
          <p className="caption text-white/55">Основные поля проекта</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Название</span>
              <input
                value={toStringValue(parsedRecord.title)}
                onChange={(event) => setField('title', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Короткое название</span>
              <input
                value={toStringValue(parsedRecord.shortTitle)}
                onChange={(event) => setField('shortTitle', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Год</span>
              <input
                type="number"
                value={toNumberValue(parsedRecord.year, new Date().getFullYear())}
                onChange={(event) => setField('year', Number(event.currentTarget.value) || 0)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Регион</span>
              <input
                value={toStringValue(parsedRecord.region)}
                onChange={(event) => setField('region', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Тип объекта</span>
              <input
                value={toStringValue(parsedRecord.objectType)}
                onChange={(event) => setField('objectType', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">ID</span>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={toStringValue(parsedRecord.id)}
                  onChange={(event) => setField('id', event.currentTarget.value)}
                  className={inputClassName}
                />
                <Button type="button" variant="ghost" dark onClick={handleGenerateId}>
                  Сгенерировать
                </Button>
              </div>
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Slug</span>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={toStringValue(parsedRecord.slug)}
                  onChange={(event) => setField('slug', event.currentTarget.value)}
                  className={inputClassName}
                />
                <Button type="button" variant="ghost" dark onClick={handleGenerateSlug}>
                  Из названия
                </Button>
              </div>
            </label>
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Краткое описание</span>
              <textarea
                value={toStringValue(parsedRecord.excerpt)}
                onChange={(event) => setField('excerpt', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
          </div>
        </div>

        <div className={formSectionClassName}>
          <p className="caption text-white/55">Изображения и типы работ</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Hero image URL</span>
              <input
                value={toStringValue(parsedRecord.heroImage)}
                onChange={(event) => setField('heroImage', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Gallery (ссылка в каждой строке)</span>
              <textarea
                value={arrayToLines(parsedRecord.gallery)}
                onChange={(event) => setArrayFieldFromLines('gallery', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Типы работ (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.workTypes)}
                onChange={(event) => setArrayFieldFromLines('workTypes', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Связанные компетенции (ID, строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.relatedCompetencyIds)}
                onChange={(event) =>
                  setArrayFieldFromLines('relatedCompetencyIds', event.currentTarget.value)
                }
                className={textareaClassName}
              />
            </label>
          </div>
        </div>

        <div className={formSectionClassName}>
          <p className="caption text-white/55">Паспорт проекта</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Период</span>
              <input
                value={toStringValue(passport.period)}
                onChange={(event) => setPassportField('period', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Статус</span>
              <input
                value={toStringValue(passport.status)}
                onChange={(event) => setPassportField('status', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Заказчик</span>
              <input
                value={toStringValue(passport.customer)}
                onChange={(event) => setPassportField('customer', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Исполнитель</span>
              <input
                value={toStringValue(passport.contractor)}
                onChange={(event) => setPassportField('contractor', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">ИНН исполнителя</span>
              <input
                value={toStringValue(passport.inn)}
                onChange={(event) => setPassportField('inn', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Локация</span>
              <input
                value={toStringValue(passport.location)}
                onChange={(event) => setPassportField('location', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Тип объекта (паспорт)</span>
              <input
                value={toStringValue(passport.objectType)}
                onChange={(event) => setPassportField('objectType', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Объем работ (паспорт)</span>
              <textarea
                value={toStringValue(passport.workScope)}
                onChange={(event) => setPassportField('workScope', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
          </div>
        </div>

        <div className={formSectionClassName}>
          <p className="caption text-white/55">Задачи, решения, результаты и файлы</p>
          <p className="mt-1 text-xs text-white/45">
            Для файлов формат строки: Название | Тип | Размер | URL
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Задачи (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.tasks)}
                onChange={(event) => setArrayFieldFromLines('tasks', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Решения (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.solutions)}
                onChange={(event) => setArrayFieldFromLines('solutions', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Результаты (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.results)}
                onChange={(event) => setArrayFieldFromLines('results', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Файлы (строка = запись)</span>
              <textarea
                value={projectFilesToLines(parsedRecord.files)}
                onChange={(event) => setField('files', linesToProjectFiles(event.currentTarget.value))}
                className={textareaClassName}
              />
            </label>
          </div>
        </div>
      </div>
    )
  }

  const renderVacancyForm = () => {
    if (!parsedRecord) {
      return null
    }

    return (
      <div className="space-y-3">
        <div className={formSectionClassName}>
          <p className="caption text-white/55">Основные поля вакансии</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Название вакансии</span>
              <input
                value={toStringValue(parsedRecord.title)}
                onChange={(event) => setField('title', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Город</span>
              <input
                value={toStringValue(parsedRecord.city)}
                onChange={(event) => setField('city', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Департамент</span>
              <input
                value={toStringValue(parsedRecord.dept)}
                onChange={(event) => setField('dept', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Дата публикации</span>
              <input
                type="date"
                value={toStringValue(parsedRecord.postedAt)}
                onChange={(event) => setField('postedAt', event.currentTarget.value)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">ID</span>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={toStringValue(parsedRecord.id)}
                  onChange={(event) => setField('id', event.currentTarget.value)}
                  className={inputClassName}
                />
                <Button type="button" variant="ghost" dark onClick={handleGenerateId}>
                  Сгенерировать
                </Button>
              </div>
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Slug</span>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={toStringValue(parsedRecord.slug)}
                  onChange={(event) => setField('slug', event.currentTarget.value)}
                  className={inputClassName}
                />
                <Button type="button" variant="ghost" dark onClick={handleGenerateSlug}>
                  Из названия
                </Button>
              </div>
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Формат работы</span>
              <select
                value={toStringValue(parsedRecord.format)}
                onChange={(event) => setField('format', event.currentTarget.value)}
                className={selectClassName}
              >
                {vacancyFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Тип занятости</span>
              <select
                value={toStringValue(parsedRecord.employment)}
                onChange={(event) => setField('employment', event.currentTarget.value)}
                className={selectClassName}
              >
                {vacancyEmploymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Опыт</span>
              <select
                value={toStringValue(parsedRecord.experience)}
                onChange={(event) => setField('experience', event.currentTarget.value)}
                className={selectClassName}
              >
                {vacancyExperienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Оклад от</span>
              <input
                type="number"
                value={toNumberValue(parsedRecord.salaryFrom)}
                onChange={(event) => setField('salaryFrom', Number(event.currentTarget.value) || 0)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Оклад до</span>
              <input
                type="number"
                value={toNumberValue(parsedRecord.salaryTo)}
                onChange={(event) => setField('salaryTo', Number(event.currentTarget.value) || 0)}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Валюта</span>
              <input
                value={toStringValue(parsedRecord.currency) || 'RUB'}
                onChange={(event) => setField('currency', event.currentTarget.value || 'RUB')}
                className={inputClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Приоритетная вакансия</span>
              <div className="flex h-11 items-center gap-2 border border-white/20 bg-black/30 px-3">
                <input
                  type="checkbox"
                  checked={toBooleanValue(parsedRecord.priority)}
                  onChange={(event) => setField('priority', event.currentTarget.checked)}
                  className="h-4 w-4 accent-red-500"
                />
                <span className="text-sm text-white/80">Закреплять выше остальных</span>
              </div>
            </label>
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Ключевые слова (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.keywords)}
                onChange={(event) => setArrayFieldFromLines('keywords', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Краткое описание</span>
              <textarea
                value={toStringValue(parsedRecord.summary)}
                onChange={(event) => setField('summary', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
          </div>
        </div>

        <div className={formSectionClassName}>
          <p className="caption text-white/55">Детали вакансии</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Обязанности (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.responsibilities)}
                onChange={(event) =>
                  setArrayFieldFromLines('responsibilities', event.currentTarget.value)
                }
                className={textareaClassName}
              />
            </label>
            <label className={fieldLabelClassName}>
              <span className="text-xs text-white/60">Требования (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.requirements)}
                onChange={(event) => setArrayFieldFromLines('requirements', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
            <label className={`${fieldLabelClassName} md:col-span-2`}>
              <span className="text-xs text-white/60">Условия (строка = пункт)</span>
              <textarea
                value={arrayToLines(parsedRecord.conditions)}
                onChange={(event) => setArrayFieldFromLines('conditions', event.currentTarget.value)}
                className={textareaClassName}
              />
            </label>
          </div>
        </div>
      </div>
    )
  }

  const renderDocumentForm = () => {
    if (!parsedRecord) {
      return null
    }

    return (
      <div className={formSectionClassName}>
        <p className="caption text-white/55">Основные поля документа</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className={fieldLabelClassName}>
            <span className="text-xs text-white/60">Название документа</span>
            <input
              value={toStringValue(parsedRecord.title)}
              onChange={(event) => setField('title', event.currentTarget.value)}
              className={inputClassName}
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className="text-xs text-white/60">ID</span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={toStringValue(parsedRecord.id)}
                onChange={(event) => setField('id', event.currentTarget.value)}
                className={inputClassName}
              />
              <Button type="button" variant="ghost" dark onClick={handleGenerateId}>
                Сгенерировать
              </Button>
            </div>
          </label>
          <label className={fieldLabelClassName}>
            <span className="text-xs text-white/60">Дата</span>
            <input
              type="date"
              value={toStringValue(parsedRecord.date)}
              onChange={(event) => setField('date', event.currentTarget.value)}
              className={inputClassName}
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className="text-xs text-white/60">Тип файла</span>
            <input
              value={toStringValue(parsedRecord.type)}
              onChange={(event) => setField('type', event.currentTarget.value)}
              className={inputClassName}
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className="text-xs text-white/60">Размер</span>
            <input
              value={toStringValue(parsedRecord.size)}
              onChange={(event) => setField('size', event.currentTarget.value)}
              className={inputClassName}
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className="text-xs text-white/60">Категория</span>
            <select
              value={toStringValue(parsedRecord.category)}
              onChange={(event) => setField('category', event.currentTarget.value)}
              className={selectClassName}
            >
              {documentCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className="text-xs text-white/60">URL файла</span>
            <input
              value={toStringValue(parsedRecord.url)}
              onChange={(event) => setField('url', event.currentTarget.value)}
              className={inputClassName}
            />
          </label>
        </div>
      </div>
    )
  }

  const renderSimpleForm = () => {
    if (!parsedRecord) {
      return (
        <div className="border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          JSON содержит ошибку. Переключитесь в JSON-режим и исправьте формат.
        </div>
      )
    }

    if (resource === 'projects') {
      return renderProjectForm()
    }

    if (resource === 'vacancies') {
      return renderVacancyForm()
    }

    return renderDocumentForm()
  }

  return (
    <>
      <Seo
        title="Админ-панель"
        description="Защищенная административная панель CRUD для проектов, вакансий и документов."
        canonicalPath="/admin"
      />

      <main className="min-h-screen bg-graphite px-3 py-4 text-white sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border border-white/15 bg-black/25 px-4 py-4">
            <div>
              <p className="caption text-white/45">ADMIN PANEL</p>
              <h1 className="mt-2 text-lg font-semibold">Управление контентом</h1>
              <p className="mt-1 text-sm text-white/65">{currentResourceMeta.description}</p>
              <p className="mt-1 text-xs text-white/50">
                Используйте «Простой режим» для быстрых правок без редактирования JSON.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.14em] text-white/55">
                {user?.username ?? 'admin'}
              </span>
              <Button type="button" variant="ghost" dark onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          </header>

          <div className="flex flex-wrap gap-2">
            {resources.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setResource(item.key)}
                className={`border px-4 py-2 text-[0.62rem] uppercase tracking-[0.18em] transition ${
                  resource === item.key
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            <aside className="border border-white/15 bg-black/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="caption text-white/55">Список</p>
                <button
                  type="button"
                  onClick={() => void loadResource(resource)}
                  className="text-[0.6rem] uppercase tracking-[0.16em] text-white/70 hover:text-white"
                >
                  Обновить
                </button>
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Поиск по id и тексту"
                className="mt-3 h-10 w-full border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />

              <p className="mt-2 text-xs text-white/45">
                Показано: {filteredItems.length} из {currentItems.length}
              </p>

              <div className="mt-3 max-h-[58vh] space-y-2 overflow-auto pr-1">
                {loadingList ? (
                  <p className="text-sm text-white/60">Загрузка...</p>
                ) : filteredItems.length ? (
                  filteredItems.map((item) => {
                    const isSelected = item.id === selectedId

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`w-full border px-3 py-3 text-left transition ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-white/15 bg-white/[0.02] hover:border-white/35'
                        }`}
                      >
                        <p className="text-xs uppercase tracking-[0.14em] text-white/55">{item.id}</p>
                        <p className="mt-1 text-sm text-white">{getEntityLabel(item)}</p>
                        <p className="mt-1 text-xs text-white/50">{getEntityMeta(item, resource)}</p>
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-white/55">Элементы не найдены</p>
                )}
              </div>
            </aside>

            <section className="border border-white/15 bg-black/25 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="caption text-white/55">Редактор</p>
                  <p className="mt-1 text-sm text-white/70">
                    Режим: {mode === 'create' ? 'создание' : `редактирование (${selectedId})`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" dark onClick={handleCreateMode}>
                    Новый
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    dark
                    onClick={handleDuplicate}
                    disabled={!parsedRecord}
                  >
                    Клонировать
                  </Button>
                  <Button type="button" dark onClick={handleSave} disabled={saving}>
                    {saving ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    dark
                    onClick={handleDelete}
                    disabled={saving || (!selectedId && mode !== 'edit')}
                    className="border-rose-400/45 text-rose-200 hover:border-rose-300 hover:text-white"
                  >
                    Удалить
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-white/15 bg-white/[0.02] p-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorView('form')}
                    className={`border px-3 py-2 text-[0.6rem] uppercase tracking-[0.15em] transition ${
                      editorView === 'form'
                        ? 'border-accent bg-accent/10 text-white'
                        : 'border-white/20 text-white/70 hover:border-white/35 hover:text-white'
                    }`}
                  >
                    Простой режим
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorView('json')}
                    className={`border px-3 py-2 text-[0.6rem] uppercase tracking-[0.15em] transition ${
                      editorView === 'json'
                        ? 'border-accent bg-accent/10 text-white'
                        : 'border-white/20 text-white/70 hover:border-white/35 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" dark onClick={handleFormatJson}>
                    Форматировать JSON
                  </Button>
                  <Button type="button" variant="ghost" dark onClick={handleValidateJson}>
                    Проверить JSON
                  </Button>
                </div>
              </div>

              {editorView === 'form' ? (
                <div className="mt-4">
                  {parsedEditorState.parseError ? (
                    <div className="mb-3 border border-rose-300/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                      <p>JSON содержит ошибку: {parsedEditorState.parseError}</p>
                      <button
                        type="button"
                        onClick={() => setEditorView('json')}
                        className="mt-2 text-xs uppercase tracking-[0.14em] text-rose-100 underline underline-offset-4"
                      >
                        Открыть JSON-режим для исправления
                      </button>
                    </div>
                  ) : null}
                  {renderSimpleForm()}
                </div>
              ) : (
                <textarea
                  value={editorValue}
                  onChange={(event) => setEditorValue(event.currentTarget.value)}
                  spellCheck={false}
                  className="mt-4 h-[62vh] w-full border border-white/20 bg-[#0e1218] p-3 font-mono text-[0.8rem] leading-relaxed text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              )}

              <div className="mt-4 border border-white/15 bg-white/[0.02] p-3">
                <p className="caption text-white/55">Загрузка фото</p>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0] ?? null
                        setSelectedImageFile(file)
                      }}
                      className="block w-full text-xs text-white/80 file:mr-3 file:cursor-pointer file:border file:border-white/25 file:bg-white/5 file:px-3 file:py-2 file:text-[0.62rem] file:uppercase file:tracking-[0.14em] file:text-white hover:file:border-white/45"
                    />
                    <p className="mt-2 text-xs text-white/50">
                      Допустимые форматы: JPG, PNG, WEBP, AVIF, GIF. До 6MB.
                    </p>
                  </div>

                  <Button
                    type="button"
                    dark
                    onClick={handleImageUpload}
                    disabled={uploadingImage || !selectedImageFile}
                    className="h-10"
                  >
                    {uploadingImage ? 'Загрузка...' : 'Загрузить фото'}
                  </Button>
                </div>

                {(selectedImagePreview || uploadedImageUrl) ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                    <div className="border border-white/20 bg-black/30 p-1">
                      {selectedImagePreview ? (
                        <img
                          src={selectedImagePreview}
                          alt="Предпросмотр выбранного изображения"
                          className="h-28 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs text-white/45">
                          Нет предпросмотра
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-white/65">
                        URL: {uploadedImageUrl || 'не загружено'}
                      </p>
                      {uploadedImageUrl ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            dark
                            onClick={handleCopyUploadedUrl}
                          >
                            Копировать URL
                          </Button>
                          {resource === 'projects' ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                dark
                                onClick={() => applyUploadedUrlToJson('projectHero')}
                              >
                                В heroImage
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                dark
                                onClick={() => applyUploadedUrlToJson('projectGallery')}
                              >
                                В gallery
                              </Button>
                            </>
                          ) : null}
                          {resource === 'documents' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              dark
                              onClick={() => applyUploadedUrlToJson('documentUrl')}
                            >
                              В поле url
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {statusMessage ? <p className="mt-3 text-sm text-emerald-300">{statusMessage}</p> : null}
              {errorMessage ? <p className="mt-3 text-sm text-rose-300">{errorMessage}</p> : null}
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

