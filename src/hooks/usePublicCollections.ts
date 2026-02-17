import { useEffect, useMemo, useState } from 'react'
import { documents as fallbackDocuments, projects as fallbackProjects, vacancies as fallbackVacancies } from '../data'
import type { DocumentItem, Project, Vacancy } from '../types/models'

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: string | null
}

interface CachedCollection<T> {
  savedAt: number
  data: T[]
}

const CACHE_PREFIX = 'sng:public:cache:'
const CACHE_TTL_MS = 5 * 60 * 1000
const memoryCache = new Map<string, CachedCollection<unknown>>()

const getCacheKey = (endpoint: string) => `${CACHE_PREFIX}${endpoint}`

const isFresh = (savedAt: number) => Date.now() - savedAt <= CACHE_TTL_MS

const readCachedCollection = <T,>(endpoint: string): T[] | null => {
  const key = getCacheKey(endpoint)
  const memoryEntry = memoryCache.get(key) as CachedCollection<T> | undefined

  if (memoryEntry) {
    if (isFresh(memoryEntry.savedAt)) {
      return memoryEntry.data
    }

    memoryCache.delete(key)
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(key)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as CachedCollection<T>

    if (!parsed || !Array.isArray(parsed.data) || typeof parsed.savedAt !== 'number') {
      window.sessionStorage.removeItem(key)
      return null
    }

    if (!isFresh(parsed.savedAt)) {
      window.sessionStorage.removeItem(key)
      return null
    }

    memoryCache.set(key, parsed as CachedCollection<unknown>)
    return parsed.data
  } catch {
    return null
  }
}

const writeCachedCollection = <T,>(endpoint: string, data: T[]) => {
  const key = getCacheKey(endpoint)
  const payload: CachedCollection<T> = {
    savedAt: Date.now(),
    data,
  }

  memoryCache.set(key, payload as CachedCollection<unknown>)

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Ignore storage quota errors.
  }
}

const loadCollection = async <T,>(endpoint: string, signal?: AbortSignal): Promise<T[]> => {
  const response = await fetch(endpoint, {
    method: 'GET',
    cache: 'default',
    signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = (await response.json()) as unknown

  if (!Array.isArray(payload)) {
    throw new Error('Payload must be an array')
  }

  return payload as T[]
}

const usePublicCollection = <T,>(
  endpoint: string,
  fallbackData: T[],
): UseCollectionResult<T> => {
  const initialCachedData = useMemo(() => readCachedCollection<T>(endpoint), [endpoint])
  const [data, setData] = useState<T[]>(initialCachedData ?? fallbackData)
  const [loading, setLoading] = useState(initialCachedData === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const run = async () => {
      if (!initialCachedData) {
        setLoading(true)
      }

      try {
        const remoteData = await loadCollection<T>(endpoint, controller.signal)

        if (!cancelled) {
          setData(remoteData)
          writeCachedCollection(endpoint, remoteData)
          setError(null)
        }
      } catch (loadError) {
        if (cancelled || controller.signal.aborted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Data load failed')

        if (!initialCachedData) {
          setData(fallbackData)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [endpoint, fallbackData, initialCachedData])

  return { data, loading, error }
}

export const usePublicProjects = () => {
  return usePublicCollection<Project>('/api/public/projects', fallbackProjects)
}

export const usePublicVacancies = () => {
  return usePublicCollection<Vacancy>('/api/public/vacancies', fallbackVacancies)
}

export const usePublicDocuments = () => {
  return usePublicCollection<DocumentItem>('/api/public/documents', fallbackDocuments)
}
