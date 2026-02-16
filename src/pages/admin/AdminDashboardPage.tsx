import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../admin/AdminAuthProvider'
import { Seo } from '../../components/seo/Seo'
import { Button } from '../../components/ui/Button'
import type { DocumentItem, Project, Vacancy } from '../../types/models'

type ResourceKey = 'projects' | 'vacancies' | 'documents'
type ResourceItem = Project | Vacancy | DocumentItem

const resources: Array<{ key: ResourceKey; label: string; description: string }> = [
  { key: 'projects', label: 'Проекты', description: 'Управление проектным портфелем' },
  { key: 'vacancies', label: 'Вакансии', description: 'Управление кадровыми позициями' },
  { key: 'documents', label: 'Документы', description: 'Управление библиотекой документов' },
]

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

const getEntityLabel = (item: ResourceItem, resource: ResourceKey) => {
  if (resource === 'projects' || resource === 'vacancies') {
    return item.title
  }

  return item.title
}

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
    setStatusMessage('')
    setErrorMessage('')
    setEditorValue(JSON.stringify(item, null, 2))
  }

  const handleCreateMode = () => {
    setMode('create')
    setSelectedId('')
    setStatusMessage('')
    setErrorMessage('')
    setEditorValue(JSON.stringify(createTemplateByResource(resource), null, 2))
  }

  const handleSave = async () => {
    setSaving(true)
    setStatusMessage('')
    setErrorMessage('')

    try {
      const parsed = JSON.parse(editorValue) as ResourceItem

      if (!parsed || typeof parsed !== 'object' || typeof parsed.id !== 'string') {
        throw new Error('Payload должен быть JSON-объектом с полем id')
      }

      const isCreate = mode === 'create'
      const endpoint = isCreate
        ? `/api/admin/${resource}`
        : `/api/admin/${resource}/${encodeURIComponent(parsed.id)}`

      const response = await authFetch(endpoint, {
        method: isCreate ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
      })

      if (!response.ok) {
        throw new Error(await parseResponseMessage(response))
      }

      await loadResource(resource)
      setMode('edit')
      setSelectedId(parsed.id)
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

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
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
                placeholder="Поиск"
                className="mt-3 h-10 w-full border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />

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
                        <p className="mt-1 text-sm text-white">{getEntityLabel(item, resource)}</p>
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
                  <p className="caption text-white/55">Редактор JSON</p>
                  <p className="mt-1 text-sm text-white/70">
                    Режим: {mode === 'create' ? 'создание' : `редактирование (${selectedId})`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" dark onClick={handleCreateMode}>
                    Новый
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
                            onClick={() => void navigator.clipboard.writeText(uploadedImageUrl)}
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

              <textarea
                value={editorValue}
                onChange={(event) => setEditorValue(event.currentTarget.value)}
                spellCheck={false}
                className="mt-4 h-[64vh] w-full border border-white/20 bg-[#0e1218] p-3 font-mono text-[0.8rem] leading-relaxed text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />

              {statusMessage ? <p className="mt-3 text-sm text-emerald-300">{statusMessage}</p> : null}
              {errorMessage ? <p className="mt-3 text-sm text-rose-300">{errorMessage}</p> : null}
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

