import { useEffect, useMemo, useState } from 'react'
import {
  documents as fallbackDocuments,
  projects as fallbackProjects,
  siteSettings as fallbackSiteSettings,
  vacancies as fallbackVacancies,
} from '../data'
import type { DocumentItem, Project, SiteSettings, Vacancy } from '../types/models'

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: string | null
}

interface UseValueResult<T> {
  data: T
  loading: boolean
  error: string | null
}

interface CachedCollection<T> {
  savedAt: number
  data: T[]
}

interface CachedValue<T> {
  savedAt: number
  data: T
}

const CACHE_PREFIX = 'sng:public:cache:'
const CACHE_TTL_MS = 5 * 60 * 1000
const memoryCollectionCache = new Map<string, CachedCollection<unknown>>()
const memoryValueCache = new Map<string, CachedValue<unknown>>()

const getCacheKey = (endpoint: string) => `${CACHE_PREFIX}${endpoint}`

const isFresh = (savedAt: number) => Date.now() - savedAt <= CACHE_TTL_MS

const readCachedCollection = <T,>(endpoint: string): T[] | null => {
  const key = getCacheKey(endpoint)
  const memoryEntry = memoryCollectionCache.get(key) as CachedCollection<T> | undefined

  if (memoryEntry) {
    if (isFresh(memoryEntry.savedAt)) {
      return memoryEntry.data
    }

    memoryCollectionCache.delete(key)
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

    memoryCollectionCache.set(key, parsed as CachedCollection<unknown>)
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

  memoryCollectionCache.set(key, payload as CachedCollection<unknown>)

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Ignore storage quota errors.
  }
}

const readCachedValue = <T,>(
  endpoint: string,
  isValidData: (value: unknown) => value is T,
): T | null => {
  const key = getCacheKey(endpoint)
  const memoryEntry = memoryValueCache.get(key) as CachedValue<T> | undefined

  if (memoryEntry) {
    if (isFresh(memoryEntry.savedAt)) {
      return memoryEntry.data
    }

    memoryValueCache.delete(key)
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(key)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as CachedValue<unknown>

    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      !isValidData(parsed.data)
    ) {
      window.sessionStorage.removeItem(key)
      return null
    }

    if (!isFresh(parsed.savedAt)) {
      window.sessionStorage.removeItem(key)
      return null
    }

    const typed = parsed as CachedValue<T>
    memoryValueCache.set(key, typed as CachedValue<unknown>)
    return typed.data
  } catch {
    return null
  }
}

const writeCachedValue = <T,>(endpoint: string, data: T) => {
  const key = getCacheKey(endpoint)
  const payload: CachedValue<T> = {
    savedAt: Date.now(),
    data,
  }

  memoryValueCache.set(key, payload as CachedValue<unknown>)

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

const loadValue = async <T,>(endpoint: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(endpoint, {
    method: 'GET',
    cache: 'default',
    signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return (await response.json()) as T
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

const usePublicValue = <T,>(
  endpoint: string,
  fallbackData: T,
  isValidData: (value: unknown) => value is T,
): UseValueResult<T> => {
  const initialCachedData = useMemo(
    () => readCachedValue<T>(endpoint, isValidData),
    [endpoint, isValidData],
  )
  const [data, setData] = useState<T>(initialCachedData ?? fallbackData)
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
        const remoteData = await loadValue<T>(endpoint, controller.signal)

        if (!cancelled) {
          if (!isValidData(remoteData)) {
            throw new Error('Payload has invalid structure')
          }

          setData(remoteData)
          writeCachedValue(endpoint, remoteData)
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
  }, [endpoint, fallbackData, initialCachedData, isValidData])

  return { data, loading, error }
}

const isSiteSettings = (value: unknown): value is SiteSettings => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const candidate = value as { careers?: unknown }

  if (!candidate.careers || typeof candidate.careers !== 'object' || Array.isArray(candidate.careers)) {
    return false
  }

  const careers = candidate.careers as {
    vacanciesEnabled?: unknown
    attractionTitle?: unknown
    attractionText?: unknown
    attractionHighlights?: unknown
  }

  return (
    typeof careers.vacanciesEnabled === 'boolean' &&
    typeof careers.attractionTitle === 'string' &&
    typeof careers.attractionText === 'string' &&
    Array.isArray(careers.attractionHighlights)
  )
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

export const usePublicSiteSettings = () => {
  return usePublicValue<SiteSettings>(
    '/api/public/site-settings',
    fallbackSiteSettings,
    isSiteSettings,
  )
}
